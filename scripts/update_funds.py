from __future__ import annotations

import json
import math
import re
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from lxml import html as lxml_html


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
FUNDS_PATH = DATA_DIR / "funds.json"
PRODUCTS_PATH = DATA_DIR / "products.json"
SOURCE_BASE = "https://pub.insure.or.kr"
FUND_DAY_URL = f"{SOURCE_BASE}/compareDis/variableInsrn/fundDay/list.do"
PROD_FUND_EXCEL_URL = f"{SOURCE_BASE}/compareDis/variableInsrn/prodFund/excelDownload.do"


def fetch_bytes(url: str) -> bytes:
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 VariableInsuranceManager/1.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    )
    with urlopen(request, timeout=60) as response:
        return response.read()


def fetch_fund_html(target: str | None = None) -> bytes:
    params = {"pageUnit": "9999"}
    if target:
        params["search_stdYmd"] = target
    return fetch_bytes(f"{FUND_DAY_URL}?{urlencode(params)}")


def parse_number(value: str | None) -> float | None:
    if value is None:
        return None
    cleaned = str(value).strip().replace(",", "")
    if cleaned in {"", "-", "nan", "None"}:
        return None
    match = re.search(r"-?\d+(?:\.\d+)?", cleaned)
    if not match:
        return None
    try:
        number = float(match.group(0))
    except ValueError:
        return None
    if math.isnan(number):
        return None
    return number


def cell_text(cell: Any) -> str:
    return " ".join(part.strip() for part in cell.itertext() if part.strip())


def hidden_text(row: Any, prefix: str) -> str:
    values = row.xpath(f'.//*[starts-with(@id, "{prefix}")]/text()')
    return values[0].strip() if values else ""


def return_percent(cell: Any) -> float | None:
    values = cell.xpath('.//span[contains(@class, "sr_only")]/text()')
    raw = values[-1] if values else cell_text(cell)
    number = parse_number(raw)
    if number is None:
        return None
    text = cell_text(cell)
    class_name = cell.get("class", "")
    if "c_blue" in class_name or "▼" in text or text.strip().startswith("-"):
        return -abs(number)
    return number


def normalize_date(yyyymmdd: str) -> str:
    digits = re.sub(r"\D", "", yyyymmdd)
    if len(digits) == 8:
        return f"{digits[:4]}-{digits[4:6]}-{digits[6:8]}"
    return yyyymmdd


def fund_id(member_cd: str, fund_cd: str) -> str:
    return f"{member_cd}-{fund_cd}".replace(" ", "")


def parse_fund_snapshot(html_bytes: bytes) -> list[dict[str, Any]]:
    root = lxml_html.fromstring(html_bytes, parser=lxml_html.HTMLParser(encoding="utf-8"))
    rows = root.xpath("//table//tbody/tr")
    funds: list[dict[str, Any]] = []

    for row in rows:
        cells = row.xpath("./td")
        if len(cells) < 25:
            continue

        std_ymd = hidden_text(row, "l_stdYmd_")
        member_cd = hidden_text(row, "l_memberCd_")
        insurer = hidden_text(row, "l_memberNm_") or cell_text(cells[1])
        fund_cd = hidden_text(row, "l_fundCd_")
        name = hidden_text(row, "l_fundNm_") or cell_text(cells[2])

        if not insurer or not name or not fund_cd:
            continue

        funds.append(
            {
                "id": fund_id(member_cd, fund_cd),
                "stdDate": normalize_date(std_ymd),
                "memberCd": member_cd,
                "fundCd": fund_cd,
                "insurer": insurer,
                "name": name,
                "settingDate": cell_text(cells[3]),
                "nav": parse_number(cell_text(cells[4])),
                "oneYear": return_percent(cells[5]),
                "threeYear": return_percent(cells[6]),
                "fiveYear": return_percent(cells[7]),
                "sevenYear": return_percent(cells[8]),
                "tenYear": return_percent(cells[9]),
                "fifteenYear": return_percent(cells[10]),
                "cumulative": return_percent(cells[11]),
                "fees": {
                    "management": parse_number(cell_text(cells[12])),
                    "discretionary": parse_number(cell_text(cells[13])),
                    "trust": parse_number(cell_text(cells[14])),
                    "admin": parse_number(cell_text(cells[15])),
                    "total": parse_number(cell_text(cells[16])),
                },
                "assetMix": {
                    "stock": parse_number(cell_text(cells[17])),
                    "bond": parse_number(cell_text(cells[18])),
                    "fund": parse_number(cell_text(cells[19])),
                    "liquidity": parse_number(cell_text(cells[20])),
                    "other": parse_number(cell_text(cells[21])),
                },
                "bigType": cell_text(cells[22]),
                "smallType": cell_text(cells[23]),
                "category": cell_text(cells[23]) or cell_text(cells[22]),
                "netAssets": parse_number(cell_text(cells[24])),
                "source": "생명보험협회 공시실",
                "sourceUrl": f"{SOURCE_BASE}/compareDis/variableInsrn/fundDay/list.do",
                "report": "펀드현황",
            }
        )

    return funds


def snapshot_by_id(funds: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {fund["id"]: fund for fund in funds if fund.get("id")}


def fetch_snapshot_near(target: date, max_back_days: int = 10) -> tuple[str | None, list[dict[str, Any]]]:
    for offset in range(max_back_days + 1):
        candidate = target - timedelta(days=offset)
        target_text = candidate.strftime("%Y-%m-%d")
        funds = parse_fund_snapshot(fetch_fund_html(target_text))
        if funds:
            return target_text, funds
    return None, []


def enrich_returns(current: list[dict[str, Any]], previous: list[dict[str, Any]], month_ago: list[dict[str, Any]]) -> None:
    prev_map = snapshot_by_id(previous)
    month_map = snapshot_by_id(month_ago)

    for fund in current:
        nav = fund.get("nav")
        prev = prev_map.get(fund["id"])
        month = month_map.get(fund["id"])

        day_rate = None
        month_rate = None

        if nav and prev and prev.get("nav"):
            day_rate = (nav / prev["nav"]) - 1
            fund["previousNav"] = prev["nav"]
            fund["previousStdDate"] = prev.get("stdDate")

        if nav and month and month.get("nav"):
            month_rate = (nav / month["nav"]) - 1
            fund["monthAgoNav"] = month["nav"]
            fund["monthAgoStdDate"] = month.get("stdDate")

        one_year = fund.get("oneYear")
        fund["day"] = day_rate if day_rate is not None else 0
        fund["month"] = month_rate if month_rate is not None else ((one_year or 0) / 100 / 12)
        fund["year"] = (one_year or 0) / 100
        fund["threeYearRate"] = (fund.get("threeYear") or 0) / 100
        fund["fiveYearRate"] = (fund.get("fiveYear") or 0) / 100


def parse_products() -> list[dict[str, Any]]:
    try:
        import pandas as pd
    except Exception:
        return []

    try:
        payload = fetch_bytes(PROD_FUND_EXCEL_URL)
        xlsx = DATA_DIR / "_prodFund.xlsx"
        xlsx.write_bytes(payload)
        raw = pd.read_excel(xlsx, header=None)
    except Exception:
        return []
    finally:
        try:
            xlsx.unlink()
        except Exception:
            pass

    products: list[dict[str, Any]] = []
    for _, row in raw.iloc[4:].iterrows():
        insurer = row.get(1)
        product = row.get(2)
        if not isinstance(insurer, str) or not isinstance(product, str):
            continue
        products.append(
            {
                "insurer": insurer,
                "product": product,
                "insuranceType": row.get(3) if isinstance(row.get(3), str) else "",
                "productType": row.get(4) if isinstance(row.get(4), str) else "",
                "saleStartDate": str(row.get(5))[:10] if row.get(5) == row.get(5) else "",
                "saleEndDate": str(row.get(6))[:10] if row.get(6) == row.get(6) else "",
                "fundCount": int(row.get(7)) if row.get(7) == row.get(7) else None,
            }
        )
    return products


def build_payload() -> dict[str, Any]:
    current = parse_fund_snapshot(fetch_fund_html())
    if not current:
        raise RuntimeError("공시실 펀드현황 데이터를 찾지 못했습니다.")

    current_date_text = current[0]["stdDate"]
    current_date = datetime.strptime(current_date_text, "%Y-%m-%d").date()

    previous_date, previous = fetch_snapshot_near(current_date - timedelta(days=1))
    month_date, month_ago = fetch_snapshot_near(current_date - timedelta(days=30))
    enrich_returns(current, previous, month_ago)

    insurers = sorted({fund["insurer"] for fund in current})
    payload = {
        "meta": {
            "dataset": "life-insurance-variable-funds",
            "sourceName": "생명보험협회 공시실 펀드현황",
            "sourceUrl": f"{SOURCE_BASE}/compareDis/variableInsrn/fundDay/list.do",
            "stdDate": current_date_text,
            "previousStdDate": previous_date,
            "monthAgoStdDate": month_date,
            "fetchedAt": datetime.now().isoformat(timespec="seconds"),
            "fundCount": len(current),
            "insurerCount": len(insurers),
            "insurers": insurers,
            "notice": "고객별 실제 적립금이 아니라 공시 펀드 기준가와 수익률 기반의 추정 데이터입니다.",
        },
        "funds": current,
    }
    return payload


def main() -> int:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    payload = build_payload()
    FUNDS_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    products = parse_products()
    PRODUCTS_PATH.write_text(
        json.dumps(
            {
                "meta": {
                    "sourceName": "생명보험협회 공시실 상품별 펀드운영현황",
                    "sourceUrl": f"{SOURCE_BASE}/compareDis/variableInsrn/prodFund/list.do",
                    "fetchedAt": datetime.now().isoformat(timespec="seconds"),
                    "productCount": len(products),
                },
                "products": products,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    meta = payload["meta"]
    print(
        json.dumps(
            {
                "ok": True,
                "fundCount": meta["fundCount"],
                "insurerCount": meta["insurerCount"],
                "stdDate": meta["stdDate"],
                "previousStdDate": meta["previousStdDate"],
                "monthAgoStdDate": meta["monthAgoStdDate"],
                "output": str(FUNDS_PATH),
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        message = str(exc) or repr(exc)
        if "WinError 10013" in message:
            message = (
                f"{message} - 생명보험협회 공시 사이트 접속이 현재 실행 환경의 네트워크/방화벽 권한에 의해 차단되었습니다."
            )
        print(json.dumps({"ok": False, "error": message}, ensure_ascii=False), file=sys.stderr)
        raise SystemExit(1)
