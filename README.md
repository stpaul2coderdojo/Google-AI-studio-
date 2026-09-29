# Wilderness Dojo Antigravity Billing AI

[![Node.js Version](https://img.shields.io/badge/node-22.x-brightgreen.svg)](https://nodejs.org/)
[![React 19](https://img.shields.io/badge/react-19.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/tailwindcss-4.1-38bdf8.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/docker-ready-2496ed.svg)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/render-blueprint-46E3B7.svg)](https://render.com/)
[![Zero-Trust IAM](https://img.shields.io/badge/IAM-NIST%20SP%20800--207-success.svg)](https://csrc.nist.gov/publications/detail/sp/800-207/final)
[![Razorpay & UPI](https://img.shields.io/badge/Razorpay-UPI%202.0%20Gateway-blueviolet.svg)](https://razorpay.com/)
[![WordPress Bridge](https://img.shields.io/badge/WordPress-wildernessdojo.home.blog-blue.svg)](https://wildernessdojo.home.blog)

> **Autonomous Medical AI Billing, Invoicing, and WordPress Post-by-Email Ecosystem Gateway**  
> Developed for the **XPRIZE Devpost Hackathon**.  
> **Director & Lead Architect**: **Dr. Bheemaiah Anil K**, Director, Wilderness Dojo (`bheemaiah@alumni.iitm.ac.in`).  
> Combines Zero-Trust IAM continuous verification, Gemini clinical NLP extraction, real-time EDI 837P clearinghouse adjudication, instant HSA/FSA copay settlement, **commercial Purchase Invoicing with Razorpay & UPI 2.0 gateway**, and a bi-directional bridge to [`wildernessdojo.home.blog`](https://wildernessdojo.home.blog) via Post-by-Email (`duru909mede@post.wordpress.com`).

---

## Table of Contents

- [Authorship & Project Leadership](#authorship--project-leadership)
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [WordPress Ecosystem Bridge](#wordpress-ecosystem-bridge)
- [Quick Start (Local Development)](#quick-start-local-development)
- [Docker Deployment](#docker-deployment)
- [Render Deployment (render.yaml)](#render-deployment-renderyaml)
- [GitHub Setup & Push Guide](#github-setup--push-guide)
- [REST API Reference](#rest-api-reference)
- [Security & Compliance](#security--compliance)
- [License](#license)

---

## Overview

**Wilderness Dojo Antigravity Billing AI** addresses critical friction in somatic, outdoor, and integrative medicine billing. Unlike conventional medical billing pipelines plagued by manual denial re-work and delayed settlement, this platform automates the complete lifecycle:

1. **Autonomous Clinical Extraction**: Gemini AI parses natural language clinical encounter notes into validated ICD-10-CM diagnostic codes and CPT/HCPCS procedure codes.
2. **EDI 837P ANSI X12 Adjudication**: Compiles and validates health insurance claims with instant pre-clearinghouse checks and denial-prevention scrubbers.
3. **Instant HSA/FSA Copay Settlement**: Simulates real-time card settlement, co-pay calculation, and zero-liability receipts.
4. **Zero-Trust IAM (NIST SP 800-207)**: Enforces role-based access control (Super Admin, Clinician, Billing Officer, Patient, Auditor) with continuous token authentication and audit logging.
5. **WordPress Post-by-Email Publishing Engine**: Automatically generates and dispatches publish-ready clinical case studies and wilderness conditioning articles directly to `https://wildernessdojo.home.blog` via its Post-by-Email gateway at `duru909mede@post.wordpress.com`.

---

## Key Features

- **NIST SP 800-207 Zero-Trust IAM**: Fine-grained RBAC with cryptographic session tokens and immutable audit trail.
- **Server-Side Gemini AI**: Powers clinical note coding, denial appeals, and automated blog generation.
- **EDI 837P Transaction Generator**: Generates industry-standard ANSI X12 837 Professional transaction sets ready for payer ingestion.
- **Purchase Invoicing & Razorpay Smart Gateway**: Direct sanctuary sales, somatic retreat passes, and equipment procurement with instant **Razorpay UPI 2.0 dynamic QR codes, deep links (GPay, PhonePe, Paytm, BHIM, Cred), and collect push intents**.
- **Automated WordPress Shortcode Envelope**: Encapsulates posts with `[category]`, `[tags]`, `[status]`, and `[slug]` shortcodes for WordPress Post-by-Email ingestion.
- **HMAC-SHA256 Webhook Telemetry**: Secure webhook listener for external payment triggers and status synchronizations.
- **Multi-Stage Production Docker Build**: Ultra-lightweight Alpine container with non-root security.
- **Infrastructure as Code (IaC)**: Turnkey deployment via `render.yaml` Blueprint and `docker-compose.yml`.

---

## Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   (Vite + Tailwind CSS v4 + Lucide Icons + Motion)     │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON
┌───────────────────────────▼────────────────────────────┐
│                  Express Node.js Server                │
│                 (server.ts / dist/server.cjs)          │
│                                                        │
│  ├─ Zero-Trust IAM Engine (Token Auth & Audit Log)     │
│  ├─ EDI 837P ANSI X12 Billing & Adjudication Engine    │
│  ├─ Gemini AI Client (@google/genai SDK)               │
│  └─ WordPress Post-by-Email Bridge & Shortcode Parser  │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     Google Gemini API     │ │    WordPress.com Blog     │
│   Clinical NLP & Coding   │ │ wildernessdojo.home.blog  │
│  Model: gemini-2.5-flash  │ │ duru909mede@post.wp.com   │
└───────────────────────────┘ └───────────────────────────┘
```

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4 | High-performance reactive UI with responsive tables, monitors, and drawers |
| **Backend** | Express 4, TypeScript | Modular REST API with Zero-Trust IAM middlewares and static Vite serving |
| **AI Engine** | `@google/genai` (Gemini 2.5 Flash) | Contextual ICD-10 / CPT code reasoning and clinical case study synthesis |
| **Build Tooling** | Vite 6 + esbuild | Fast HMR dev server and single-artifact production bundle |
| **Container** | Docker (Alpine Linux) | Multi-stage, non-root hardened container image |
| **Cloud Hosting** | Render / Cloud Run | Automated continuous deployment with health checks |

---

## WordPress Ecosystem Bridge

The application is synchronized with the **Wilderness Dojo** public site and its Post-by-Email ingestion address:

- **Target WordPress Site**: [`https://wildernessdojo.home.blog`](https://wildernessdojo.home.blog)
- **Post-by-Email Secret Address**: `duru909mede@post.wordpress.com`

### Publishing Workflow
1. The user creates or generates an article from the **WordPress Bridge Panel** or via `POST /api/wordpress/post-blog`.
2. The engine generates a formatted WordPress shortcode envelope:
   ```text
   [title Clinical Case Study: Autonomic Recovery in High Sierra]
   [category Therapeutic Conditioning]
   [tags Somatic Therapy, Neuromuscular, High Sierra, CPT-97110]
   [status publish]
   [slug clinical-case-study-autonomic-recovery]

   <!-- Clinical Body Content -->
   <p>Patient completed a 3-hour wilderness somatic conditioning session...</p>
   ```
3. Posts are recorded in the synchronized catalog with direct permalinks, verification receipts, and raw shortcode copy/mailto actions.

---

## Quick Start (Local Development)

### Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- **npm**: `v10.x` or higher
- **Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/wilderness-dojo-billing-ai.git
cd wilderness-dojo-billing-ai
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your credentials:
```ini
# Gemini API Key for clinical coding and AI synthesis
GEMINI_API_KEY="your-gemini-api-key"

# Port (defaults to 3000 locally, dynamically provided on Render/Cloud Run)
PORT=3000

# Target WordPress blog configuration
WORDPRESS_SITE_URL="https://wildernessdojo.home.blog"
WORDPRESS_POST_EMAIL="duru909mede@post.wordpress.com"

# Application public URL
APP_URL="http://localhost:3000"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The Express server boots and mounts the Vite middleware automatically.

### 5. Production Build & Execution
```bash
# Build Vite frontend assets and bundle server.ts
npm run build

# Start production server
npm start
```

---

## Docker Deployment

This repository includes a hardened, multi-stage `Dockerfile` and a `docker-compose.yml` configuration.

### Using Docker
```bash
# 1. Build the container image
docker build -t wilderness-dojo-billing-ai .

# 2. Run the container
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY="your-api-key" \
  -e WORDPRESS_SITE_URL="https://wildernessdojo.home.blog" \
  -e WORDPRESS_POST_EMAIL="duru909mede@post.wordpress.com" \
  --name wilderness-billing \
  wilderness-dojo-billing-ai

# 3. Check health status
curl http://localhost:3000/api/health
```

### Using Docker Compose
```bash
# Start container in detached mode
docker compose up -d --build

# View container logs
docker compose logs -f

# Stop container
docker compose down
```

---

## Render Deployment (render.yaml)

The project includes a ready-to-use [`render.yaml`](./render.yaml) Blueprint for zero-friction deployment on [Render](https://render.com).

### Deploying via Render Blueprint
1. Fork or push this repository to your GitHub account.
2. Sign in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and configure:
   - **Service Name**: `wilderness-dojo-billing-ai`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
6. Under **Environment Variables**, provide your `GEMINI_API_KEY`.
7. Click **Apply**. Your app will build and deploy with a free HTTPS URL.

---

## GitHub Setup & Push Guide

To push this codebase to a new GitHub repository:

### 1. Initialize Git and Stage Files
```bash
git init
git add .
git commit -m "Initial commit: Wilderness Dojo Antigravity Billing AI with Docker, Render, and WordPress bridge"
```

### 2. Link your GitHub Repository
Create an empty repository on [GitHub](https://github.com/new), then run:
```bash
# Set default branch name to main
git branch -M main

# Add your GitHub remote (replace with your repo URL)
git remote add origin https://github.com/<your-username>/wilderness-dojo-billing-ai.git

# Push code to GitHub
git push -u origin main
```

---

## REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status and WordPress bridge connectivity | No |
| `GET` | `/api/purchase-invoices` | List commercial purchase invoices and retreat billing | No |
| `POST` | `/api/purchase-invoices` | Create new purchase invoice with itemized line items | Bearer Token |
| `POST` | `/api/razorpay/create-order` | Generate Razorpay order with dynamic UPI QR code & deep links | No |
| `POST` | `/api/razorpay/verify-payment` | Verify HMAC-SHA256 signature and settle UPI/card payment | No |
| `POST` | `/api/razorpay/upi-intent` | Dispatch instant collect request to customer UPI VPA | No |
| `POST` | `/api/razorpay/webhook` | Ingest Razorpay payment capture and refund events | No |
| `GET` | `/api/wordpress/posts` | Retrieve published and queued WordPress articles | No |
| `POST` | `/api/wordpress/post-blog` | Post a blog to WordPress via Post-by-Email gateway | Bearer Token |
| `POST` | `/api/wordpress/generate-blog` | AI generation of wilderness clinical articles | Bearer Token |
| `POST` | `/api/billing/adjudicate-837p` | Run EDI 837P claim adjudication | Bearer Token |
| `POST` | `/api/billing/settle-copay` | Process instant HSA/FSA card copay | Bearer Token |
| `POST` | `/api/clinical/analyze-encounter` | AI clinical extraction into ICD-10 and CPT | Bearer Token |
| `POST` | `/api/iam/login` | Authenticate user and issue JWT session token | No |

### Example: Publish Post via Post-by-Email Gateway
```bash
curl -X POST http://localhost:3000/api/wordpress/post-blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <IAM_TOKEN>" \
  -d '{
    "title": "Shinrin-Yoku & Biomarker Recovery Protocol",
    "category": "Integrative Medicine",
    "tags": ["Forest Bathing", "HRV", "Stress Reset"],
    "content": "Clinical protocols for lowering salivary cortisol via outdoor guided movement.",
    "featuredCost": 280.00
  }'
```

---

## Authorship & Project Leadership

- **Project Lead & Director**: **Dr. Bheemaiah Anil K**
  - **Role**: Director, Wilderness Dojo
  - **Contact**: `bheemaiah@alumni.iitm.ac.in`
  - **Institution / Sanctuary**: Wilderness Dojo ([wildernessdojo.home.blog](https://wildernessdojo.home.blog))
  - **Post-by-Email Integration Gateway**: `duru909mede@post.wordpress.com`
  - **Competition**: XPRIZE Devpost Hackathon
  - **System Vision**: Autonomous zero-trust clinical revenue cycle management uniting frontier AI intelligence (Gemini 2.5), EDI 837P clearinghouse automation, and decentralized somatic wellness practices.

---

## Security & Compliance

- **NIST SP 800-207**: Zero-Trust IAM micro-segmentation with continuous verification.
- **HIPAA Safe Harbor**: All synthesized clinical case studies are de-identified; patient identifiers are stripped before transmission.
- **HMAC-SHA256 Webhook Verification**: Prevents replay attacks and verifies payload integrity for billing callbacks.
- **Non-Root Docker Execution**: Container runs under the unprivileged `node` user to prevent privilege escalation.

---

## License

MIT License. Developed for the XPRIZE Devpost Hackathon.
