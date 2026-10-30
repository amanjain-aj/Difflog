# DiffLog (`difflog.dev`)

> **"The API Release Communication Platform — Never ship silent breaking API changes again."**

---

## 1. Project Brief

### The Problem
Engineering teams deploy frequent backend and OpenAPI schema changes. Release notes either lag weeks behind—silently breaking partner integrations and causing expensive production fire drills—or developers waste hours manually drafting release notes after every sprint.

### The Solution (USP)
**DiffLog** is not just a diff tool—it is the complete **API Release Communication Platform**. It pairs a zero-config **GitHub Composite Action** that runs deterministic schema diffing via `oasdiff` in CI, securely dispatches the diff to a serverless backend, generates developer-focused migration guides using **Structured AI**, and immediately publishes updates to a branded, hosted public changelog portal (`/{slug}`) complete with semantic impact badges (`[BREAKING]`, `[NEW]`, `[CHANGED]`, `[DEPRECATED]`), **RSS/Atom XML feeds**, and **Slack/Discord alert webhooks**.

### Key Features & Value Proposition
- **Guaranteed Breaking Change Prevention:** Catches removed fields, new required headers, and status code changes deterministically via `oasdiff` before partner integrations fail.
- **Zero-Hallucination Structured AI Summarizer:** Generates clear migration guides explaining *why* the change happened and *how* partner developers should adapt.
- **Stripe-Grade Hosted Developer Portal (`/[slug]`):** Instant public status and release website with route-level search, semantic filters, and raw schema diff inspection.
- **Automated Developer Feeds & Webhooks:** Standards-compliant RSS/Atom feeds (`/[slug]/rss.xml`) and Slack/Discord webhook broadcasts.
- **Dual-Mode Database Persistence:** Production-ready **Supabase PostgreSQL** schema with Row-Level Security (RLS) and indexes, paired with an automatic **local persistent JSON store** (`.data/specsync-db.json`) so the app runs out-of-the-box locally.
- **Hosted Public Changelog Portal (`/[slug]`):** Server-side rendered developer portal with endpoint search, semantic tag filters, breaking change warning banners, and an expandable raw `oasdiff` JSON inspector.
- **Public Developer Feeds (`/[slug]/rss.xml` & `/[slug]/feed.xml`):** Standards-compliant RSS 2.0 XML feeds for feed readers and Slack/Discord RSS integrations.
- **Customer Admin Dashboard (`/dashboard`):** Create API projects, generate/rotate SHA-256 hashed `ss_live_...` API keys, edit release Markdown, toggle draft/published visibility, and test ingestion via the interactive **CI Ingestion Simulator** (`/dashboard/simulator`).
- **Stripe Subscription Billing (`/dashboard/billing`):** Founding Member Starter ($29/mo), Growth ($79/mo), and Scale ($199/mo) subscription checkout and webhook lifecycle handling.

---

## 2. Directory Structure

```text
elegant-curie/
├── .github/
│   └── actions/
│       └── specsync/
│           └── action.yml                  # Reusable GitHub Composite Action (oasdiff + curl ingest)
├── action.yml                              # Root GitHub Action definition for repo-root invocation
├── supabase/
│   └── migrations/
│       └── 0001_init_specsync.sql          # PostgreSQL / Supabase DDL, indexes & RLS policies
├── examples/
│   ├── openapi-v1.yaml                     # Sample base OpenAPI 3.0 spec (Acme Payments API v1)
│   ├── openapi-v2.yaml                     # Sample target OpenAPI 3.0 spec (with breaking/new changes)
│   └── sample-oasdiff-payload.json         # Sample deterministic oasdiff JSON payload for testing
├── scripts/
│   └── test-ingest.mjs                     # CLI dogfooding script to test POST /api/v1/ingest
├── src/
│   ├── app/
│   │   ├── globals.css                     # Tailwind CSS & dark developer theme tokens
│   │   ├── layout.tsx                      # Root HTML layout & metadata
│   │   ├── page.tsx                        # DiffLog Developer Landing Page & Architecture overview
│   │   ├── [slug]/
│   │   │   ├── page.tsx                    # SSR Hosted Public Changelog Portal (e.g. /acme-payments)
│   │   │   ├── rss.xml/
│   │   │   │   └── route.ts                # Public RSS 2.0 XML feed endpoint (/[slug]/rss.xml)
│   │   │   └── feed.xml/
│   │   │       └── route.ts                # Alias XML feed endpoint (/[slug]/feed.xml)
│   │   ├── dashboard/
│   │   │   ├── page.tsx                    # Customer Admin Portal (Projects, API Keys, Markdown Editor)
│   │   │   ├── simulator/
│   │   │   │   └── page.tsx                # Interactive CI Diff & Live AI Ingestion Simulator
│   │   │   └── billing/
│   │   │       └── page.tsx                # Stripe Billing & Founding Member Plan selector
│   │   └── api/
│   │       ├── v1/
│   │       │   └── ingest/
│   │       │       └── route.ts            # POST /api/v1/ingest (Bearer Auth + Strict AI JSON Schema)
│   │       ├── projects/
│   │       │   ├── route.ts                # GET/POST projects & rotate SHA-256 API keys
│   │       │   └── [id]/entries/
│   │       │       └── route.ts            # GET/PATCH/DELETE changelog entries
│   │       └── billing/
│   │           ├── checkout/
│   │           │   └── route.ts            # POST Stripe Checkout Session creator
│   │           └── webhook/
│   │               └── route.ts            # POST Stripe Webhook lifecycle handler
│   ├── components/
│   │   ├── changelog/
│   │   │   ├── badges.tsx                  # [BREAKING], [NEW], [CHANGED], [DEPRECATED] & HTTP pills
│   │   │   └── public-portal-client.tsx    # Interactive search, tag filter & raw diff viewer
│   │   └── dashboard/
│   │       └── dashboard-nav.tsx           # Admin navigation header
│   └── lib/
│       ├── crypto/
│       │   └── api-keys.ts                 # API key generator & SHA-256 hashing utilities
│       ├── db/
│       │   ├── types.ts                    # TypeScript interfaces for database entities
│       │   ├── seed.ts                     # Pre-seeded demo org, projects & release entries
│       │   ├── supabase.ts                 # Supabase service-role client initialization
│       │   └── index.ts                    # Unified data access layer (Supabase + Local JSON fallback)
│       ├── llm/
│       │   └── summarizer.ts               # Structured AI Output client, CHANGELOG_PROMPT & JSON_SCHEMA
│       ├── webhooks/
│       │   └── dispatcher.ts               # Slack & Discord release notification webhook sender
│       ├── rss.ts                          # RSS 2.0 XML builder shared by /rss.xml and /feed.xml
│       ├── stripe.ts                       # Stripe SDK configuration & plan definitions
│       └── utils.ts                        # Classname & date/commit formatting helpers
├── .env.example                            # Template for environment variables
├── next.config.mjs                         # Next.js configuration
├── package.json                            # Dependencies and npm scripts
├── postcss.config.mjs                      # PostCSS configuration
├── tailwind.config.ts                      # Tailwind CSS configuration
└── tsconfig.json                           # TypeScript configuration
```

---

## 3. System Architecture

```text
+-------------------------------------------------------------------------+
| CUSTOMER REPOSITORY (GitHub Actions Runner)                              |
|                                                                         |
|  [Merge Event: main / master]                                           |
|         │                                                               |
|         ▼                                                               |
|  Action: difflog/action@v1 (action.yml)                                 |
|  • Fetches base commit spec ($HEAD~1:openapi.yaml)                      |
|  • Fetches target commit spec ($HEAD:openapi.yaml)                      |
|  • Runs `oasdiff breaking` & `oasdiff changelog` (--format json)        |
|  • POST /api/v1/ingest (Payload + Authorization: Bearer $API_KEY)       |
+------------------------------------+------------------------------------+
                                     │
                                     ▼ HTTPS (Bearer Token Auth)
+-------------------------------------------------------------------------+
| SERVERLESS BACKEND (Next.js 14+ App Router on Vercel)                   |
|                                                                         |
|  1. /api/v1/ingest Endpoint:                                            |
|     - Hashes Bearer key (SHA-256) & matches `projects.api_key_hash`     |
|     - Validates Organization Plan Quota (Starter / Growth / Scale)      |
|                                                                         |
|  2. LLM Summarization Service (`src/lib/llm/summarizer.ts`):            |
|     - Provider: Groq LPU (`llama-3.3-70b-versatile` via GROQ_MODEL)     |
|     - Output: Strict JSON Schema (title, summary, breaking flag, items) |
|                                                                         |
|  3. Data Storage (`src/lib/db/index.ts`):                               |
|     - Writes changelog entry to Supabase PostgreSQL (or local store)    |
|     - Dispatches outbound Slack / Discord release notifications         |
+------------------------------------+------------------------------------+
                                     │
                                     ▼
+-------------------------------------------------------------------------+
| CLIENT-FACING TOUCHPOINTS                                               |
|                                                                         |
|  • Hosted Public Portal: https://{slug}.difflog.dev                     |
|  • Public RSS/Atom Feeds: https://{slug}.difflog.dev/rss.xml & /feed.xml|
|  • Admin Dashboard: /dashboard, /dashboard/simulator, /dashboard/billing|
+-------------------------------------------------------------------------+
```

---

## 4. Startup Commands (Local Development)

### Prerequisites
- **Node.js** `v18.18+` or `v20+` / `v22+`
- **npm** `v9+` or `v10+`
- A live **Groq API Key** (`GROQ_API_KEY` from [console.groq.com/keys](https://console.groq.com/keys)) for `/api/v1/ingest` LLM summarization

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy the `.env.example` template to `.env.local`:
```bash
# macOS / Linux
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

Open `.env.local` and set your live `GROQ_API_KEY`:
```env
# REQUIRED for POST /api/v1/ingest Groq LPU Structured Summarization
GROQ_API_KEY="gsk_your_live_groq_api_key"
GROQ_MODEL="llama-3.3-70b-versatile"

# OPTIONAL locally (Uses .data/specsync-db.json with pre-seeded demo data if left blank)
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# OPTIONAL locally (Simulates Stripe checkout locally if left blank)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Start the Development Server
```bash
npm run dev
```

Visit the local application endpoints:
- **Landing Page:** [http://localhost:3000](http://localhost:3000)
- **Public Changelog Portal (Acme Payments):** [http://localhost:3000/acme-payments](http://localhost:3000/acme-payments)
- **Public Changelog Portal (Nexus AI):** [http://localhost:3000/nexus-ai](http://localhost:3000/nexus-ai)
- **Public RSS 2.0 Feed:** [http://localhost:3000/acme-payments/rss.xml](http://localhost:3000/acme-payments/rss.xml)
- **Admin Dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Interactive CI Diff Simulator:** [http://localhost:3000/dashboard/simulator](http://localhost:3000/dashboard/simulator)
- **Stripe Billing Portal:** [http://localhost:3000/dashboard/billing](http://localhost:3000/dashboard/billing)

### Step 4: Test End-to-End Ingestion via CLI
With `npm run dev` running in one terminal and your `GROQ_API_KEY` configured in `.env.local`, run the dogfooding script in a second terminal:
```bash
npm run test:ingest
```
This dispatches `examples/sample-oasdiff-payload.json` to `POST http://localhost:3000/api/v1/ingest` using the pre-seeded demo Bearer key (`ss_live_acme_payments_demo_key_2026`).

### Step 5: Production Build & Start
```bash
npm run build
npm run start
```

---

## 5. Deployment Steps on Vercel

Because Vercel serverless functions have an ephemeral filesystem, deploying to production on Vercel should be paired with **Supabase PostgreSQL** so ingested releases persist permanently across edge invocations.

### Step 1: Provision Supabase PostgreSQL Database
1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard.
3. Paste and execute the full contents of [`supabase/migrations/0001_init_specsync.sql`](./supabase/migrations/0001_init_specsync.sql). This creates the `organizations`, `organization_members`, `projects`, and `changelog_entries` tables, indexes, and Row-Level Security (RLS) policies.
4. Copy your **Project URL**, **Anon Public Key**, and **Service Role Secret Key** from **Project Settings → API**.

### Step 2: Push Repository to GitHub
```bash
git add .
git commit -m "feat: initial DiffLog MVP platform"
git branch -M main
git remote add origin https://github.com/amanjain-aj/Difflog.git
git push -u origin main
```

### Step 3: Import Project into Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
2. Confirm the Framework Preset is detected as **Next.js**.
3. Under **Environment Variables**, configure the following variables for **Production**, **Preview**, and **Development**:

| Variable | Description |
| :--- | :--- |
| `GROQ_API_KEY` | **Required.** Your live Groq secret key (`gsk_...` from [console.groq.com](https://console.groq.com)) |
| `GROQ_MODEL` | Optional. Defaults to `llama-3.3-70b-versatile` |
| `NEXT_PUBLIC_SUPABASE_URL` | **Required on Vercel.** Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Required on Vercel.** Your Supabase Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Required on Vercel.** Your Supabase Service Role secret key |
| `NEXT_PUBLIC_APP_URL` | Your production Vercel domain (e.g., `https://difflog.vercel.app`) |
| `STRIPE_SECRET_KEY` | Optional. Stripe live/test secret key (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Optional. Stripe webhook signing secret (`whsec_...`) |
| `STRIPE_STARTER_PRICE_ID` | Optional. Stripe Price ID for the $29/mo Starter plan |
| `STRIPE_GROWTH_PRICE_ID` | Optional. Stripe Price ID for the $79/mo Growth plan |
| `STRIPE_SCALE_PRICE_ID` | Optional. Stripe Price ID for the $199/mo Scale plan |
| `SLACK_WEBHOOK_URL` | Optional. Incoming Slack webhook URL for release notifications |
| `DISCORD_WEBHOOK_URL` | Optional. Incoming Discord webhook URL for release notifications |

4. Click **Deploy**.

### Step 4: Configure Stripe Webhooks (Optional)
If using live Stripe Billing:
1. Open the [Stripe Developers Webhooks Dashboard](https://dashboard.stripe.com/webhooks).
2. Add an endpoint pointing to:
   ```text
   https://<your-vercel-domain>/api/billing/webhook
   ```
3. Listen to the `checkout.session.completed` event.
4. Copy the signing secret (`whsec_...`) into Vercel's `STRIPE_WEBHOOK_SECRET` environment variable and redeploy.

### Step 5: Connect a Customer Repository via GitHub Actions
1. Open your deployed DiffLog Admin Dashboard at `https://<your-vercel-domain>/dashboard`.
2. Create a project (or rotate an API key) and copy the generated API key.
3. In your API repository on GitHub, add `DIFFLOG_API_KEY` under **Settings → Secrets and variables → Actions**.
4. Create `.github/workflows/difflog.yml` in your API repository:
   ```yaml
   name: DiffLog API Changelog
   on:
     push:
       branches: [main]

   jobs:
     sync-openapi-changelog:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
           with:
             fetch-depth: 2

         - name: Run DiffLog OpenAPI Diff & Ingest
           uses: amanjain-aj/Difflog@main
           with:
             api_key: ${{ secrets.DIFFLOG_API_KEY }}
             spec_path: "openapi.yaml"
             version_tag: "v1.0.${{ github.run_number }}"
             api_url: "https://<your-vercel-domain>/api/v1/ingest"
   ```
