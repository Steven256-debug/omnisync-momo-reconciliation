# OmniSync MoMo

**OmniSync MoMo** is a serverless, event-driven multi-network mobile money reconciliation engine built for the Ghanaian MSME market. It automates the reconciliation of mobile money payments across MTN, Telecel, and AT networks to eliminate manual errors, revenue leakage, and operational delays.

## Architecture

This solution leverages **AWS SAM** for the backend and a **React Single Page Application (SPA)** for the frontend dashboard.

### Backend (AWS Serverless)
- **API Gateway**: Provides a public `POST /webhooks/v1/momo` endpoint for telcos to push transaction data. Also hosts a `GET /api/transactions` endpoint for the dashboard.
- **Amazon SQS FIFO**: Ensures exact-once processing and strict ordering (content-based deduplication). Includes a Dead-Letter Queue (DLQ) for failed messages.
- **AWS Lambda**:
  - `IngestionLambda`: Validates webhooks and enqueues messages.
  - `WorkerLambda`: Processes messages, performs idempotent writes to DynamoDB, and archives raw data to S3.
  - `FetchLambda`: Retrieves transaction histories for the React dashboard.
- **Amazon DynamoDB**: Real-time ledger using a `PAY_PER_REQUEST` billing model.
- **Amazon S3**: Secure data lake for raw JSON webhook archiving.
- **AWS Secrets Manager**: Securely stores webhook signing keys.

### Frontend (React & Vite)
- Real-time transaction feed polling the backend API.
- Summary cards showing daily gross volume across networks.
- Visual breakdown of network distribution using Recharts (Pie Chart).
- Premium glassmorphism UI styled with raw CSS.

## Setup Instructions

### Prerequisites
1. **AWS CLI** & **AWS SAM CLI** installed and configured.
2. **Node.js** & **npm** installed.
3. Appropriate AWS Sandbox/Production Credentials.

### 1. Deploying the Backend
1. Navigate to the `backend` directory.
2. Run SAM build to prepare the deployment artifacts:
   ```bash
   cd backend
   sam build
   ```
3. Deploy the application:
   ```bash
   sam deploy --guided
   ```
4. Note the `HttpApiUrl` generated in the CloudFormation outputs.

### 2. Running the Frontend Locally
1. Navigate to the `frontend` directory.
2. Install dependencies (requires internet access to npm registry):
   ```bash
   cd frontend
   npm install
   ```
3. Create a `.env` file in the `frontend` directory and add the API URL from step 1:
   ```env
   VITE_API_URL=https://<your-api-id>.execute-api.<region>.amazonaws.com/v1
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Testing Webhooks
To simulate a webhook payload arriving from MTN:
```bash
curl -X POST https://<your-api-id>.execute-api.<region>.amazonaws.com/v1/webhooks/v1/momo \
     -H "Content-Type: application/json" \
     -H "x-signature: mock-signature" \
     -d '{
           "network": "MTN",
           "transaction_ref": "REF123456",
           "merchant_id": "M_888",
           "amount": 150.50
         }'
```
Wait a moment, and the transaction should appear on your React dashboard and in DynamoDB!

## Problem Statement Solved
MSMEs in Ghana often manually reconcile payments from multiple telco portals, leading to massive operational overhead. OmniSync MoMo centralizes this into one scalable, event-driven ledger, allowing merchants to focus on their business while the AWS cloud handles the heavy lifting.
