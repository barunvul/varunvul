# 변액보험 매니저 Pro

변액보험 고객, 펀드 구성, 예상 적립금, 펀드 랭킹, 변경 시뮬레이션, 관리 이력, 상담 리포트를 한 화면에서 관리하는 웹앱입니다.

현재 구조는 Vercel 배포를 기준으로 구성되어 있습니다.

- 화면: 정적 HTML/CSS/JS
- 서버 함수: `api/funds.js`, `api/update-funds.js`, `api/status.js`
- DB: Supabase PostgreSQL
- 자동 갱신: Vercel Cron
- 로컬 보조 수집: `scripts/update_funds.py`

## 로컬 실행

```powershell
npm run dev
```

브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:5173/
```

PowerShell 실행 정책 때문에 막히는 환경에서는 기존 스크립트도 사용할 수 있습니다.

```powershell
.\start.ps1
```

## 환경변수

`.env.example`을 참고해서 로컬에서는 `.env`를 만들고, Vercel에서는 Project Settings > Environment Variables에 같은 값을 넣습니다.

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
UPDATE_SECRET=
PORT=5173
PYTHON=
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버 함수에서만 사용합니다. 브라우저 코드에는 넣지 마세요.

`UPDATE_SECRET`은 선택 사항입니다. 값을 비우면 앱의 데이터 수집 버튼이 바로 동작합니다. 값을 넣으면 `/api/update-funds?secret=값` 또는 `x-update-secret` 헤더가 필요합니다.

## Supabase 설정

1. Supabase에서 새 프로젝트를 만듭니다.
2. SQL Editor를 엽니다.
3. [supabase/schema.sql](./supabase/schema.sql) 내용을 그대로 실행합니다.
4. Project Settings > API에서 `Project URL`을 `SUPABASE_URL`로 저장합니다.
5. `service_role` 키를 `SUPABASE_SERVICE_ROLE_KEY`로 저장합니다.

펀드 공시 데이터는 `fund_dataset_meta`, `fund_snapshots`에 저장됩니다. 고객 CRM용 테이블도 스키마에 준비되어 있지만, 현재 MVP에서는 고객 정보가 브라우저 로컬 저장소에 저장됩니다. 실제 고객 DB 저장은 로그인/권한 설계 후 연결하는 것이 안전합니다.

## 기존 펀드 자료를 Supabase에 저장

이미 생성된 `data/funds.json`을 Supabase에 바로 저장하려면 `.env`에 Supabase 값을 넣은 뒤 아래 명령을 실행합니다.

```powershell
npm run db:push-funds
```

성공하면 `fund_dataset_meta`, `fund_snapshots`에 현재 JSON 파일의 기준일과 펀드 목록이 저장됩니다.

## Vercel 배포

1. 이 폴더를 GitHub 저장소로 올립니다.
2. Vercel에서 New Project를 선택합니다.
3. Root Directory를 이 앱 폴더로 지정합니다.
4. Build Command는 `npm run build`를 사용합니다.
5. Output Directory는 비워둡니다.
6. Environment Variables에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`를 등록합니다.
7. Deploy를 실행합니다.

배포 후 확인 주소:

```text
https://your-domain.vercel.app/api/status
https://your-domain.vercel.app/api/funds
```

최초 배포 직후 Supabase가 비어 있으면 아래 주소를 한 번 호출해 공시 데이터를 저장합니다.

```text
https://your-domain.vercel.app/api/update-funds
```

## 매일 자동 업데이트

`vercel.json`에 Vercel Cron이 설정되어 있습니다.

```json
{
  "path": "/api/update-funds",
  "schedule": "10 22 * * *"
}
```

Vercel Cron은 UTC 기준으로 동작합니다. 위 설정은 한국시간 기준 매일 오전 7시 10분에 실행됩니다. 보험협회 공시가 갱신되지 않는 날에는 같은 기준일 데이터가 유지될 수 있습니다.

## 데이터 흐름

```text
앱 화면
  -> /api/funds
  -> Supabase fund_snapshots
  -> 없으면 data/funds.json 정적 파일 fallback
```

수집 버튼 또는 Cron:

```text
/api/update-funds
  -> 생명보험협회 공시 페이지 수집
  -> Supabase 저장
  -> 앱에서 /api/funds로 최신 데이터 조회
```

## 로컬 수동 수집

로컬에서 파일 기반 데이터를 다시 만들 때 사용합니다.

```powershell
npm run update:funds
```

또는:

```powershell
.\update-funds.ps1
```

생성 파일:

- `data/funds.json`
- `data/products.json`

## 점검 명령

```powershell
npm run check
```

Vercel 배포 전 JavaScript 문법을 빠르게 확인합니다.

## 주의

고객의 실제 보험계약 적립금 자동 조회는 각 보험사의 로그인, 본인인증, 스크래핑 정책, 개인정보 처리 이슈 때문에 MVP 범위에서는 제외했습니다. 현재 방식은 사용자가 입력한 기준 적립금과 변액보험 펀드 기준가/수익률 변화를 이용해 예상 적립금을 계산합니다.
