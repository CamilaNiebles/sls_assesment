# How to Test the API (Authentication & Authorization)

This API is protected using an AWS API Gateway **Custom Authorizer** backed by **Amazon Cognito**.  
To successfully call the protected endpoints, you must first generate a valid **Cognito access token**.

---

## 1. Generate a Cognito Token

Use the following AWS CLI command to authenticate against Cognito and retrieve a token:

```bash
aws cognito-idp admin-initiate-auth \
  --region us-east-1 \
  --user-pool-id <user-pool-id> \
  --client-id <client-id> \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters USERNAME=<USERNAME>,PASSWORD=<PASSWORD>
```