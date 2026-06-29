const STORAGE_KEY = "variable-insurance-manager-pro-v2";
let DATA_DATE = "2026-06-25";
const TODAY_DATE = todayInSeoulDate();
let appMeta = {
  displayName: "변액보험 매니저 Pro",
  maker: "바른변액",
  version: "0.3.4",
  updatedAt: "2026-06-29",
};

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

const insurerThemes = [
  { names: ["삼성생명", "삼성"], primary: "#1f5fbf", soft: "#eaf2ff", ink: "#174a92" },
  { names: ["한화생명", "한화"], primary: "#f37321", soft: "#fff0e5", ink: "#9a4514" },
  { names: ["교보생명", "교보"], primary: "#0a8f62", soft: "#e8f7f0", ink: "#076342" },
  { names: ["미래에셋생명", "미래에셋"], primary: "#0076a8", soft: "#e6f5fb", ink: "#075477" },
  { names: ["메트라이프생명", "메트라이프"], primary: "#007abc", soft: "#e8f5fc", ink: "#04577f" },
  { names: ["신한라이프생명", "신한라이프"], primary: "#5b5fc7", soft: "#efeffb", ink: "#3d4193" },
  { names: ["KB라이프생명", "KB라이프"], primary: "#d6a800", soft: "#fff7d9", ink: "#725c00" },
  { names: ["ABL생명", "ABL"], primary: "#c8102e", soft: "#fdebef", ink: "#8a1024" },
  { names: ["흥국생명", "흥국"], primary: "#d7197f", soft: "#fdebf5", ink: "#911051" },
  { names: ["iM라이프생명", "iM라이프", "DGB생명"], primary: "#005eb8", soft: "#e8f2ff", ink: "#064887" },
  { names: ["KDB생명", "KDB"], primary: "#0b3a75", soft: "#eaf0f8", ink: "#082953" },
  { names: ["DB생명", "DB"], primary: "#008542", soft: "#e8f7ef", ink: "#056032" },
  { names: ["동양생명", "동양"], primary: "#c62828", soft: "#fdecec", ink: "#842020" },
  { names: ["처브라이프생명", "처브라이프", "Chubb"], primary: "#0057a8", soft: "#e8f2fb", ink: "#053f78" },
  { names: ["하나생명", "하나"], primary: "#008375", soft: "#e7f6f3", ink: "#065f56" },
  { names: ["BNP파리바카디프생명", "카디프"], primary: "#00843d", soft: "#e8f7ef", ink: "#075d30" },
  { names: ["푸본현대생명", "푸본현대"], primary: "#004b9b", soft: "#e9f1fb", ink: "#073c76" },
  { names: ["라이나생명", "라이나"], primary: "#009a9a", soft: "#e6f8f8", ink: "#056d6d" },
  { names: ["AIA생명", "AIA"], primary: "#d71920", soft: "#fdecec", ink: "#94151a" },
  { names: ["IBK연금보험", "IBK"], primary: "#005bac", soft: "#e8f2fb", ink: "#06427d" },
];

const defaultFunds = [
  {
    id: "met-index",
    insurer: "메트라이프",
    name: "인덱스주식형",
    category: "국내주식",
    nav: 1642.31,
    day: 0.0213,
    month: 0.0685,
    year: 0.261,
    source: "홈페이지",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "met-global-ai",
    insurer: "메트라이프",
    name: "글로벌AI주식형",
    category: "해외주식",
    nav: 1388.62,
    day: 0.0202,
    month: 0.073,
    year: 0.312,
    source: "CSV",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "met-japan",
    insurer: "메트라이프",
    name: "일본주식형",
    category: "해외주식",
    nav: 1221.78,
    day: 0.0171,
    month: 0.044,
    year: 0.146,
    source: "엑셀",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "met-bond",
    insurer: "메트라이프",
    name: "글로벌채권형",
    category: "채권",
    nav: 1008.92,
    day: 0.0018,
    month: 0.0106,
    year: 0.0188,
    source: "PDF",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "met-money",
    insurer: "메트라이프",
    name: "MMF형",
    category: "단기채권",
    nav: 1001.14,
    day: 0.0003,
    month: 0.0024,
    year: 0.024,
    source: "CSV",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "mirae-semicon",
    insurer: "미래에셋",
    name: "코리아반도체주식형",
    category: "국내주식",
    nav: 1840.44,
    day: 0.024,
    month: 0.079,
    year: 0.294,
    source: "홈페이지",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "mirae-sp500",
    insurer: "미래에셋",
    name: "미국S&P500형",
    category: "해외주식",
    nav: 1512.72,
    day: 0.0149,
    month: 0.043,
    year: 0.176,
    source: "CSV",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "mirae-income",
    insurer: "미래에셋",
    name: "글로벌인컴형",
    category: "혼합",
    nav: 1110.17,
    day: 0.0044,
    month: 0.019,
    year: 0.071,
    source: "엑셀",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "samsung-kospi",
    insurer: "삼성생명",
    name: "KOSPI200인덱스형",
    category: "국내주식",
    nav: 1438.2,
    day: 0.0186,
    month: 0.052,
    year: 0.184,
    source: "홈페이지",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "samsung-us-tech",
    insurer: "삼성생명",
    name: "미국테크성장형",
    category: "해외주식",
    nav: 1735.02,
    day: 0.0198,
    month: 0.071,
    year: 0.337,
    source: "CSV",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "samsung-bond",
    insurer: "삼성생명",
    name: "국공채형",
    category: "채권",
    nav: 1022.7,
    day: 0.0012,
    month: 0.0062,
    year: 0.028,
    source: "PDF",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "hanwha-global",
    insurer: "한화생명",
    name: "글로벌멀티테마형",
    category: "해외주식",
    nav: 1314.48,
    day: 0.0162,
    month: 0.057,
    year: 0.205,
    source: "엑셀",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "hanwha-balance",
    insurer: "한화생명",
    name: "밸런스50형",
    category: "혼합",
    nav: 1088.33,
    day: 0.0067,
    month: 0.022,
    year: 0.083,
    source: "CSV",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "kyobo-value",
    insurer: "교보생명",
    name: "가치주식형",
    category: "국내주식",
    nav: 1270.86,
    day: 0.0124,
    month: 0.035,
    year: 0.122,
    source: "홈페이지",
    report: "2026년 6월 운용보고서",
  },
  {
    id: "shinhan-global-bond",
    insurer: "신한라이프",
    name: "글로벌채권안정형",
    category: "채권",
    nav: 1044.91,
    day: 0.0022,
    month: 0.0088,
    year: 0.036,
    source: "CSV",
    report: "2026년 6월 운용보고서",
  },
];

const defaultClients = [
  {
    id: "client-hong",
    name: "홍길동",
    segment: "VIP",
    insurer: "메트라이프",
    product: "동행 Plus",
    baseDate: "2026-06-25",
    baseValue: 100000000,
    actualValue: 101420000,
    allocations: [
      { fundId: "met-index", weight: 0.7 },
      { fundId: "met-bond", weight: 0.3 },
    ],
    history: [
      {
        date: "2026-06-25",
        value: 100000000,
        change: "최초 등록",
        reason: "국내 인덱스 중심 성장형 관리 시작",
        result: "-",
      },
      {
        date: "2026-06-26",
        value: 101545000,
        change: "인덱스 70% · 채권 30% 유지",
        reason: "국내 주식형 당일 강세와 채권 변동성 안정",
        result: "+154만원",
      },
    ],
  },
  {
    id: "client-kim",
    name: "김민지",
    segment: "관리",
    insurer: "미래에셋",
    product: "글로벌 MVP 변액",
    baseDate: "2026-01-14",
    baseValue: 82000000,
    actualValue: 97210000,
    allocations: [
      { fundId: "mirae-semicon", weight: 0.45 },
      { fundId: "mirae-sp500", weight: 0.35 },
      { fundId: "mirae-income", weight: 0.2 },
    ],
    history: [
      {
        date: "2026-01-14",
        value: 82000000,
        change: "최초 등록",
        reason: "미국 대형주와 국내 반도체 병행",
        result: "-",
      },
      {
        date: "2026-04-09",
        value: 90100000,
        change: "반도체 45% 확대",
        reason: "메모리 가격 반등과 실적 개선",
        result: "+810만원",
      },
      {
        date: "2026-06-19",
        value: 96300000,
        change: "글로벌인컴 20% 편입",
        reason: "상승분 방어와 변동성 조절",
        result: "+1,430만원",
      },
    ],
  },
  {
    id: "client-park",
    name: "박준호",
    segment: "신규",
    insurer: "삼성생명",
    product: "스마트변액유니버셜",
    baseDate: "2026-03-02",
    baseValue: 128000000,
    actualValue: 149800000,
    allocations: [
      { fundId: "samsung-us-tech", weight: 0.5 },
      { fundId: "samsung-kospi", weight: 0.35 },
      { fundId: "samsung-bond", weight: 0.15 },
    ],
    history: [
      {
        date: "2026-03-02",
        value: 128000000,
        change: "최초 등록",
        reason: "미국 성장주와 국내 인덱스 분산",
        result: "-",
      },
      {
        date: "2026-05-07",
        value: 141900000,
        change: "미국테크 50% 확대",
        reason: "AI 인프라 투자 확대",
        result: "+1,390만원",
      },
      {
        date: "2026-06-21",
        value: 148600000,
        change: "국공채 15% 유지",
        reason: "상승 후 방어 비중 확보",
        result: "+2,060만원",
      },
    ],
  },
];

const icons = {
  search:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  plus:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>',
  database:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
  refresh:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12a9 9 0 0 1-15.5 6.2"/><path d="M3 12A9 9 0 0 1 18.5 5.8"/><path d="M18 2v4h4M6 22v-4H2"/></svg>',
  edit:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  link:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/></svg>',
  file:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>',
  sliders:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M2 14h4M10 8h4M18 16h4"/></svg>',
  "calendar-plus":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M12 14v5M9.5 16.5h5"/></svg>',
  copy:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  printer:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>',
  x:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6 6 18M6 6l12 12"/></svg>',
};

let state = loadState();
let activeRange = 30;
let simulationWeights = {};
let simulationClientId = null;
let simulationSelectedFundIds = [];
let editingClientId = null;
let latestFundSyncPromise = null;
let lastDayRankingSyncAt = 0;

const DAY_RANKING_SYNC_INTERVAL_MS = 60 * 1000;

const rankingPeriods = {
  day: { label: "1일", suffix: "" },
  month: { label: "1개월", suffix: "" },
  quarter: { label: "3개월", suffix: "추정" },
  halfYear: { label: "6개월", suffix: "추정" },
  year: { label: "1년", suffix: "" },
  threeYearRate: { label: "3년", suffix: "" },
  fiveYearRate: { label: "5년", suffix: "" },
  cumulativeRate: { label: "누적", suffix: "" },
};

const els = {
  appName: document.querySelector("#app-name"),
  appMaker: document.querySelector("#app-maker"),
  appVersion: document.querySelector("#app-version"),
  clientList: document.querySelector("#client-list"),
  clientSearch: document.querySelector("#client-search"),
  dataDate: document.querySelector("#data-date"),
  clientTitle: document.querySelector("#client-title"),
  clientAvatar: document.querySelector("#client-avatar"),
  profileName: document.querySelector("#profile-name"),
  profileSegment: document.querySelector("#profile-segment"),
  profileMeta: document.querySelector("#profile-meta"),
  expectedValue: document.querySelector("#expected-value"),
  dailyProfit: document.querySelector("#daily-profit"),
  totalProfit: document.querySelector("#total-profit"),
  kpiDay: document.querySelector("#kpi-day"),
  kpiDayRate: document.querySelector("#kpi-day-rate"),
  kpiMonth: document.querySelector("#kpi-month"),
  kpiMonthRate: document.querySelector("#kpi-month-rate"),
  kpiYear: document.querySelector("#kpi-year"),
  kpiYearRate: document.querySelector("#kpi-year-rate"),
  kpiGap: document.querySelector("#kpi-gap"),
  kpiGapRate: document.querySelector("#kpi-gap-rate"),
  reserveChart: document.querySelector("#reserve-chart"),
  chartStartLabel: document.querySelector("#chart-start-label"),
  chartEndLabel: document.querySelector("#chart-end-label"),
  allocationTable: document.querySelector("#allocation-table"),
  rankingInsurer: document.querySelector("#ranking-insurer"),
  rankingPeriod: document.querySelector("#ranking-period"),
  fundRanking: document.querySelector("#fund-ranking"),
  fundSearch: document.querySelector("#fund-search"),
  fundCatalog: document.querySelector("#fund-catalog"),
  fundCatalogMeta: document.querySelector("#fund-catalog-meta"),
  simFundSearch: document.querySelector("#sim-fund-search"),
  simulationPicker: document.querySelector("#simulation-picker"),
  simulationControls: document.querySelector("#simulation-controls"),
  simulationMeta: document.querySelector("#simulation-meta"),
  simulationPeriod: document.querySelector("#simulation-period"),
  simulationValue: document.querySelector("#simulation-value"),
  simulationProfit: document.querySelector("#simulation-profit"),
  historyTable: document.querySelector("#history-table"),
  notice: document.querySelector("#client-notice"),
  reportPreview: document.querySelector("#report-preview"),
  toast: document.querySelector("#toast"),
  clientHero: document.querySelector(".client-hero"),
  clientModal: document.querySelector("#client-modal"),
  clientForm: document.querySelector("#client-form"),
  clientModalEyebrow: document.querySelector("#client-modal-eyebrow"),
  clientModalTitle: document.querySelector("#client-modal-title"),
  clientModalSubmit: document.querySelector("#client-modal-submit"),
  addClientButton: document.querySelector("#open-add-client"),
  editClientButton: document.querySelector("#edit-client"),
  syncDataButton: document.querySelector("#sync-data"),
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.clients?.length && saved?.funds?.length) {
      return {
        ...saved,
        selectedClientId: saved.selectedClientId || saved.clients[0].id,
        lastSync: saved.lastSync || `${DATA_DATE} 07:10`,
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    funds: structuredClone(defaultFunds),
    clients: structuredClone(defaultClients),
    selectedClientId: defaultClients[0].id,
    lastSync: `${DATA_DATE} 07:10`,
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderIcons() {
  document.querySelectorAll("[data-icon]").forEach((node) => {
    node.innerHTML = icons[node.dataset.icon] || "";
  });
}

function currentClient() {
  return state.clients.find((client) => client.id === state.selectedClientId) || state.clients[0];
}

function fundById(fundId) {
  return state.funds.find((fund) => fund.id === fundId);
}

function fundsForInsurer(insurer) {
  return state.funds.filter((fund) => fund.insurer === insurer);
}

function insurerNamesFromFunds(fundList = state.funds) {
  return [...new Set(fundList.map((fund) => fund.insurer).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ko-KR"));
}

function insurers() {
  return insurerNamesFromFunds(state.funds);
}

function resolveInsurerName(name = "", fundList = state.funds) {
  const currentName = String(name || "");
  const names = insurerNamesFromFunds(fundList);
  if (names.includes(currentName)) return currentName;
  const aliases = {
    "메트라이프": "메트라이프생명",
    "미래에셋": "미래에셋생명",
    "삼성생명": "삼성생명",
    "한화생명": "한화생명",
    "교보": "교보생명",
    "교보생명": "교보생명",
    "신한라이프": "신한라이프생명",
    "신한라이프생명": "신한라이프생명",
    "KB라이프": "KB라이프생명",
    "DB생명": "DB생명",
    "KDB생명": "KDB생명",
  };
  if (aliases[currentName] && names.includes(aliases[currentName])) return aliases[currentName];
  if (!currentName) return names[0] || currentName;
  return names.find((candidate) => candidate.includes(currentName) || currentName.includes(candidate.replace("생명", ""))) || currentName;
}

function bestDefaultAllocations(insurer, fundList = state.funds) {
  const pool = fundList
    .filter((fund) => fund.insurer === insurer)
    .sort((a, b) => (b.netAssets || 0) - (a.netAssets || 0));
  const growth = pool.find((fund) => /주식|인덱스|글로벌|미국|AI|테크|성장/.test(fund.name + fund.category)) || pool[0];
  const stable = pool.find((fund) => /채권|안정|MMF|단기|금리/.test(fund.name + fund.category)) || pool[1] || pool[0];
  if (!growth) return [];
  if (!stable || growth.id === stable.id) return [{ fundId: growth.id, weight: 1 }];
  return [
    { fundId: growth.id, weight: 0.7 },
    { fundId: stable.id, weight: 0.3 },
  ];
}

function migrateClientsToFunds(clients, fundList) {
  const fundIds = new Set(fundList.map((fund) => fund.id));
  return clients.map((client) => {
    const insurer = resolveInsurerName(client.insurer, fundList);
    const validAllocations = (client.allocations || []).filter((allocation) => fundIds.has(allocation.fundId));
    return {
      ...client,
      insurer,
      allocations: validAllocations.length ? validAllocations : bestDefaultAllocations(insurer, fundList),
    };
  });
}

async function loadExternalFundData() {
  try {
    const payload = await fetchExternalFundPayload();
    if (!payload) return false;
    const funds = Array.isArray(payload.funds) ? payload.funds : [];
    if (!funds.length) return false;

    const selectedClientId = state.selectedClientId;
    DATA_DATE = payload.meta?.stdDate || DATA_DATE;
    state = {
      ...state,
      funds,
      clients: migrateClientsToFunds(state.clients, funds),
      fundDatasetMeta: payload.meta || {},
      lastSync: payload.meta?.fetchedAt || state.lastSync,
      selectedClientId,
    };
    if (!state.clients.some((client) => client.id === state.selectedClientId)) {
      state.selectedClientId = state.clients[0]?.id;
    }
    saveState();
    return true;
  } catch (error) {
    console.warn("fund data load failed", error);
    return false;
  }
}

async function fetchExternalFundPayload() {
  const timestamp = Date.now();
  const sources = [`/api/funds?ts=${timestamp}`, `./data/funds.json?ts=${timestamp}`];

  for (const source of sources) {
    try {
      const response = await fetch(source, { cache: "no-store" });
      if (!response.ok) continue;
      const payload = await response.json();
      if (Array.isArray(payload.funds) && payload.funds.length) return payload;
    } catch {
      // Try the next source. Vercel has /api/funds; static fallback has data/funds.json.
    }
  }

  return null;
}

function weightedRate(client, key) {
  return client.allocations.reduce((sum, allocation) => {
    const fund = fundById(allocation.fundId);
    return sum + (fund?.[key] || 0) * allocation.weight;
  }, 0);
}

function clientSummary(client) {
  const dayRate = weightedRate(client, "day");
  const monthRate = weightedRate(client, "month");
  const yearRate = weightedRate(client, "year");
  const expected = client.baseValue * (1 + dayRate);
  const actual = Number.isFinite(client.actualValue) ? client.actualValue : expected;
  const gap = actual - expected;

  return {
    dayRate,
    monthRate,
    yearRate,
    expected,
    actual,
    gap,
    gapRate: expected ? gap / expected : 0,
    dayProfit: client.baseValue * dayRate,
    monthProfit: client.baseValue * monthRate,
    yearProfit: client.baseValue * yearRate,
    totalProfit: expected - client.baseValue,
  };
}

function formatMoney(value) {
  const rounded = Math.round(value);
  return `${new Intl.NumberFormat("ko-KR").format(rounded)}원`;
}

function formatShortMoney(value) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(Math.round(value));
  const eok = Math.floor(abs / 100000000);
  const man = Math.floor((abs % 100000000) / 10000);
  if (eok && man) return `${sign}${eok}억 ${new Intl.NumberFormat("ko-KR").format(man)}만원`;
  if (eok) return `${sign}${eok}억원`;
  return `${sign}${new Intl.NumberFormat("ko-KR").format(man)}만원`;
}

function formatPercent(rate) {
  const sign = rate > 0 ? "+" : "";
  return `${sign}${(rate * 100).toFixed(2)}%`;
}

function formatDate(date) {
  return date.replaceAll("-", ".");
}

function normalizeInsurerNameForTheme(name = "") {
  return String(name).replace(/\s+/g, "").replace(/생명보험$/, "생명");
}

function insurerTheme(insurer = "") {
  const normalized = normalizeInsurerNameForTheme(insurer);
  const found = insurerThemes.find((theme) =>
    theme.names.some((name) => {
      const key = normalizeInsurerNameForTheme(name);
      return normalized.includes(key) || key.includes(normalized.replace("생명", ""));
    }),
  );
  if (found) return found;

  const palette = [
    ["#0c7a52", "#e8f5ef", "#075f3f"],
    ["#087a8a", "#e7f5f7", "#055b66"],
    ["#7b5f16", "#f7f1df", "#5a4611"],
    ["#7a4e9d", "#f1ecf8", "#583871"],
  ];
  const hash = [...normalized].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const [primary, soft, ink] = palette[hash % palette.length];
  return { primary, soft, ink };
}

function insurerStyle(insurer) {
  const theme = insurerTheme(insurer);
  return `--insurer-color:${theme.primary};--insurer-soft:${theme.soft};--insurer-ink:${theme.ink};`;
}

function applyInsurerTheme(element, insurer) {
  if (!element) return;
  const theme = insurerTheme(insurer);
  element.style.setProperty("--insurer-color", theme.primary);
  element.style.setProperty("--insurer-soft", theme.soft);
  element.style.setProperty("--insurer-ink", theme.ink);
}

function parseMoneyInput(value) {
  const cleaned = String(value ?? "").replace(/[,\s]/g, "");
  if (!cleaned) return NaN;
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? Math.round(numeric) : NaN;
}

function sanitizeDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? value : TODAY_DATE;
}

async function loadAppMeta() {
  try {
    const response = await fetch(`./package.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("package metadata unavailable");
    const pkg = await response.json();
    appMeta = {
      displayName: pkg.appMeta?.displayName || appMeta.displayName,
      maker: pkg.appMeta?.maker || appMeta.maker,
      version: pkg.version || appMeta.version,
      updatedAt: pkg.appMeta?.updatedAt || appMeta.updatedAt,
    };
  } catch {
    // The package metadata keeps release text in one place; fallback values keep local previews usable.
  }
  renderAppMeta();
}

function renderAppMeta() {
  document.title = appMeta.displayName;
  if (els.appName) els.appName.textContent = appMeta.displayName;
  if (els.appMaker) els.appMaker.textContent = `만든이 : ${appMeta.maker}`;
  if (els.appVersion) els.appVersion.textContent = `v${appMeta.version} · 수정 ${formatDate(appMeta.updatedAt)}`;
}

function classForValue(value) {
  return value >= 0 ? "up" : "down";
}

function rateForFund(fund, period = "day") {
  if (!fund) return 0;
  if (period === "quarter") return Number.isFinite(fund.quarter) ? fund.quarter : (fund.month || 0) * 3;
  if (period === "halfYear") return Number.isFinite(fund.halfYear) ? fund.halfYear : (fund.month || 0) * 6;
  if (period === "cumulativeRate") return (fund.cumulative || 0) / 100;
  return fund[period] || 0;
}

function rankingPeriodKey() {
  return els.rankingPeriod?.value || "day";
}

function allocationLabel(allocations) {
  return allocations
    .filter((allocation) => allocation.weight > 0)
    .map((allocation) => `${fundById(allocation.fundId)?.name || allocation.fundId} ${Math.round(allocation.weight * 100)}%`)
    .join(" / ");
}

function currentAllocationSignature(client) {
  return (client.allocations || [])
    .filter((allocation) => allocation.weight > 0)
    .map((allocation) => `${allocation.fundId}:${Math.round(allocation.weight * 100)}`)
    .sort()
    .join("|");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2400);
}

function updateErrorMessage(result, response) {
  let raw = result?.error || result?.stderr || `수집 API 오류 ${response?.status || ""}`.trim();
  if (typeof raw === "string" && raw.trim().startsWith("{")) {
    try {
      const nested = JSON.parse(raw);
      raw = nested.error || raw;
    } catch {
      // Keep the original text.
    }
  }
  if (raw.includes("SUPABASE_URL") || raw.includes("SUPABASE_SERVICE_ROLE_KEY")) {
    return "Vercel에서 최신 데이터를 저장하려면 Supabase 환경변수(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)를 설정해야 합니다.";
  }
  if (raw.includes("WinError 10013") || raw.includes("원격 서버에 연결할 수 없습니다")) {
    return "외부 공시 사이트 접속이 차단되어 수집하지 못했습니다. 로컬 보안/방화벽 또는 실행 환경의 네트워크 권한을 확인해주세요.";
  }
  if (raw.includes("fetch failed") || raw.includes("urlopen error")) {
    return "생명보험협회 공시 사이트에 연결하지 못했습니다. 인터넷 연결 또는 사이트 접속 가능 여부를 확인해주세요.";
  }
  if (result?.code && result?.stderr) {
    return "공시 수집 스크립트가 실패했습니다. 외부 공시 사이트 접속 권한 또는 네트워크 연결을 확인해주세요.";
  }
  return raw.replace(/\s+/g, " ").slice(0, 180);
}

function fundSyncSuccessMessage(result, reason = "manual") {
  const requestedDate = formatDate(result?.requestedStdDate || TODAY_DATE);
  const stdDate = formatDate(result?.stdDate || DATA_DATE);
  const fundCount = Number(result?.fundCount || state.funds.length).toLocaleString("ko-KR");
  const target = reason === "day-ranking" ? "1일 랭킹" : "펀드 데이터";

  if (result?.live === false) {
    return `실시간 수집은 실패했지만 저장된 최신 공시 데이터(${stdDate})로 ${target}을 다시 계산했습니다.`;
  }
  if (result?.requestedDateMatched === false) {
    return `생명보험협회 최신 공시일 ${stdDate} 기준가 ${fundCount}개를 반영해 ${target}을 갱신했습니다.`;
  }
  return `생명보험협회 오늘(${requestedDate}) 기준가 ${fundCount}개를 반영해 ${target}을 갱신했습니다.`;
}

async function syncLatestFundData({ reason = "manual", showProgress = true } = {}) {
  if (latestFundSyncPromise) return latestFundSyncPromise;

  latestFundSyncPromise = (async () => {
    if (showProgress) {
      showToast(reason === "day-ranking" ? "1일 랭킹 최신 공시 데이터를 확인 중입니다." : "생명보험협회 공시 데이터를 수집 중입니다.");
    }

    if (els.syncDataButton) els.syncDataButton.disabled = true;

    const beforeDataDate = DATA_DATE;
    const beforeLastSync = state.lastSync;
    let failedReason = "";

    try {
      const response = await fetch("/api/update-funds", { method: "POST" });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.ok) {
        await loadExternalFundData();
        populateModalOptions();
        renderAll();
        showToast(fundSyncSuccessMessage(result, reason));
        return true;
      }
      failedReason = updateErrorMessage(result, response);
    } catch (error) {
      failedReason = updateErrorMessage({ error: error.message }, null);
    } finally {
      if (els.syncDataButton) els.syncDataButton.disabled = false;
    }

    const loaded = await loadExternalFundData();
    populateModalOptions();
    renderAll();
    if (loaded && (DATA_DATE !== beforeDataDate || state.lastSync !== beforeLastSync)) {
      showToast(`응답이 지연됐지만 오늘(${formatDate(TODAY_DATE)}) 기준 최신 공시 데이터(${formatDate(DATA_DATE)})를 반영했습니다.`);
      return true;
    }

    showToast(
      failedReason
        ? `수집 실패: ${failedReason}`
        : loaded
          ? "저장된 공시 데이터 파일을 다시 불러왔습니다."
          : "수집 파일이 없습니다. update-funds.ps1을 먼저 실행해주세요.",
    );
    return false;
  })();

  try {
    return await latestFundSyncPromise;
  } finally {
    latestFundSyncPromise = null;
  }
}

async function refreshDayRankingWithLatestData() {
  if (rankingPeriodKey() !== "day") {
    renderRanking();
    renderFundCatalog();
    renderSimulation(currentClient());
    return false;
  }

  const now = Date.now();
  if (now - lastDayRankingSyncAt < DAY_RANKING_SYNC_INTERVAL_MS) {
    renderRanking();
    renderFundCatalog();
    renderSimulation(currentClient());
    return false;
  }

  lastDayRankingSyncAt = now;
  return syncLatestFundData({ reason: "day-ranking" });
}

function renderClientList() {
  const query = els.clientSearch.value.trim().toLowerCase();
  const clients = state.clients.filter((client) => {
    const haystack = `${client.name} ${client.insurer} ${client.product}`.toLowerCase();
    return haystack.includes(query);
  });

  els.clientList.innerHTML = clients
    .map((client) => {
      const summary = clientSummary(client);
      return `
        <button class="client-button ${client.id === state.selectedClientId ? "active" : ""}" data-client-id="${client.id}" style="${insurerStyle(client.insurer)}">
          <span class="client-mini-avatar">${client.name.slice(0, 1)}</span>
          <span>
            <strong>${client.name}</strong>
            <span>${client.insurer} · ${client.product}</span>
            <small>${formatShortMoney(summary.expected)} · ${formatPercent(summary.dayRate)}</small>
          </span>
        </button>
      `;
    })
    .join("");
}

function renderHeader(client, summary) {
  applyInsurerTheme(els.clientHero, client.insurer);
  applyInsurerTheme(els.clientAvatar, client.insurer);
  const meta = state.fundDatasetMeta || {};
  const dateLabel =
    DATA_DATE === TODAY_DATE
      ? `오늘 공시 기준일 ${formatDate(DATA_DATE)}`
      : `오늘 ${formatDate(TODAY_DATE)} · 최신 공시 기준일 ${formatDate(DATA_DATE)}`;
  const sourceLabel = meta.fundCount
    ? `${dateLabel} · ${meta.fundCount.toLocaleString("ko-KR")}개 펀드`
    : `오늘 ${formatDate(TODAY_DATE)} · 모의 기준일 ${formatDate(DATA_DATE)}`;
  els.dataDate.textContent = `${sourceLabel} · 마지막 수집 ${state.lastSync}`;
  els.clientTitle.textContent = `${client.name} 포트폴리오`;
  els.clientAvatar.textContent = client.name.slice(0, 1);
  els.profileName.textContent = client.name;
  els.profileSegment.textContent = client.segment || "관리";
  els.profileMeta.textContent = `${client.insurer} · ${client.product} · 최초등록 ${formatDate(client.baseDate)}`;
  els.expectedValue.textContent = formatMoney(summary.expected);
  els.dailyProfit.textContent = `${summary.dayProfit >= 0 ? "+" : ""}${formatMoney(summary.dayProfit)}`;
  els.totalProfit.textContent = `${summary.totalProfit >= 0 ? "+" : ""}${formatMoney(summary.totalProfit)}`;
}

function renderKpis(summary) {
  els.kpiDay.textContent = `${summary.dayProfit >= 0 ? "+" : ""}${formatShortMoney(summary.dayProfit)}`;
  els.kpiDay.className = classForValue(summary.dayProfit);
  els.kpiDayRate.textContent = formatPercent(summary.dayRate);

  els.kpiMonth.textContent = `${summary.monthProfit >= 0 ? "+" : ""}${formatShortMoney(summary.monthProfit)}`;
  els.kpiMonth.className = classForValue(summary.monthProfit);
  els.kpiMonthRate.textContent = formatPercent(summary.monthRate);

  els.kpiYear.textContent = `${summary.yearProfit >= 0 ? "+" : ""}${formatShortMoney(summary.yearProfit)}`;
  els.kpiYear.className = classForValue(summary.yearProfit);
  els.kpiYearRate.textContent = formatPercent(summary.yearRate);

  els.kpiGap.textContent = `${summary.gap >= 0 ? "+" : ""}${formatShortMoney(summary.gap)}`;
  els.kpiGap.className = Math.abs(summary.gapRate) < 0.01 ? "up" : "down";
  els.kpiGapRate.textContent = formatPercent(summary.gapRate);
}

function renderAllocationTable(client, summary) {
  els.allocationTable.innerHTML = client.allocations
    .map((allocation) => {
      const fund = fundById(allocation.fundId);
      const contribution = client.baseValue * allocation.weight * fund.day;
      return `
        <tr style="${insurerStyle(client.insurer)}">
          <td>
            <div class="fund-name">
              <strong>${fund.name}</strong>
              <small>${fund.category} · ${fund.source}</small>
            </div>
          </td>
          <td>
            <strong>${Math.round(allocation.weight * 100)}%</strong>
            <div class="bar-track"><i style="width:${Math.round(allocation.weight * 100)}%"></i></div>
          </td>
          <td class="${classForValue(fund.day)} numeric">${formatPercent(fund.day)}</td>
          <td class="${classForValue(fund.month)} numeric">${formatPercent(fund.month)}</td>
          <td class="numeric">${new Intl.NumberFormat("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(fund.nav)}</td>
          <td class="${classForValue(contribution)} numeric">${contribution >= 0 ? "+" : ""}${formatShortMoney(contribution)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderRankingOptions() {
  const names = insurers();
  const client = currentClient();
  const previousValue = els.rankingInsurer.value;
  const resolvedClientInsurer = resolveInsurerName(client?.insurer || "", state.funds);
  const nextValue = names.includes(previousValue)
    ? previousValue
    : names.includes(resolvedClientInsurer)
      ? resolvedClientInsurer
      : names[0] || "";
  const optionsSignature = names.join("|");

  if (els.rankingInsurer.dataset.optionsSignature !== optionsSignature) {
    els.rankingInsurer.innerHTML = names
      .map((insurer) => `<option value="${insurer}">${insurer}</option>`)
      .join("");
    els.rankingInsurer.dataset.optionsSignature = optionsSignature;
  }

  if (nextValue) els.rankingInsurer.value = nextValue;
}

function renderRanking() {
  const insurer = els.rankingInsurer.value || currentClient().insurer;
  const period = rankingPeriodKey();
  const periodMeta = rankingPeriods[period] || rankingPeriods.day;
  const ranked = fundsForInsurer(insurer).sort((a, b) => rateForFund(b, period) - rateForFund(a, period));

  els.fundRanking.innerHTML = ranked
    .map(
      (fund, index) => `
        <div class="ranking-item" style="${insurerStyle(insurer)}">
          <span class="rank-number">${index + 1}</span>
          <span>
            <strong>${fund.name}</strong>
            <small>${fund.category} · ${periodMeta.label}${periodMeta.suffix ? ` ${periodMeta.suffix}` : ""} · 기준가 ${fund.nav.toFixed(2)}</small>
          </span>
          <b class="ranking-return ${classForValue(rateForFund(fund, period))}">${formatPercent(rateForFund(fund, period))}</b>
        </div>
      `,
    )
    .join("");
}

function renderFundCatalog() {
  if (!els.fundCatalog || !els.fundCatalogMeta) return;

  const insurer = els.rankingInsurer.value || currentClient().insurer;
  const query = (els.fundSearch?.value || "").trim().toLowerCase();
  const period = rankingPeriodKey();
  const matched = state.funds
    .filter((fund) => {
      const haystack = `${fund.insurer} ${fund.name} ${fund.category} ${fund.fundCd}`.toLowerCase();
      return (!insurer || fund.insurer === insurer) && (!query || haystack.includes(query));
    })
    .sort((a, b) => rateForFund(b, period) - rateForFund(a, period));
  const shown = matched.slice(0, 120);
  const meta = state.fundDatasetMeta || {};

  els.fundCatalogMeta.textContent = `${insurer} ${matched.length.toLocaleString("ko-KR")}개 표시 대상 · 전체 ${Number(meta.fundCount || state.funds.length).toLocaleString("ko-KR")}개`;
  els.fundCatalog.innerHTML = shown
    .map(
      (fund) => `
        <div class="catalog-item" style="${insurerStyle(fund.insurer)}">
          <span>
            <strong>${fund.name}</strong>
            <small>${fund.insurer} · ${fund.category || fund.bigType || "분류 없음"} · ${fund.fundCd || fund.id}</small>
          </span>
          <b class="${classForValue(rateForFund(fund, period))}">${formatPercent(rateForFund(fund, period))}</b>
        </div>
      `,
    )
    .join("");
}

function generateSeries(client, days) {
  const summary = clientSummary(client);
  const trend = Math.pow(1 + Math.max(summary.yearRate, -0.4), 1 / 252) - 1;
  const risk = Math.min(0.009, 0.002 + Math.abs(summary.yearRate) / 80);
  let value = summary.expected / (1 + Math.max(summary.yearRate, -0.3) * (days / 252));
  const series = [];

  for (let index = 0; index < days; index += 1) {
    const wave = Math.sin((index + client.name.length) * 1.37) * risk + Math.cos(index * 0.43) * (risk / 2);
    value *= 1 + trend + wave;
    series.push(value);
  }

  const scale = summary.expected / series.at(-1);
  return series.map((point) => point * scale);
}

function renderChart(client) {
  const theme = insurerTheme(client.insurer);
  const series = generateSeries(client, activeRange);
  const width = 900;
  const height = 292;
  const pad = { top: 30, right: 28, bottom: 34, left: 66 };
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = Math.max(1, max - min);
  const x = (index) => pad.left + (index / Math.max(1, series.length - 1)) * (width - pad.left - pad.right);
  const y = (value) => pad.top + (1 - (value - min) / span) * (height - pad.top - pad.bottom);
  const points = series.map((value, index) => `${x(index).toFixed(2)},${y(value).toFixed(2)}`);
  const path = points.map((point, index) => `${index ? "L" : "M"}${point}`).join(" ");
  const area = `${path} L${x(series.length - 1)},${height - pad.bottom} L${pad.left},${height - pad.bottom} Z`;
  const start = series[0];
  const end = series.at(-1);

  els.reserveChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${client.name} 적립금 변화 그래프">
      <defs>
        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.25" />
          <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#chartFill)" />
      <path d="${path}" fill="none" stroke="${theme.primary}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="${x(0)}" cy="${y(start)}" r="6" fill="#ffffff" stroke="${theme.primary}" stroke-width="4" />
      <circle cx="${x(series.length - 1)}" cy="${y(end)}" r="7" fill="${theme.primary}" stroke="#ffffff" stroke-width="4" />
      <text x="${pad.left}" y="20" fill="#66736d" font-size="13" font-weight="800">${formatShortMoney(max)}</text>
      <text x="${pad.left}" y="${height - 10}" fill="#66736d" font-size="13" font-weight="800">${formatShortMoney(min)}</text>
      <text x="${x(series.length - 1) - 108}" y="${Math.max(24, y(end) - 14)}" fill="${theme.ink}" font-size="15" font-weight="900">오늘 ${formatShortMoney(end)}</text>
    </svg>
  `;
  els.chartStartLabel.textContent = `최초등록 ${formatDate(client.baseDate)}`;
  els.chartEndLabel.textContent =
    DATA_DATE === TODAY_DATE ? `오늘 ${formatDate(TODAY_DATE)}` : `오늘 ${formatDate(TODAY_DATE)} · 공시 ${formatDate(DATA_DATE)}`;
}

function resetSimulationWeights(client) {
  simulationWeights = {};
  simulationClientId = client.id;
  simulationSelectedFundIds = (client.allocations || [])
    .filter((allocation) => fundById(allocation.fundId))
    .map((allocation) => allocation.fundId);
  client.allocations.forEach((allocation) => {
    if (fundById(allocation.fundId)) {
      simulationWeights[allocation.fundId] = Math.round(allocation.weight * 100);
    }
  });
}

function normalizedSimulationWeights(funds) {
  const selectedFunds = funds.filter((fund) => simulationSelectedFundIds.includes(fund.id));
  const total = selectedFunds.reduce((sum, fund) => sum + Number(simulationWeights[fund.id] || 0), 0);
  if (!selectedFunds.length) return [];
  if (!total) return [];
  return selectedFunds.map((fund) => ({ fund, weight: Number(simulationWeights[fund.id] || 0) / total }));
}

function selectedSimulationFunds(client) {
  const available = new Map(fundsForInsurer(client.insurer).map((fund) => [fund.id, fund]));
  return simulationSelectedFundIds.map((id) => available.get(id)).filter(Boolean);
}

function simulationWeightTotal(client) {
  return selectedSimulationFunds(client).reduce((sum, fund) => sum + Number(simulationWeights[fund.id] || 0), 0);
}

function setEqualSimulationWeights(client) {
  const selected = selectedSimulationFunds(client);
  if (!selected.length) return;
  const base = Math.floor(100 / selected.length);
  let remainder = 100 - base * selected.length;
  selected.forEach((fund) => {
    simulationWeights[fund.id] = base + (remainder > 0 ? 1 : 0);
    remainder -= 1;
  });
}

function simulationAllocations(client) {
  const normalized = normalizedSimulationWeights(fundsForInsurer(client.insurer));
  return normalized
    .filter((item) => item.weight > 0)
    .map((item) => ({ fundId: item.fund.id, weight: item.weight }));
}

function toggleSimulationFund(fundId) {
  const client = currentClient();
  if (simulationSelectedFundIds.includes(fundId)) {
    simulationSelectedFundIds = simulationSelectedFundIds.filter((id) => id !== fundId);
    delete simulationWeights[fundId];
    if (simulationSelectedFundIds.length && simulationWeightTotal(client) === 0) {
      setEqualSimulationWeights(client);
    }
    return;
  }

  simulationSelectedFundIds = [...simulationSelectedFundIds, fundId];
  setEqualSimulationWeights(client);
}

function renderSimulation(client) {
  const insurerFunds = fundsForInsurer(client.insurer);

  if (simulationClientId !== client.id) {
    resetSimulationWeights(client);
  }

  renderSimulationPicker(client);

  const selectedFunds = insurerFunds.filter((fund) => simulationSelectedFundIds.includes(fund.id));
  els.simulationControls.innerHTML = selectedFunds.length
    ? selectedFunds
    .map((fund) => {
      const weight = clamp(Number(simulationWeights[fund.id] || 0), 0, 100);
      return `
        <div class="sim-row">
          <label>
            <span>${fund.name}</span>
            <span class="sim-inputs">
              <input type="range" min="0" max="100" step="1" value="${weight}" data-sim-fund="${fund.id}" aria-label="${fund.name} 비중" />
              <input class="sim-number" type="number" min="0" max="100" step="1" value="${weight}" data-sim-number="${fund.id}" aria-label="${fund.name} 비중 숫자" />
            </span>
          </label>
          <b class="sim-weight">${weight}%</b>
        </div>
      `;
    })
    .join("")
    : `<div class="empty-state">펀드를 검색해서 선택하면 비중 조정이 가능합니다.</div>`;

  renderSimulationResult(client);
}

function renderSimulationPicker(client) {
  if (!els.simulationPicker) return;
  const insurerFunds = fundsForInsurer(client.insurer);
  const query = (els.simFundSearch?.value || "").trim().toLowerCase();
  const period = rankingPeriodKey();
  const ranked = insurerFunds
    .filter((fund) => {
      const haystack = `${fund.name} ${fund.category} ${fund.fundCd}`.toLowerCase();
      return !query || haystack.includes(query);
    })
    .sort((a, b) => rateForFund(b, period) - rateForFund(a, period));
  const selectedPinned = selectedSimulationFunds(client);
  const seen = new Set();
  const shown = [...selectedPinned, ...ranked]
    .filter((fund) => {
      if (seen.has(fund.id)) return false;
      seen.add(fund.id);
      return true;
    })
    .slice(0, query ? 100 : 70);

  els.simulationPicker.innerHTML = shown
    .map((fund) => {
      const selected = simulationSelectedFundIds.includes(fund.id);
      return `
        <button class="picker-item ${selected ? "selected" : ""}" data-pick-fund="${fund.id}" type="button" style="${insurerStyle(client.insurer)}">
          <span>
            <strong>${fund.name}</strong>
            <small>${fund.category || "분류 없음"} · ${formatPercent(rateForFund(fund, period))}</small>
          </span>
          <b>${selected ? "선택됨" : "선택"}</b>
        </button>
      `;
    })
    .join("");
}

function renderSimulationResult(client) {
  const period = els.simulationPeriod.value;
  const insurerFunds = fundsForInsurer(client.insurer);
  const selectedCount = selectedSimulationFunds(client).length;
  const rawTotal = simulationWeightTotal(client);
  if (els.simulationMeta) {
    els.simulationMeta.textContent = selectedCount
      ? `선택 ${selectedCount}개 · 입력 합계 ${rawTotal}%${rawTotal === 100 ? "" : " · 변경안 반영 시 100%로 자동 환산"}`
      : "펀드를 선택하면 변경안을 만들 수 있습니다.";
  }
  const normalized = normalizedSimulationWeights(insurerFunds);
  if (!normalized.length) {
    els.simulationValue.textContent = "-";
    els.simulationProfit.textContent = selectedCount ? "비중 합계가 0%입니다." : "선택된 펀드가 없습니다.";
    return;
  }
  const rate = normalized.reduce((sum, item) => sum + item.weight * item.fund[period], 0);
  const base = clientSummary(client).expected;
  const projected = base * (1 + rate);
  const profit = projected - base;
  const label = period === "year" ? "1년" : "1개월";

  els.simulationValue.textContent = formatMoney(projected);
  els.simulationProfit.textContent = `${label} ${profit >= 0 ? "+" : ""}${formatShortMoney(profit)} · ${formatPercent(rate)}`;
}

function renderHistory(client) {
  els.historyTable.innerHTML = client.history
    .map(
      (item) => `
        <tr>
          <td>${formatDate(item.date)}</td>
          <td class="numeric">${formatShortMoney(item.value)}</td>
          <td>${item.change}</td>
          <td>${item.reason}</td>
          <td class="${item.result.startsWith("+") ? "up" : "muted"} numeric">${item.result}</td>
        </tr>
      `,
    )
    .join("");
}

function recommendedScenario(client) {
  const ranked = fundsForInsurer(client.insurer).sort((a, b) => b.year - a.year);
  const top = ranked[0];
  const stabilizer = ranked.find((fund) => fund.category.includes("채권") || fund.category.includes("혼합")) || ranked.at(-1);
  const currentYear = weightedRate(client, "year");
  const recommendedRate = top.id === stabilizer.id ? top.year : top.year * 0.7 + stabilizer.year * 0.3;
  const base = clientSummary(client).expected;
  return {
    top,
    stabilizer,
    currentYear,
    recommendedRate,
    projected: base * (1 + recommendedRate),
    diff: base * (recommendedRate - currentYear),
  };
}

function renderNotice(client, summary) {
  els.notice.textContent = `${client.name}님

오늘 적립금
${formatMoney(summary.expected)}

오늘 수익
${summary.dayProfit >= 0 ? "+" : ""}${formatShortMoney(summary.dayProfit)}

누적 수익
${summary.totalProfit >= 0 ? "+" : ""}${formatShortMoney(summary.totalProfit)}

현재 구성
${client.allocations
  .map((allocation) => `${fundById(allocation.fundId).name} ${Math.round(allocation.weight * 100)}%`)
  .join(" · ")}`;
}

function renderReport(client, summary) {
  const scenario = recommendedScenario(client);
  const currentFunds = client.allocations
    .map((allocation) => `${fundById(allocation.fundId).name} ${Math.round(allocation.weight * 100)}%`)
    .join(" / ");
  const recommendation =
    scenario.top.id === scenario.stabilizer.id
      ? `${scenario.top.name} 100%`
      : `${scenario.top.name} 70% / ${scenario.stabilizer.name} 30%`;

  els.reportPreview.innerHTML = `
    <div class="report-block">
      <h4>${client.name} 고객 상담 리포트</h4>
      <dl>
        <dt>보험사</dt>
        <dd>${client.insurer}</dd>
        <dt>상품</dt>
        <dd>${client.product}</dd>
        <dt>현재 적립금</dt>
        <dd>${formatMoney(summary.expected)}</dd>
        <dt>현재 펀드</dt>
        <dd>${currentFunds}</dd>
        <dt>최근 1개월</dt>
        <dd class="${classForValue(summary.monthProfit)}">${summary.monthProfit >= 0 ? "+" : ""}${formatShortMoney(summary.monthProfit)} · ${formatPercent(summary.monthRate)}</dd>
        <dt>최근 1년</dt>
        <dd class="${classForValue(summary.yearProfit)}">${summary.yearProfit >= 0 ? "+" : ""}${formatShortMoney(summary.yearProfit)} · ${formatPercent(summary.yearRate)}</dd>
      </dl>
    </div>
    <div class="report-block report-reason">
      <h4>추천 변경안</h4>
      <dl>
        <dt>변경안</dt>
        <dd>${recommendation}</dd>
        <dt>예상 적립금</dt>
        <dd>${formatMoney(scenario.projected)}</dd>
        <dt>추가 기대</dt>
        <dd class="${classForValue(scenario.diff)}">${scenario.diff >= 0 ? "+" : ""}${formatShortMoney(scenario.diff)}</dd>
      </dl>
      <p>${scenario.top.name}은 연초 이후 수익률이 ${formatPercent(scenario.top.year)}로 같은 보험사 내 상위권이며, ${scenario.stabilizer.name}은 변동성 완충 역할로 배치됩니다.</p>
    </div>
  `;
}

function renderAll() {
  const client = currentClient();
  if (!client) return;
  const summary = clientSummary(client);

  renderAppMeta();
  renderClientList();
  renderHeader(client, summary);
  renderKpis(summary);
  renderChart(client);
  renderAllocationTable(client, summary);
  renderRankingOptions();
  if (!els.rankingInsurer.value) els.rankingInsurer.value = client.insurer;
  renderRanking();
  renderFundCatalog();
  renderSimulation(client);
  renderHistory(client);
  renderNotice(client, summary);
  renderReport(client, summary);
}

function readClientForm() {
  const form = new FormData(els.clientForm);
  const reserve = parseMoneyInput(form.get("reserve"));
  const actualValue = parseMoneyInput(form.get("actualValue"));
  return {
    id: String(form.get("clientId") || "").trim(),
    name: String(form.get("name") || "").trim(),
    segment: String(form.get("segment") || "").trim() || "관리",
    insurer: String(form.get("insurer") || "").trim(),
    product: String(form.get("product") || "").trim(),
    baseDate: sanitizeDate(form.get("baseDate")),
    reserve,
    actualValue: Number.isFinite(actualValue) ? actualValue : reserve,
  };
}

function validAllocationsForInsurer(client, insurer) {
  const fundIds = new Set(fundsForInsurer(insurer).map((fund) => fund.id));
  return (client.allocations || []).filter((allocation) => fundIds.has(allocation.fundId));
}

function openClientModal(client = null) {
  populateModalOptions();
  editingClientId = client?.id || null;
  els.clientForm.reset();
  els.clientModalEyebrow.textContent = client ? "edit client" : "new client";
  els.clientModalTitle.textContent = client ? "고객 수정" : "고객 등록";
  els.clientModalSubmit.textContent = client ? "저장" : "등록";

  const fields = els.clientForm.elements;
  fields.clientId.value = client?.id || "";
  fields.name.value = client?.name || "";
  fields.segment.value = client?.segment || "신규";
  fields.insurer.value = client?.insurer || currentClient()?.insurer || insurers()[0] || "";
  fields.product.value = client?.product || "";
  fields.baseDate.value = client?.baseDate || TODAY_DATE;
  fields.reserve.value = Number.isFinite(client?.baseValue) ? Math.round(client.baseValue) : "";
  fields.actualValue.value = Number.isFinite(client?.actualValue) ? Math.round(client.actualValue) : "";
  els.clientModal.showModal();
}

function closeClientModal() {
  editingClientId = null;
  els.clientForm.reset();
  els.clientModal.close();
}

function saveClientFromForm() {
  const payload = readClientForm();
  if (!payload.name || !payload.insurer || !payload.product || !Number.isFinite(payload.reserve) || payload.reserve < 0) {
    showToast("고객명, 보험사, 상품명, 적립금을 정확히 입력해주세요.");
    return;
  }

  const target = state.clients.find((client) => client.id === (editingClientId || payload.id));
  if (target) {
    const previousInsurer = target.insurer;
    const previousReserve = target.baseValue;
    target.name = payload.name;
    target.segment = payload.segment;
    target.insurer = payload.insurer;
    target.product = payload.product;
    target.baseDate = payload.baseDate;
    target.baseValue = payload.reserve;
    target.actualValue = payload.actualValue;
    target.allocations = previousInsurer === payload.insurer ? validAllocationsForInsurer(target, payload.insurer) : [];
    if (!target.allocations.length) target.allocations = bestDefaultAllocations(payload.insurer);

    const reason = [
      previousInsurer !== payload.insurer ? `보험사 ${previousInsurer} → ${payload.insurer}` : "",
      previousReserve !== payload.reserve ? `적립금 ${formatShortMoney(previousReserve)} → ${formatShortMoney(payload.reserve)}` : "",
    ].filter(Boolean);
    target.history.unshift({
      date: TODAY_DATE,
      value: payload.reserve,
      change: "고객 정보 수정",
      reason: reason.join(" · ") || "기본 정보 수정",
      result: "-",
    });
    state.selectedClientId = target.id;
    resetSimulationWeights(target);
    if (els.rankingInsurer) els.rankingInsurer.value = target.insurer;
    saveState();
    closeClientModal();
    renderAll();
    showToast("고객 정보를 수정했습니다.");
    return;
  }

  const allocations = bestDefaultAllocations(payload.insurer);
  if (!allocations.length) {
    showToast("선택한 보험사의 펀드 데이터가 없습니다.");
    return;
  }

  const id = `client-${Date.now()}`;
  state.clients.unshift({
    id,
    name: payload.name,
    segment: payload.segment,
    insurer: payload.insurer,
    product: payload.product,
    baseDate: payload.baseDate,
    baseValue: payload.reserve,
    actualValue: payload.actualValue,
    allocations,
    history: [
      {
        date: TODAY_DATE,
        value: payload.reserve,
        change: "최초 등록",
        reason: "신규 고객 포트폴리오 등록",
        result: "-",
      },
    ],
  });

  state.selectedClientId = id;
  resetSimulationWeights(currentClient());
  if (els.rankingInsurer) els.rankingInsurer.value = payload.insurer;
  saveState();
  closeClientModal();
  renderAll();
  showToast("고객을 등록했습니다.");
}

function arrangeDashboardColumns() {
  const grid = document.querySelector(".content-grid");
  if (!grid || grid.querySelector(".content-column")) return;

  const mainColumn = document.createElement("div");
  const sideColumn = document.createElement("div");
  mainColumn.className = "content-column content-column--main";
  sideColumn.className = "content-column content-column--side";

  const mainPanels = [
    document.querySelector(".chart-panel"),
    els.fundCatalog?.closest(".panel"),
    els.allocationTable?.closest(".panel"),
    els.historyTable?.closest(".panel"),
    document.querySelector(".report-panel"),
  ].filter(Boolean);

  const sidePanels = [
    els.fundRanking?.closest(".panel"),
    els.simulationPicker?.closest(".panel"),
    els.notice?.closest(".panel"),
  ].filter(Boolean);

  grid.append(mainColumn, sideColumn);
  mainPanels.forEach((panel) => mainColumn.append(panel));
  sidePanels.forEach((panel) => sideColumn.append(panel));
}

function copyText(text, successMessage) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast(successMessage));
    return;
  }

  const helper = document.createElement("textarea");
  helper.value = text;
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
  showToast(successMessage);
}

function enableDragScroll(element) {
  if (!element) return;
  let isDown = false;
  let startY = 0;
  let startScroll = 0;

  element.addEventListener("pointerdown", (event) => {
    isDown = true;
    startY = event.clientY;
    startScroll = element.scrollTop;
    element.classList.add("dragging");
    element.setPointerCapture?.(event.pointerId);
  });

  element.addEventListener("pointermove", (event) => {
    if (!isDown) return;
    element.scrollTop = startScroll - (event.clientY - startY);
  });

  const stop = (event) => {
    isDown = false;
    element.classList.remove("dragging");
    if (event?.pointerId) element.releasePointerCapture?.(event.pointerId);
  };
  element.addEventListener("pointerup", stop);
  element.addEventListener("pointercancel", stop);
  element.addEventListener("pointerleave", stop);
}

function wireEvents() {
  els.clientList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-client-id]");
    if (!button) return;
    state.selectedClientId = button.dataset.clientId;
    resetSimulationWeights(currentClient());
    if (els.rankingInsurer) els.rankingInsurer.value = currentClient().insurer;
    saveState();
    renderAll();
  });

  els.clientSearch.addEventListener("input", renderClientList);

  document.querySelectorAll(".range-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".range-btn").forEach((node) => node.classList.remove("active"));
      button.classList.add("active");
      activeRange = Number(button.dataset.range);
      renderChart(currentClient());
    });
  });

  els.rankingInsurer.addEventListener("change", () => {
    renderRanking();
    renderFundCatalog();
    renderSimulation(currentClient());
  });

  els.rankingPeriod?.addEventListener("change", () => {
    if (rankingPeriodKey() === "day") {
      refreshDayRankingWithLatestData();
      return;
    }
    renderRanking();
    renderFundCatalog();
    renderSimulation(currentClient());
  });

  els.rankingPeriod?.addEventListener("click", () => {
    if (rankingPeriodKey() === "day") refreshDayRankingWithLatestData();
  });

  els.fundSearch?.addEventListener("input", renderFundCatalog);
  els.simFundSearch?.addEventListener("input", () => renderSimulation(currentClient()));

  els.simulationPicker?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-pick-fund]");
    if (!button) return;
    toggleSimulationFund(button.dataset.pickFund);
    renderSimulation(currentClient());
  });

  els.simulationControls.addEventListener("input", (event) => {
    const input = event.target.closest("[data-sim-fund], [data-sim-number]");
    if (!input) return;
    const fundId = input.dataset.simFund || input.dataset.simNumber;
    const value = clamp(Number(input.value || 0), 0, 100);
    simulationWeights[fundId] = value;
    const row = input.closest(".sim-row");
    row?.querySelectorAll(`[data-sim-fund="${fundId}"], [data-sim-number="${fundId}"]`).forEach((control) => {
      if (control !== input) control.value = value;
    });
    const label = row?.querySelector(".sim-weight");
    if (label) label.textContent = `${value}%`;
    renderSimulationResult(currentClient());
  });

  els.simulationPeriod.addEventListener("change", () => renderSimulationResult(currentClient()));

  document.querySelector(".quick-actions").addEventListener("click", (event) => {
    const button = event.target.closest("[data-preset]");
    if (!button) return;
    applyPreset(button.dataset.preset);
    renderSimulation(currentClient());
  });

  document.querySelector("#rebalance-current").addEventListener("click", () => {
    const client = currentClient();
    const allocations = simulationAllocations(client);
    if (!allocations.length) {
      showToast("먼저 시뮬레이션에 반영할 펀드를 선택해주세요.");
      return;
    }
    const before = allocationLabel(client.allocations);
    client.allocations = allocations;
    const after = allocationLabel(client.allocations);
    const summary = clientSummary(client);
    client.history.unshift({
      date: TODAY_DATE,
      value: summary.expected,
      change: after,
      reason: before === after ? "현재 구성 재확인" : `펀드 변경 반영: ${before} → ${after}`,
      result: `${summary.totalProfit >= 0 ? "+" : ""}${formatShortMoney(summary.totalProfit)}`,
    });
    resetSimulationWeights(client);
    saveState();
    renderAll();
    showToast("고객의 현재 펀드 구성을 변경안으로 반영했습니다.");
  });

  document.querySelector("#add-history").addEventListener("click", () => {
    const client = currentClient();
    const summary = clientSummary(client);
    const allocations = simulationAllocations(client);
    const change = allocations.length ? allocationLabel(allocations) : allocationLabel(client.allocations);
    const isSame = allocations.length && currentAllocationSignature(client) === currentAllocationSignature({ allocations });
    client.history.unshift({
      date: TODAY_DATE,
      value: summary.expected,
      change,
      reason: isSame ? "현재 펀드 구성 점검 기록" : "시뮬레이션에서 선택한 펀드 변경안 기록",
      result: `${summary.totalProfit >= 0 ? "+" : ""}${formatShortMoney(summary.totalProfit)}`,
    });
    saveState();
    renderHistory(client);
    showToast("펀드 구성 기준의 관리 이력을 추가했습니다.");
  });

  document.querySelector("#copy-notice").addEventListener("click", () => {
    copyText(els.notice.textContent, "고객 알림 문안을 복사했습니다.");
  });

  document.querySelector("#copy-client-link").addEventListener("click", () => {
    const url = `${location.origin}${location.pathname}?client=${encodeURIComponent(currentClient().id)}`;
    copyText(url, "고객 조회 링크를 복사했습니다.");
  });

  document.querySelector("#print-report").addEventListener("click", () => window.print());
  document.querySelector("#print-report-inline").addEventListener("click", () => window.print());

  els.addClientButton.addEventListener("click", () => openClientModal());
  els.editClientButton.addEventListener("click", () => openClientModal(currentClient()));

  document.querySelector("#close-client-modal").addEventListener("click", closeClientModal);
  document.querySelector("#cancel-client-modal").addEventListener("click", closeClientModal);

  els.clientForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveClientFromForm();
  });

  els.syncDataButton.addEventListener("click", () => {
    syncLatestFundData({ reason: "manual" });
  });

  enableDragScroll(els.fundRanking);
  enableDragScroll(els.fundCatalog);
  enableDragScroll(els.simulationPicker);
}

function applyPreset(preset) {
  const client = currentClient();
  const insurerFunds = fundsForInsurer(client.insurer);
  const rankKey = rankingPeriodKey();
  const rankedByPeriod = [...insurerFunds].sort((a, b) => rateForFund(b, rankKey) - rateForFund(a, rankKey));
  const rankedByYear = [...insurerFunds].sort((a, b) => b.year - a.year);

  simulationClientId = client.id;
  simulationWeights = {};
  simulationSelectedFundIds = [];

  if (preset === "current") {
    resetSimulationWeights(client);
    return;
  }

  if (preset === "clear") {
    simulationSelectedFundIds = [];
    simulationWeights = {};
    return;
  }

  if (preset === "top") {
    simulationSelectedFundIds = [rankedByPeriod[0].id];
    simulationWeights[rankedByPeriod[0].id] = 100;
    return;
  }

  if (preset === "growth") {
    simulationSelectedFundIds = rankedByYear.slice(0, 3).map((fund) => fund.id);
    rankedByYear.slice(0, 3).forEach((fund, index) => {
      simulationWeights[fund.id] = [50, 30, 20][index] || 0;
    });
    return;
  }

  if (preset === "defense") {
    const stable = insurerFunds.filter((fund) => fund.category.includes("채권") || fund.category.includes("혼합"));
    const growth = rankedByYear.find((fund) => !stable.includes(fund)) || rankedByYear[0];
    simulationSelectedFundIds = [stable[0], stable[1], growth].filter(Boolean).map((fund) => fund.id);
    if (stable[0]) simulationWeights[stable[0].id] = 60;
    if (stable[1]) simulationWeights[stable[1].id] = 20;
    if (growth) simulationWeights[growth.id] = Math.max(simulationWeights[growth.id], 20);
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function populateModalOptions() {
  const select = els.clientForm.querySelector('[name="insurer"]');
  select.innerHTML = insurers()
    .map((insurer) => `<option value="${insurer}">${insurer}</option>`)
    .join("");
}

function initFromUrl() {
  const params = new URLSearchParams(location.search);
  const clientId = params.get("client");
  if (clientId && state.clients.some((client) => client.id === clientId)) {
    state.selectedClientId = clientId;
  }
  resetSimulationWeights(currentClient());
}

async function bootstrap() {
  renderIcons();
  await loadAppMeta();
  await loadExternalFundData();
  populateModalOptions();
  initFromUrl();
  arrangeDashboardColumns();
  wireEvents();
  renderAll();
}

bootstrap();
