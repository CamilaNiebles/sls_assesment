# 📝 Notes Management API

This project is a serverless REST API designed to manage **user notes**, allowing authenticated users to create, read, update, and delete their own notes.

The API is implemented using **NestJS** and runs on AWS using **API Gateway, AWS Lambda, and DynamoDB**, with all infrastructure defined as code via the **Serverless Framework**.

The main goal of this project is to demonstrate clean architecture, proper separation of concerns, and best practices when building scalable serverless applications on AWS.

---

## 🏗️ Architecture Overview

This system follows a serverless, event-driven architecture designed to prioritize isolation of business logic, security boundaries, and operational simplicity.

API Gateway acts as the public entry point, handling request validation and authentication via a JWT Authorizer backed by Amazon Cognito. Authentication is intentionally enforced at the edge to ensure that unauthorized requests never reach the application layer.

Each REST endpoint is mapped to an independent AWS Lambda function responsible for a single use case (Create, Read, Update, Delete). This approach favors clear ownership, simpler failure isolation, and easier evolution over tightly coupled multi-action handlers.

DynamoDB is used as the persistence layer, accessed exclusively from within the Lambda functions. Direct service proxy integrations between API Gateway and DynamoDB are intentionally avoided to preserve domain logic encapsulation, improve testability, and prevent infrastructure concerns from leaking into the API contract.

<img src="./architecture-diagram.png" alt="Architecture diagram" width="600" />

### Design Decisions & Trade-offs

- **One Lambda per use case**  
  Chosen for clarity and isolation at the cost of a slightly higher number of deployed functions.

- **No direct API Gateway → DynamoDB integrations**  
  Improves testability and maintainability, at the expense of marginally higher latency due to Lambda execution.

- **JWT validation at the API Gateway layer**  
  Reduces unnecessary Lambda invocations and centralizes authentication logic, while limiting per-route customization.

### Security note

`npm audit` reports vulnerabilities originating from the Serverless Framework CLI
dependencies (aws-sdk v2, tar, jsonpath-plus).

These packages are used **only at development / deployment time** and are **not
bundled nor deployed** with the Lambda runtime.

Upgrading to Serverless v4 would introduce breaking changes and is intentionally
avoided in this project.

## 🧪 How to Test

This project can be tested locally using Serverless Offline and DynamoDB Local [here](./Instructions.MD) you can fine instructions to test.

## 🔁 CI/CD Pipeline

This project includes a Continuous Integration pipeline designed to ensure code quality, reliability, and consistency across all contributions, while keeping the local developer experience fast and frictionless.

The CI pipeline is executed via **GitHub Actions** and is automatically triggered on every pull request and push to protected branches.

### 🧪 Testing & Coverage Strategy

- **Unit tests are executed in CI**, not during local pre-commit hooks.
- **Code coverage is intentionally _not_ enforced locally** (before commit), even though Husky is used for lightweight checks.

This decision avoids:
- Slowing down the local development workflow
- Penalizing developers with long-running test suites during frequent commits

Instead, **coverage enforcement happens exclusively in CI**, where it belongs.

### 📊 Coverage Requirements

- All protected branches must meet a **minimum test coverage of 80%**
- The pipeline fails automatically if coverage thresholds are not satisfied
- This guarantees a consistent quality bar without compromising developer productivity

### 🔒 Pre-commit Hooks (Husky)

Husky is configured to run only **fast, non-blocking checks** (such as linting or formatting) before commits.
Expensive operations like full test execution and coverage analysis are deferred to CI.

This ensures:
- Fast local feedback loops
- Strong quality gates at integration time

### 🛠️ CI/CD Flow Overview

<img src="./ci_cd" alt="CI/CD Pipeline" width="700"/>

> The pipeline validates code quality, executes tests, enforces coverage thresholds, and guarantees that only compliant code is merged into protected branches.


