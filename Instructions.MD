## 🧪 How to Test

This project can be tested locally using Serverless Offline and DynamoDB Local.

### Prerequisites

- Node.js (v18+ recommended)
- Docker

### 1. Start DynamoDB Local

DynamoDB is provided locally using the official Amazon Docker image.

```bash
docker compose up -d
```

### 2. Create the local DynamoDB table

Since CloudFormation does not manage local resources, a bootstrap script is provided to create the required tables in DynamoDB Local.

```bash
npm run db:local:setup
```

### 3. Start the API and verify the health endpoint

Run the application locally using Serverless Offline:

```bash
npx serverless offline
```

The API will be available at 
```bash
http://localhost:3005/health
```
A successful response should include the database status:

```bash
{
    "status": "ok",
    "service": "notes-api",
    "timestamp": "2026-02-02T15:45:28.528Z",
    "dependencies": {
        "database": "ok"
    }
}
```

# How to Test the API (Authentication & Authorization)

This API is protected using an AWS API Gateway **Custom Authorizer** backed by **Amazon Cognito**.  
To successfully call the protected endpoints, you must first generate a valid **Cognito access token**.

---
## 🔐 Serverless Authentication (Required)

This project uses **Serverless Framework v4**, which requires explicit authentication both for AWS and for the Serverless Platform before running the application locally or deploying it.

Due to this requirement, you must configure credentials **before** executing any Serverless command.

### 1 Configure AWS Credentials

Serverless needs valid AWS credentials to provision and access cloud resources.

Run the following command using your own AWS Access Key and Secret:

```bash
npx serverless config credentials \
  --provider aws \
  --key <AWS_ACCESS_KEY_ID> \
  --secret <AWS_SECRET_ACCESS_KEY>
```

### 2 Authenticate with Serverless Platform (v4 requirement)

```bash
npx serverless config credentials \
  --provider serverless \
  --key <SLS_LICENSE_KEY>
```

## 2. Generate a Cognito Token

Use the following AWS CLI command to authenticate against Cognito and retrieve a token:

```bash
aws cognito-idp admin-initiate-auth \
  --region us-east-1 \
  --user-pool-id <user-pool-id> \
  --client-id <client-id> \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters USERNAME=<USERNAME>,PASSWORD=<PASSWORD>
```