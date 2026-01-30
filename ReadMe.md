# 📝 Notes Management API

This project is a serverless REST API designed to manage **user notes**, allowing authenticated users to create, read, update, and delete their own notes.

The API is implemented using **NestJS** and runs on AWS using **API Gateway, AWS Lambda, and DynamoDB**, with all infrastructure defined as code via the **Serverless Framework**.

The main goal of this project is to demonstrate clean architecture, proper separation of concerns, and best practices when building scalable serverless applications on AWS.

---

## 🏗️ Architecture Overview

The following diagram illustrates the high-level architecture of the system.

API Gateway exposes REST endpoints and handles authentication using a **built-in JWT Authorizer**, ensuring that only valid requests reach the backend. Each HTTP method is routed to a dedicated Lambda function responsible for the corresponding CRUD operation. The Lambda functions encapsulate the business logic and interact with DynamoDB as the persistence layer.

This design avoids direct service proxy integrations between API Gateway and DynamoDB, keeping the application logic isolated, testable, and easier to maintain.

![architecture diagram](architecture_diagram.png)

### Security note

`npm audit` reports vulnerabilities originating from the Serverless Framework CLI
dependencies (aws-sdk v2, tar, jsonpath-plus).

These packages are used **only at development / deployment time** and are **not
bundled nor deployed** with the Lambda runtime.

Upgrading to Serverless v4 would introduce breaking changes and is intentionally
avoided in this project.

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
http://localhost:3000
```
A successful response should include the database status:

