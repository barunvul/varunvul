const SOURCE_BASE = "https://pub.insure.or.kr";
const FUND_DAY_URL = `${SOURCE_BASE}/compareDis/variableInsrn/fundDay/list.do`;
const FUND_DAY_EXCEL_URL = `${SOURCE_BASE}/compareDis/variableInsrn/fundDay/excelDownload.do`;
const DEFAULT_FETCH_TIMEOUT_MS = 25000;

function qs(params) {
  return new URLSearchParams(params).toString();
}

function todayInSeoulDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

async function fetchText(url, timeoutMs = DEFAULT_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) VariableInsuranceManager/1.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.7,en;q=0.6",
        referer: `${SOURCE_BASE}/compareDis/variableInsrn/fundDay/list.do`,
      },
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`생명보험협회 응답 오류 ${response.status}: ${body.replace(/\s+/g, " ").slice(0, 180)}`);
    }
    return response.text();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`생명보험협회 공시 사이트 응답이 ${Math.round(timeoutMs / 1000)}초 안에 오지 않았습니다.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function stripTags(value = "") {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function cellsFromRow(rowHtml) {
  return [...rowHtml.matchAll(/<td\b[\s\S]*?<\/td>/gi)].map((match) => match[0]);
}

function hiddenText(rowHtml, prefix) {
  const pattern = new RegExp(`<label[^>]+id=["']${prefix}[^"']*["'][^>]*>([\\s\\S]*?)<\\/label>`, "i");
  const match = rowHtml.match(pattern);
  return match ? stripTags(match[1]) : "";
}

function parseNumber(value) {
  const cleaned = String(value ?? "").replace(/,/g, "");
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const number = Number(match[0]);
  return Number.isFinite(number) ? number : null;
}

function returnPercent(cellHtml) {
  const srValues = [...cellHtml.matchAll(/<span[^>]*class=["'][^"']*sr_only[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi)];
  const raw = srValues.length ? stripTags(srValues.at(-1)[1]) : stripTags(cellHtml);
  const number = parseNumber(raw);
  if (number === null) return null;
  const text = stripTags(cellHtml);
  const className = cellHtml.match(/class=["']([^"']+)["']/i)?.[1] || "";
  if (className.includes("c_blue") || text.includes("▼") || text.trim().startsWith("-")) return -Math.abs(number);
  return number;
}

function normalizeDate(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  return value || null;
}

function fundId(memberCd, fundCd) {
  return `${memberCd}-${fundCd}`.replace(/\s+/g, "");
}

async function fetchFundHtml(targetDate) {
  const params = { pageUnit: "9999" };
  if (targetDate) params.search_stdYmd = targetDate;
  return fetchText(`${FUND_DAY_URL}?${qs(params)}`);
}

async function fetchFundExcelHtml(targetDate) {
  const params = { pageUnit: "9999" };
  if (targetDate) params.search_stdYmd = targetDate;
  return fetchText(`${FUND_DAY_EXCEL_URL}?${qs(params)}`);
}

export function parseFundSnapshot(html) {
  const bodyMatch = html.match(/<tbody[\s\S]*?<\/tbody>/i);
  const source = bodyMatch ? bodyMatch[0] : html;
  const rows = [...source.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((match) => match[0]);
  const funds = [];

  for (const row of rows) {
    if (!row.includes("l_fundCd_")) continue;
    const cells = cellsFromRow(row);
    if (cells.length < 25) continue;

    const stdYmd = hiddenText(row, "l_stdYmd_");
    const memberCd = hiddenText(row, "l_memberCd_");
    const fundCd = hiddenText(row, "l_fundCd_");
    const insurer = hiddenText(row, "l_memberNm_") || stripTags(cells[1]);
    const name = hiddenText(row, "l_fundNm_") || stripTags(cells[2]);
    if (!memberCd || !fundCd || !insurer || !name) continue;

    funds.push({
      id: fundId(memberCd, fundCd),
      stdDate: normalizeDate(stdYmd),
      memberCd,
      fundCd,
      insurer,
      name,
      settingDate: stripTags(cells[3]),
      nav: parseNumber(stripTags(cells[4])),
      oneYear: returnPercent(cells[5]),
      threeYear: returnPercent(cells[6]),
      fiveYear: returnPercent(cells[7]),
      sevenYear: returnPercent(cells[8]),
      tenYear: returnPercent(cells[9]),
      fifteenYear: returnPercent(cells[10]),
      cumulative: returnPercent(cells[11]),
      fees: {
        management: parseNumber(stripTags(cells[12])),
        discretionary: parseNumber(stripTags(cells[13])),
        trust: parseNumber(stripTags(cells[14])),
        admin: parseNumber(stripTags(cells[15])),
        total: parseNumber(stripTags(cells[16])),
      },
      assetMix: {
        stock: parseNumber(stripTags(cells[17])),
        bond: parseNumber(stripTags(cells[18])),
        fund: parseNumber(stripTags(cells[19])),
        liquidity: parseNumber(stripTags(cells[20])),
        other: parseNumber(stripTags(cells[21])),
      },
      bigType: stripTags(cells[22]),
      smallType: stripTags(cells[23]),
      category: stripTags(cells[23]) || stripTags(cells[22]),
      netAssets: parseNumber(stripTags(cells[24])),
      source: "생명보험협회 공시실",
      sourceUrl: FUND_DAY_URL,
      report: "펀드현황",
    });
  }

  const seen = new Set();
  return funds.filter((fund) => {
    const key = [fund.stdDate, fund.insurer, fund.fundCd, fund.name, fund.nav].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseFundExcelSnapshot(html, targetDate = null) {
  const source = String(html || "");
  const rows = [...source.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((match) => match[0]);
  const funds = [];

  for (const row of rows) {
    const cells = cellsFromRow(row);
    if (cells.length < 9) continue;

    const insurer = stripTags(cells[0]);
    const fundCd = stripTags(cells[1]);
    const name = stripTags(cells[2]);
    const nav = parseNumber(stripTags(cells[4]));
    if (!insurer || !fundCd || !name || nav === null || insurer.includes("보험사명")) continue;

    funds.push({
      id: fundId(insurer, fundCd),
      stdDate: targetDate,
      memberCd: null,
      fundCd,
      insurer,
      name,
      settingDate: stripTags(cells[3]),
      nav,
      oneYear: null,
      threeYear: null,
      fiveYear: null,
      sevenYear: null,
      tenYear: null,
      fifteenYear: null,
      cumulative: null,
      fees: {
        management: null,
        discretionary: null,
        trust: null,
        admin: null,
        total: null,
        other: parseNumber(stripTags(cells[11])),
        fundOfFunds: parseNumber(stripTags(cells[12])),
      },
      assetMix: {
        stock: null,
        bond: null,
        fund: null,
        liquidity: null,
        other: null,
      },
      bigType: stripTags(cells[6]),
      smallType: stripTags(cells[7]),
      category: stripTags(cells[7]) || stripTags(cells[6]),
      netAssets: parseNumber(stripTags(cells[8])),
      source: "생명보험협회 공시실 엑셀",
      sourceUrl: FUND_DAY_EXCEL_URL,
      report: "펀드현황",
    });
  }

  const seen = new Set();
  return funds.filter((fund) => {
    const key = [fund.stdDate, fund.insurer, fund.fundCd, fund.name, fund.nav].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchFundSnapshot(targetDate) {
  const errors = [];
  try {
    const htmlFunds = parseFundSnapshot(await fetchFundHtml(targetDate));
    if (htmlFunds.length) return { funds: htmlFunds, sourceType: "html", errors };
  } catch (error) {
    errors.push(`html: ${error.message || String(error)}`);
  }

  try {
    const excelFunds = parseFundExcelSnapshot(await fetchFundExcelHtml(targetDate), targetDate || null);
    if (excelFunds.length) return { funds: excelFunds, sourceType: "excel", errors };
  } catch (error) {
    errors.push(`excel: ${error.message || String(error)}`);
  }

  return { funds: [], sourceType: "none", errors };
}

function byId(funds) {
  const map = new Map();
  funds.forEach((fund) => {
    fundLookupKeys(fund).forEach((key) => map.set(key, fund));
  });
  return map;
}

function fundLookupKeys(fund) {
  return [
    fund.id,
    `${fund.insurer}|${fund.fundCd || ""}`,
    `${fund.insurer}|${fund.name || ""}`,
    `${String(fund.insurer || "").replace("생명", "")}|${fund.fundCd || ""}`,
    `${String(fund.insurer || "").replace("생명", "")}|${fund.name || ""}`,
  ].filter(Boolean);
}

function reuseStableFundIds(current, previousPayload) {
  const previousFunds = Array.isArray(previousPayload?.funds) ? previousPayload.funds : [];
  if (!previousFunds.length) return current;
  const previousMap = byId(previousFunds);
  return current.map((fund) => {
    const previous = fundLookupKeys(fund).map((key) => previousMap.get(key)).find(Boolean);
    return previous?.id ? { ...fund, id: previous.id, memberCd: previous.memberCd || fund.memberCd } : fund;
  });
}

function payloadSnapshotBefore(payload, currentDate) {
  const stdDate = payload?.meta?.stdDate;
  const funds = Array.isArray(payload?.funds) ? payload.funds : [];
  if (!stdDate || !funds.length) return { date: null, funds: [] };
  const savedDate = new Date(`${stdDate}T00:00:00Z`);
  if (!Number.isFinite(savedDate.getTime()) || savedDate >= currentDate) {
    if (savedDate.getTime() === currentDate.getTime()) {
      const previousFunds = funds
        .filter((fund) => fund.previousNav && (fund.previousStdDate || payload.meta?.previousStdDate))
        .map((fund) => ({
          ...fund,
          nav: fund.previousNav,
          stdDate: fund.previousStdDate || payload.meta?.previousStdDate,
        }));
      if (previousFunds.length) {
        return { date: previousFunds[0].stdDate || payload.meta?.previousStdDate || null, funds: previousFunds };
      }
    }
    return { date: null, funds: [] };
  }
  return { date: stdDate, funds };
}

function dateTextBefore(dateText, offsetDays) {
  const date = new Date(`${dateText}T00:00:00Z`);
  if (!Number.isFinite(date.getTime())) return null;
  return new Date(date.getTime() - offsetDays * 86400000).toISOString().slice(0, 10);
}

async function snapshotNearText(targetDate, maxBackDays = 7) {
  for (let offset = 0; offset <= maxBackDays; offset += 1) {
    const text = dateTextBefore(targetDate, offset);
    if (!text) break;
    const snapshot = await fetchFundSnapshot(text);
    if (snapshot.funds.length) return { ...snapshot, date: text };
    if (snapshot.errors.length) return { ...snapshot, date: text };
  }
  return { funds: [], sourceType: "none", errors: [], date: null };
}

async function snapshotNear(targetDate, maxBackDays = 10) {
  for (let offset = 0; offset <= maxBackDays; offset += 1) {
    const date = new Date(targetDate.getTime() - offset * 86400000);
    const text = date.toISOString().slice(0, 10);
    const snapshot = await fetchFundSnapshot(text);
    if (snapshot.funds.length) return { date: text, funds: snapshot.funds };
  }
  return { date: null, funds: [] };
}

function enrichReturns(current, previous, monthAgo) {
  const prevMap = byId(previous);
  const monthMap = byId(monthAgo);

  return current.map((fund) => {
    const prev = prevMap.get(fund.id);
    const month = monthMap.get(fund.id);
    const day = fund.nav && prev?.nav ? fund.nav / prev.nav - 1 : 0;
    const monthRate = fund.nav && month?.nav ? fund.nav / month.nav - 1 : (fund.oneYear || 0) / 100 / 12;
    return {
      ...fund,
      previousNav: prev?.nav || null,
      previousStdDate: prev?.stdDate || null,
      monthAgoNav: month?.nav || null,
      monthAgoStdDate: month?.stdDate || null,
      day,
      month: monthRate,
      quarter: monthRate * 3,
      halfYear: monthRate * 6,
      year: (fund.oneYear || 0) / 100,
      threeYearRate: (fund.threeYear || 0) / 100,
      fiveYearRate: (fund.fiveYear || 0) / 100,
      cumulativeRate: (fund.cumulative || 0) / 100,
    };
  });
}

export async function buildFundPayload(options = {}) {
  const historyMode = options.historyMode || "cached";
  const requestedStdDate = options.targetDate || todayInSeoulDate();
  let requestedFetchError = null;
  let usedLatestFallback = false;
  let sourceType = "none";
  let current = [];

  const requestedSnapshot = await fetchFundSnapshot(requestedStdDate);
  current = requestedSnapshot.funds;
  sourceType = requestedSnapshot.sourceType;
  if (!current.length && requestedSnapshot.errors.length) {
    requestedFetchError = new Error(requestedSnapshot.errors.join(" / "));
  }

  if (!current.length) {
    usedLatestFallback = true;
    const latestSnapshot = requestedSnapshot.errors.length ? await fetchFundSnapshot() : await snapshotNearText(requestedStdDate);
    current = latestSnapshot.funds;
    sourceType = latestSnapshot.sourceType;
    if (!current.length && latestSnapshot.errors.length) {
      throw new Error(latestSnapshot.errors.join(" / "));
    }
  }

  if (!current.length) throw new Error("생명보험협회 펀드현황 데이터를 찾지 못했습니다.");
  current = reuseStableFundIds(current, options.previousPayload);

  const stdDate = current[0].stdDate;
  const currentDate = new Date(`${stdDate}T00:00:00Z`);
  const requestedDateMatched = stdDate === requestedStdDate;
  let previous = payloadSnapshotBefore(options.previousPayload, currentDate);
  let monthAgo = { date: null, funds: [] };

  if (historyMode === "full") {
    previous = await snapshotNear(new Date(currentDate.getTime() - 86400000));
    monthAgo = await snapshotNear(new Date(currentDate.getTime() - 30 * 86400000));
  }
  const funds = enrichReturns(current, previous.funds, monthAgo.funds);
  const insurers = [...new Set(funds.map((fund) => fund.insurer))].sort();

  return {
    meta: {
      dataset: "life-insurance-variable-funds",
      sourceName: "생명보험협회 공시실 펀드현황",
      sourceUrl: sourceType === "excel" ? FUND_DAY_EXCEL_URL : FUND_DAY_URL,
      stdDate,
      previousStdDate: previous.date,
      monthAgoStdDate: monthAgo.date,
      fetchedAt: new Date().toISOString(),
      fundCount: funds.length,
      insurerCount: insurers.length,
      insurers,
      historyMode,
      requestedStdDate,
      requestedDateMatched,
      requestedDateFallback: usedLatestFallback || !requestedDateMatched,
      requestedFetchError: requestedFetchError?.message || null,
      sourceType,
      notice: "고객별 실제 적립금이 아니라 공시 펀드 기준가와 수익률 기반의 추정 데이터입니다.",
    },
    funds,
  };
}
