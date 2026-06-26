const DATASET = "life-insurance-variable-funds";

function supabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function headers(extra = {}) {
  const env = supabaseEnv();
  if (!env) throw new Error("SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.");
  return {
    apikey: env.key,
    Authorization: `Bearer ${env.key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function supabaseFetch(path, options = {}) {
  const env = supabaseEnv();
  if (!env) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  const response = await fetch(`${env.url}/rest/v1/${path}`, {
    ...options,
    headers: headers(options.headers),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase ${response.status}: ${text}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function toSnapshotRow(fund, fetchedAt) {
  return {
    std_date: fund.stdDate,
    fund_id: fund.id,
    member_cd: fund.memberCd || null,
    fund_cd: fund.fundCd || null,
    insurer: fund.insurer,
    name: fund.name,
    setting_date: fund.settingDate || null,
    nav: fund.nav,
    day: fund.day,
    month: fund.month,
    year: fund.year,
    three_year_rate: fund.threeYearRate,
    five_year_rate: fund.fiveYearRate,
    cumulative_rate: fund.cumulativeRate,
    big_type: fund.bigType || null,
    small_type: fund.smallType || null,
    category: fund.category || null,
    net_assets: fund.netAssets,
    source: fund.source,
    source_url: fund.sourceUrl,
    raw: {
      oneYear: fund.oneYear,
      threeYear: fund.threeYear,
      fiveYear: fund.fiveYear,
      sevenYear: fund.sevenYear,
      tenYear: fund.tenYear,
      fifteenYear: fund.fifteenYear,
      cumulative: fund.cumulative,
      fees: fund.fees,
      assetMix: fund.assetMix,
      previousNav: fund.previousNav,
      previousStdDate: fund.previousStdDate,
      monthAgoNav: fund.monthAgoNav,
      monthAgoStdDate: fund.monthAgoStdDate,
      report: fund.report,
    },
    fetched_at: fetchedAt,
  };
}

function fromSnapshotRow(row) {
  const raw = row.raw || {};
  return {
    id: row.fund_id,
    stdDate: row.std_date,
    memberCd: row.member_cd,
    fundCd: row.fund_cd,
    insurer: row.insurer,
    name: row.name,
    settingDate: row.setting_date,
    nav: Number(row.nav || 0),
    day: Number(row.day || 0),
    month: Number(row.month || 0),
    quarter: Number(row.month || 0) * 3,
    halfYear: Number(row.month || 0) * 6,
    year: Number(row.year || 0),
    threeYearRate: Number(row.three_year_rate || 0),
    fiveYearRate: Number(row.five_year_rate || 0),
    cumulativeRate: Number(row.cumulative_rate || 0),
    oneYear: raw.oneYear,
    threeYear: raw.threeYear,
    fiveYear: raw.fiveYear,
    sevenYear: raw.sevenYear,
    tenYear: raw.tenYear,
    fifteenYear: raw.fifteenYear,
    cumulative: raw.cumulative,
    fees: raw.fees || {},
    assetMix: raw.assetMix || {},
    previousNav: raw.previousNav,
    previousStdDate: raw.previousStdDate,
    monthAgoNav: raw.monthAgoNav,
    monthAgoStdDate: raw.monthAgoStdDate,
    bigType: row.big_type,
    smallType: row.small_type,
    category: row.category,
    netAssets: Number(row.net_assets || 0),
    source: row.source,
    sourceUrl: row.source_url,
    report: raw.report || "펀드현황",
  };
}

async function upsertRows(table, rows, conflict) {
  const chunkSize = 500;
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    await supabaseFetch(`${table}?on_conflict=${conflict}`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(chunk),
    });
  }
}

export function hasSupabase() {
  return Boolean(supabaseEnv());
}

export async function saveFundPayload(payload) {
  const fetchedAt = payload.meta.fetchedAt || new Date().toISOString();
  const metaRow = {
    dataset: DATASET,
    source_name: payload.meta.sourceName,
    source_url: payload.meta.sourceUrl,
    std_date: payload.meta.stdDate,
    previous_std_date: payload.meta.previousStdDate,
    month_ago_std_date: payload.meta.monthAgoStdDate,
    fund_count: payload.meta.fundCount,
    insurer_count: payload.meta.insurerCount,
    insurers: payload.meta.insurers,
    notice: payload.meta.notice,
    fetched_at: fetchedAt,
  };

  await upsertRows("fund_dataset_meta", [metaRow], "dataset");
  await upsertRows("fund_snapshots", payload.funds.map((fund) => toSnapshotRow(fund, fetchedAt)), "std_date,fund_id");
}

export async function loadFundPayload() {
  const metaRows = await supabaseFetch(
    `fund_dataset_meta?dataset=eq.${encodeURIComponent(DATASET)}&select=*&limit=1`,
    { method: "GET" },
  );
  const metaRow = metaRows?.[0];
  if (!metaRow) return null;

  const funds = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const rows = await supabaseFetch(
      `fund_snapshots?std_date=eq.${metaRow.std_date}&select=*&order=insurer.asc,name.asc`,
      {
        method: "GET",
        headers: { Range: `${offset}-${offset + pageSize - 1}` },
      },
    );
    funds.push(...(rows || []).map(fromSnapshotRow));
    if (!rows || rows.length < pageSize) break;
  }

  return {
    meta: {
      dataset: metaRow.dataset,
      sourceName: metaRow.source_name,
      sourceUrl: metaRow.source_url,
      stdDate: metaRow.std_date,
      previousStdDate: metaRow.previous_std_date,
      monthAgoStdDate: metaRow.month_ago_std_date,
      fetchedAt: metaRow.fetched_at,
      fundCount: metaRow.fund_count,
      insurerCount: metaRow.insurer_count,
      insurers: metaRow.insurers || [],
      notice: metaRow.notice,
      storage: "supabase",
    },
    funds,
  };
}
