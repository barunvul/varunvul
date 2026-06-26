const SOURCE_BASE = "https://pub.insure.or.kr";
const FUND_DAY_URL = `${SOURCE_BASE}/compareDis/variableInsrn/fundDay/list.do`;

function qs(params) {
  return new URLSearchParams(params).toString();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "VariableInsuranceManager/1.0",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!response.ok) throw new Error(`Fetch failed ${response.status}: ${url}`);
  return response.text();
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

  return funds;
}

function byId(funds) {
  return new Map(funds.map((fund) => [fund.id, fund]));
}

async function snapshotNear(targetDate, maxBackDays = 10) {
  for (let offset = 0; offset <= maxBackDays; offset += 1) {
    const date = new Date(targetDate.getTime() - offset * 86400000);
    const text = date.toISOString().slice(0, 10);
    const funds = parseFundSnapshot(await fetchFundHtml(text));
    if (funds.length) return { date: text, funds };
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

export async function buildFundPayload() {
  const current = parseFundSnapshot(await fetchFundHtml());
  if (!current.length) throw new Error("생명보험협회 펀드현황 데이터를 찾지 못했습니다.");

  const stdDate = current[0].stdDate;
  const currentDate = new Date(`${stdDate}T00:00:00Z`);
  const previous = await snapshotNear(new Date(currentDate.getTime() - 86400000));
  const monthAgo = await snapshotNear(new Date(currentDate.getTime() - 30 * 86400000));
  const funds = enrichReturns(current, previous.funds, monthAgo.funds);
  const insurers = [...new Set(funds.map((fund) => fund.insurer))].sort();

  return {
    meta: {
      dataset: "life-insurance-variable-funds",
      sourceName: "생명보험협회 공시실 펀드현황",
      sourceUrl: FUND_DAY_URL,
      stdDate,
      previousStdDate: previous.date,
      monthAgoStdDate: monthAgo.date,
      fetchedAt: new Date().toISOString(),
      fundCount: funds.length,
      insurerCount: insurers.length,
      insurers,
      notice: "고객별 실제 적립금이 아니라 공시 펀드 기준가와 수익률 기반의 추정 데이터입니다.",
    },
    funds,
  };
}
