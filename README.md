# 🔄 OmniSync MoMo Reconciliation Engine

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Amplify-orange?style=for-the-badge&logo=amazon-aws)](https://main.djmgbhm1efqjx.amplifyapp.com/)
[![AWS](https://img.shields.io/badge/AWS-Serverless-yellow?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com/)
[![React](https://img.shields.io/badge/React-Dashboard-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10-blue?style=for-the-badge&logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> A production-ready, fully serverless multi-network mobile money reconciliation engine built for the Ghanaian MSME market. It automates the ingestion and reconciliation of mobile money payments across MTN, Telecel, and AT networks to eliminate manual errors, revenue leakage, and operational delays.

🔗 **Live Demo:** [https://main.djmgbhm1efqjx.amplifyapp.com/](https://main.djmgbhm1efqjx.amplifyapp.com/)

---

## 📌 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [AWS Services Used](#aws-services-used)
- [Features](#features)
- [How It Works](#how-it-works)
- [Setup & Deployment](#setup--deployment)
- [Security](#security)
- [Data Analytics](#data-analytics)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## Overview

OmniSync MoMo solves a massive operational headache for Ghanaian businesses — manually reconciling payments from multiple mobile money networks across different portals and spreadsheets.

This tool lets you:
- Receive and process payment webhooks from MTN, Telecel, and AT instantly.
- Securely archive all raw transaction data for compliance.
- View a unified, real-time financial ledger across all networks.
- Analyze transaction volume trends in a premium glassmorphic dashboard.
- Export transaction data to CSV for internal auditing.

### The Real Problem it Solves:
```text
Without this tool:
Customer pays via MTN → Download spreadsheet → Customer pays via AT → Download spreadsheet → Manually reconcile at midnight ❌

With this tool:
Customer pays via MTN → Dashboard instantly updates ✅
Customer pays via AT  → Dashboard instantly updates ✅
End of day            → "All funds mathematically reconciled!" ✅
```

---

## Architecture

![Architecture Diagram](./architecture.png)

---

## AWS Services Used

| Service | Purpose |
|---------|---------|
| **AWS Amplify** | Hosting the React Single Page Application (SPA) |
| **Amazon API Gateway** | REST API for Telco webhooks and Frontend fetching |
| **Amazon Cognito** | Secure JWT authentication for the React Dashboard |
| **AWS Lambda** (x3) | Serverless business logic (Ingestion, Worker, Fetch) |
| **Amazon SQS** | FIFO queue for strict ordering and buffering |
| **Amazon DynamoDB** | Real-time NoSQL financial ledger |
| **Amazon S3** | Data lake for raw JSON webhook archiving |
| **Amazon Athena & Glue** | Analytics layer for running SQL on raw S3 data |
| **AWS SAM** | Infrastructure as Code orchestration |

---

## Features

- ✅ **Fully Serverless** — scales automatically and costs zero when idle.
- ✅ **Decoupled Architecture** — SQS buffers traffic so databases never crash.
- ✅ **Idempotent Processing** — strict deduplication prevents double-counting money.
- ✅ **HMAC Cryptography** — mathematically verifies Telco signatures to block hackers.
- ✅ **Enterprise Auth** — Cognito secures the dashboard with JWTs.
- ✅ **Real-Time Data Lake** — S3 and Athena allow business intelligence teams to run SQL.
- ✅ **Glassmorphism UI** — premium, responsive React dashboard using Recharts.
- ✅ **Network Filtering & Charts** — interactive daily volume bar charts and network filters.
- ✅ **CSV Export** — instantly download ledger data into spreadsheets.
- ✅ **Automated CI/CD** — GitHub Actions automatically deploys changes to AWS.

---

## How It Works

### Step 1: Webhook Ingestion
```text
Telco sends POST request to API Gateway → Ingestion Lambda validates HMAC signature → Enqueues payload to SQS.
```

### Step 2: Processing & Archiving
```text
Worker Lambda pulls from SQS → Writes raw JSON to S3 Data Lake → Updates DynamoDB Ledger idempotently.
```

### Step 3: Real-Time Display
```text
Authorized Merchant opens React Dashboard → Fetch Lambda queries DynamoDB → Dashboard renders charts.
```

---

## Setup & Deployment

### 1. CI/CD Deployment (Recommended)
1. Fork/Clone this repository to GitHub.
2. Add your `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to your GitHub Repository Secrets.
3. The included GitHub Actions pipeline will automatically deploy the AWS SAM backend!

### 2. Manual Local Setup
**Backend:**
```bash
cd backend
sam build
sam deploy --guided
```
*(Take note of your `HttpApiUrl`, `UserPoolId`, and `UserPoolClientId` in the terminal outputs)*

**Frontend:**
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=<your-HttpApiUrl>
VITE_USER_POOL_ID=<your-UserPoolId>
VITE_USER_POOL_CLIENT_ID=<your-UserPoolClientId>
```
Start the dashboard:
```bash
npm run dev
```

---

## Security

In a financial reconciliation engine, security is paramount. OmniSync implements a strict defense-in-depth approach:

- **HMAC Cryptographic Validation:** When a Mobile Money provider sends a webhook, they mathematically sign the JSON payload. Our Ingestion Lambda computes the SHA-256 HMAC hash of the incoming request and compares it to the provider's signature. If they don't match, the request is instantly rejected (`401 Unauthorized`).
- **Amazon Cognito:** The React frontend displays highly sensitive financial ledgers. We use Amazon Cognito to ensure enterprise-grade authentication. Cognito handles secure JWT token generation, strict password policies, and session management.

---

## Data Analytics

An **AWS Glue Database** crawls the raw JSON files in the S3 archive. This allows business intelligence teams to run standard SQL queries directly on the unstructured data using **Amazon Athena**.

Example Query:
```sql
SELECT network, sum(amount) as total_volume 
FROM raw_webhooks 
GROUP BY network;
```

---

## Future Improvements

- [ ] Implement AWS WAF (Web Application Firewall) on the API Gateway.
- [ ] Implement a Dead-Letter Queue (DLQ) automated retry mechanism for failed webhooks.
- [ ] Support custom date range filtering on the dashboard.

---

## Author

**Steven Asante-Poku Jnr**  
*Cloud Developer*
