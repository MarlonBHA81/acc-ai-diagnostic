# The 7-Zone Business Diagnostic — Accounting Firm Edition

A **Story Advantage** lead-generating diagnostic quiz. Accounting-firm partners
enter their details **up front**, score their firm across 7 zones × 5 dimensions,
and get their **binding constraint** — the one bottleneck AI should fix first —
plus a results dashboard and an emailed report. Even an abandoned quiz produces a
usable lead, because contact details are captured before the questions start.

Built from the source-of-truth prototype (`7zonediagnosticquiz`) with two
deliberate changes: **lead capture moved to the start**, and **all money fields
made multi-currency**. Brand styling is Story Advantage's, from the brand manual.

```
Welcome + Details (the gate) → Firm Baseline → Zone 1 … Zone 7 → Results
```

## Stack

- **Frontend:** Vite + React + TypeScript, hand-rolled CSS on a design-token file
  (`src/styles/tokens.css`). Mobile-first, solid down to 360px.
- **Backend:** one serverless route, `POST /api/lead`. The logic lives in a
  framework-agnostic handler (`src/server/handleLead.ts`); `api/lead.ts` is the
  **Vercel** adapter (primary) and `functions/api/lead.ts` the Cloudflare Pages
  adapter (alternate). The browser never sees the webhook URL or email key.
- **No database, no cookies, no localStorage for answers.** The n8n webhook owns
  persistence. Quiz state is in-memory only.
- **Email:** report to the prospect via **Resend** (skipped silently if unset).

## Develop

```bash
npm install
npm run dev        # Vite dev server
npm test           # unit tests (scoring, currency, phone, email)
npm run build      # tsc + vite build → dist/
npm run typecheck
```

### Which edition runs (one codebase → both editions)

This is a single codebase that produces **both** the Generic Business Edition and
the Accounting Firm Edition. The active vertical is chosen by an environment
variable — nothing is forked or duplicated:

| Context | Variable | Values |
|---|---|---|
| Frontend build (Vite) | `VITE_VERTICAL` | `accounting` \| `generic` |
| Serverless functions (Vercel / Cloudflare) | `VERTICAL` | `accounting` \| `generic` |

Unset (or `generic`) → the base Generic Business Edition. `accounting` → the
Accounting Firm Edition. Any unknown value falls back to `generic` with a console
warning. The selector lives in `src/config/active.ts`; because the app entry
(`main.tsx`, `SharedResult.tsx`) **and** the `/api/lead` handler all import
`activeConfig`, the on-screen results, the report email, and the PDF always switch
together. Set **both** variables to the same value on a given deployment.

```bash
# run the accounting edition locally (set both so the API + PDF match the UI)
VITE_VERTICAL=accounting VERTICAL=accounting npm run dev

# run the generic edition (default — no env var needed)
npm run dev
```

The route stays `/` for the app and `/r/:id` for shared results in both editions.

## Deploy (Vercel — primary)

Easiest path, no CLI needed:

1. Push this repo to GitHub (done).
2. In Vercel → **Add New… → Project → Import** this repo. Vercel auto-detects
   Vite (build `npm run build`, output `dist`); `api/lead.ts` is picked up as the
   serverless route automatically.
3. In **Settings → Environment Variables**, add the variables below (Production +
   Preview), then **Deploy**. Every future `git push` redeploys.

Or via CLI: `npm i -g vercel && vercel` (first run links the project) then
`vercel --prod`.

> **This repo is the dedicated Accounting Firm Edition deployment.** When importing
> it into Vercel, set **`VITE_VERTICAL=accounting`** and **`VERTICAL=accounting`**
> (Production + Preview). These two are required here so the frontend, the API, the
> report email, and the PDF all render the accounting copy. (The generic edition
> still lives in the same source and can be produced by leaving them unset — that's
> how the unit tests exercise both — but this deployment always sets them to
> `accounting`.)

| Variable | Required (accounting deploy) | Purpose |
|---|---|---|
| `VITE_VERTICAL` | **yes → `accounting`** | Frontend edition (Vite, inlined at build). |
| `VERTICAL` | **yes → `accounting`** | Serverless edition (functions read at runtime; must match `VITE_VERTICAL`). |
| `LEAD_WEBHOOK_URL` | yes | n8n webhook (the accounting workflow); receives both events. |
| `EMAIL_API_KEY` | no | Resend API key. Report email skipped if unset. |
| `EMAIL_FROM` | no | e.g. `diagnostics@storyadvantage.co`. Required to send email. |
| `NOTIFY_EMAIL` | no | Internal "new lead" alert address. |
| `ALLOWED_ORIGIN` | no | CORS lock for `/api/lead` (the app's exact origin). |
| `SUPABASE_URL` | no | Supabase project URL — stores results + enables the shareable link. |
| `SUPABASE_SERVICE_ROLE_KEY` | no | Supabase service-role key (server-only). |
| `APP_URL` | no | Base URL for the results link in the email (defaults to request origin). |

Embedding headers (`frame-ancestors`) are set in `vercel.json` — add your
WordPress domain there.

## Storing results in Supabase (+ the emailed results link)

When `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set, each completed
diagnostic is inserted into a `diagnostics` table by the `/api/lead` function,
and a shareable link — `${APP_URL}/r/<id>` — is added to the report email and to
the payload forwarded to n8n. The link opens a read-only results page
(`/r/:id`) that re-renders the diagnostic from Supabase.

Create the table once in the Supabase SQL editor:

```sql
create table if not exists public.diagnostics (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  email              text,
  business_name      text,
  binding_constraint text,
  constraint_votes   int,
  currency           text,
  payload            jsonb not null           -- the full diagnostic_completed event
);

-- Only the server (service-role key) reads/writes; no public policies.
alter table public.diagnostics enable row level security;
```

The `/api/result?id=<uuid>` function reads a row with the service-role key
server-side, so the key is never exposed and the anon client can't query the
table directly.

### Supabase decision: one project, shared table + bucket

**The accounting and generic editions reuse the same `diagnostics` table and the
same `reports` Storage bucket** — one Supabase project serves both. Every row (and
every webhook payload) already carries a `source` field from the active config's
`sourceTag` (`accounting-diagnostic` vs `business-diagnostic`), so the two editions
filter cleanly with `where source = 'accounting-diagnostic'`. This keeps
operations simple (one schema, one bucket, one set of keys) and lets you report
across editions when you want to. If you later need hard data isolation (separate
billing, separate RLS, compliance), point the accounting project at its own
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — no code changes are required, since
those are per-deployment env vars.

## Downloadable PDF

Two paths, both branded (print CSS hides interactive elements and adds a report
header):

1. **On-page button** — the results page **Download PDF** button uses
   `window.print()` (client-side, zero deps, vector/selectable text).
2. **Hosted PDF file** (`/api/pdf?id=<uuid>`) — a Vercel **Node** function
   renders `/r/:id` with headless Chromium (`puppeteer-core` +
   `@sparticuz/chromium`), uploads the PDF to **Supabase Storage** (`reports`
   bucket, `reports/<id>.pdf`), and redirects to the hosted file. It's lazy +
   cached: generated on the first request per result, then served from storage.
   The report email's "Download PDF" button links here (`event.pdfUrl`).

Set-up for the hosted PDF:

- Create a **public** Storage bucket named `reports` (Supabase → Storage → New
  bucket → public).
- Requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `APP_URL` (the
  function navigates to `${APP_URL}/r/:id`).
- `@sparticuz/chromium` cold starts take a few seconds — the function sets
  `maxDuration: 60`, so a plan that allows >10s (Vercel Pro) is recommended;
  cached hits are instant.

## Booking / consultation CTA

The results page and email link to the **AI Automations Debrief** booking widget
(`closing.ctaUrl` in the industry config). The results page also embeds the
booking calendar inline and shows a congratulations card. Change the URL/text in
`src/config/industries/*.ts`.

### Alternate: Cloudflare Pages

The same handler runs on Cloudflare via `functions/api/lead.ts`:
`npm run build && npx wrangler pages deploy dist`, with the same env vars set in
Pages → Settings → Variables. Headers come from `public/_headers`.

## Webhook events (n8n setup)

Both events are forwarded by `/api/lead` to `LEAD_WEBHOOK_URL`. The two-event
design lets you tag **abandoners** (got event 1, never got event 2) for a
"finish your diagnostic" follow-up.

**Event 1 — `lead_captured`** (fired when details are submitted, before Zone 1):

```json
{
  "event": "lead_captured",
  "capturedAt": "2026-07-14T09:00:00.000Z",
  "source": "accounting-diagnostic",
  "lead": { "firstName": "", "lastName": "", "businessName": "", "email": "", "mobile": "+27…" }
}
```

**Event 2 — `diagnostic_completed`** (fired on results render):

```json
{
  "event": "diagnostic_completed",
  "completedAt": "2026-07-14T09:12:00.000Z",
  "source": "accounting-diagnostic",
  "lead": { "firstName": "", "lastName": "", "businessName": "", "email": "", "mobile": "" },
  "baseline": { "currency": "ZAR", "monthlyRevenue": null, "teamSize": null, "chargeOutRate": null },
  "bindingConstraint": "Client Delivery",
  "constraintVotes": 2,
  "constraintMonthlyCost": null,
  "zones": [
    { "zone": "", "hoursPerWeek": 0, "repetitiveness": 0, "aiUsage": "None", "marginImpact": "Low", "partnerInvolvement": 0, "compressionScore": 0, "bottleneck": "", "desiredFix": "" }
  ]
}
```

**n8n:** create a Webhook node (POST), point `LEAD_WEBHOOK_URL` at its URL, and
branch on `{{$json.event}}`. Match a completed diagnostic to its lead by `email`
(the `lead` block repeats in both events). To catch abandoners, wait ~24h after a
`lead_captured` and check whether a `diagnostic_completed` with the same email
arrived.

The `/api/lead` route drops the internal `antiSpam` field before forwarding, so
n8n never sees the honeypot/timing data.

## Anti-spam

- **Honeypot** — a hidden `company_website` field. If filled, the request is
  rejected server-side.
- **Timing** — a `diagnostic_completed` arriving under **60 seconds** after the
  gate was passed is rejected as a bot.
- **Email** is validated on the client *and* re-validated server-side.

## Currency behaviour

The baseline screen has a segmented selector: **R ZAR (default)**, **$ USD**,
**€ EUR**, **£ GBP**. The chosen currency drives every money display and the
report email — symbol, and thousands grouping via `Intl.NumberFormat` with the
matching locale (`en-ZA`, `en-US`, `en-IE`, `en-GB`). It's included in the
`diagnostic_completed` payload. **Changing currency reformats displays; it never
converts values.**

> Note: the exact group separator (space vs comma) for a locale is decided by the
> runtime's ICU/CLDR data, so `R 84 000` vs `R 84,000` can differ between the
> browser and the email server. Both are correct locale output.

## Scoring (identical to the prototype)

- **Compression Score** = `hours × repetitiveness × (6 − aiUsage)`.
- **Test 1 (volume):** max `hours × repetitiveness`; tiebreak compression.
- **Test 2 (margin):** max margin impact → tiebreak min AI usage → tiebreak compression.
- **Test 3 (partner):** max partner involvement; tiebreak compression.
- **Binding constraint** = mode of the three winners; on a 1-1-1 split, the
  highest compression among them wins. `votes` is recorded.
- If a charge-out rate is given, monthly cost = `hours × 4.33 × rate`, formatted
  in the selected currency.

Unit tests cover the compression math, all three tests and their tiebreaks, the
1-1-1 case, cost formatting in all four currencies, ZA (+27) mobile validation,
and report-email rendering (including XSS escaping of free-text).

## Embedding (WordPress / Divi)

The app reports its height to the parent frame (`postMessage`) so the iframe can
auto-resize. Paste this where you want the diagnostic:

```html
<iframe
  id="sa-diagnostic"
  src="https://YOUR-PAGES-DOMAIN/"
  title="The 7-Zone Business Diagnostic"
  style="width:100%;border:0;min-height:900px"
  loading="lazy"></iframe>
<script>
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type === 'sa-diagnostic:height' && typeof d.height === 'number') {
      var f = document.getElementById('sa-diagnostic');
      if (f) f.style.height = d.height + 'px';
    }
  });
</script>
```

Embedding is allowed only from origins listed in `public/_headers`
(`Content-Security-Policy: frame-ancestors`). Add your WordPress domain there.

## Analytics

If a `window.dataLayer` is present (GTM), the app pushes: `diagnostic_started`,
`lead_submitted`, `zone_completed` (with `zone` id), `results_viewed`. No-op
otherwise.

## Industry templating

All vertical copy lives in `src/config/industries/*.ts` (`accounting.ts`,
`generic.ts`), typed against `src/config/IndustryConfig.ts`, and selected by
`src/config/active.ts` from `VITE_VERTICAL` / `VERTICAL`. The scoring engine, brand
tokens, screens, PDF, and email are industry-agnostic — add a vertical by writing
one config file and registering it in `active.ts`.

**A small amount of otherwise-shared results/email chrome is config-driven** via an
optional `terminology` block on `IndustryConfig`. Omitting it (as `generic` does)
keeps the original hard-coded defaults, so the generic edition is byte-identical;
`accounting` sets it to get firm-specific wording:

- Results + email **cost line** — accounting reads *"… = {amount}/month of
  billable-equivalent capacity"* (`terminology.costLinePrefix: ''`,
  `costLineSuffix: 'of billable-equivalent capacity'`); generic keeps *"Rough
  monthly cost of this zone: …"*. The **numbers are identical**; only wording differs.
- Report **email subject** — accounting uses *"{First}, your firm's binding
  constraint is {Constraint}"* (`terminology.emailSubjectTemplate`); generic keeps
  *"{First}, your binding constraint is {Constraint}"*.

Consumed by `src/screens/ResultsView.tsx` and `src/email/renderReport.ts`; both
fall back to the generic strings when `terminology` (or a field) is absent.

## Testing

- **Unit (`npm test`)** — 72 tests: scoring + tiebreaks + 1-1-1, currency in all
  four currencies, ZA (+27) mobile, email rendering + XSS, the `/api/lead`
  handler (honeypot, invalid email, <60s, CORS, webhook-fail), the Supabase
  Storage helpers (`pdfStorage`), and the Accounting Firm Edition
  (`src/config/industries/accounting.test.ts`: config satisfies `IndustryConfig`,
  env-selectable `active.ts` resolves accounting via `VERTICAL` and falls back to
  generic on unknown/unset, and the `accounting-diagnostic` sourceTag + "Partner
  involvement" terminology propagate into the payload, results table header, and
  report email).
- **App locally (`npm run dev`)** — run the quiz; the results page's client-side
  Download PDF works without any backend.
- **PDF render smoke test (`npm run smoke:pdf`)** — serves the built app + a mock
  `/api/result` and drives a local Chrome exactly like `/api/pdf` (navigate to
  `/r/:id` → `page.pdf()`), writing `smoke-report.pdf`. Requires
  `npm run build` first and `PUPPETEER_EXECUTABLE_PATH` set to a local Chrome.
- **Functions locally (`vercel dev`)** — exercises `/api/lead`, `/api/result`,
  `/api/pdf` against real env (`vercel env pull`); set
  `PUPPETEER_EXECUTABLE_PATH` so the PDF function uses local Chrome.
- **End-to-end (Vercel Preview)** — with the `diagnostics` table + public
  `reports` bucket + env vars set: complete a diagnostic, then verify the
  Supabase row, the email, `/r/:id`, and `/api/pdf?id=<id>` (first hit
  generates + uploads; second hit is instant/cached).

## Ship checklist

- [ ] `LEAD_WEBHOOK_URL` set; n8n workflow live and handling both events.
- [ ] `EMAIL_API_KEY` + `EMAIL_FROM` set (or intentionally left off).
- [ ] `ALLOWED_ORIGIN` set to the app's origin.
- [ ] Real **CTA text + URL** and **privacy policy URL** filled in
      (`src/config/industries/accounting.ts`, `src/config/app.ts`).
- [ ] Real **logo** dropped into `src/components/Logo.tsx` (currently an inline
      SVG placeholder in brand colours).
- [ ] WordPress domain added to `frame-ancestors` (`vercel.json`, or
      `public/_headers` on Cloudflare).
- [ ] Verified the embed on the target WordPress/Divi page.
```
