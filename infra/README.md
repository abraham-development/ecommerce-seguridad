# Azure Infrastructure Guardrails

This folder is the only place where Azure infrastructure for the development environment should be defined.

The target Azure architecture for this ecommerce application is documented in:

```text
infra/azure-architecture.md
```

The MVP implementation also includes:

```text
infra/postgres-schema.sql       # Azure PostgreSQL schema to apply after DB creation
.github/workflows/azure-dev.yml # GitHub Actions OIDC pipeline for dev
```

## Fixed Scope

All Codex-managed Azure operations are limited to:

```text
Subscription: 3274731e-9035-49fa-9d05-11c978277669
Resource Group: ecommerce
Location: westus2
Service Principal: sp-codex-ecommerce-dev
```

Codex must not deploy at subscription scope and must not operate on any Resource Group other than `ecommerce`.

## Local Credentials

The service principal credentials are stored outside the repository:

```text
~/.azure-codex-ecommerce/service-principal.json
~/.azure-codex-ecommerce/env
```

Never commit those files or copy their secrets into tracked files.

## Codex Azure CLI Session

Use a separate Azure CLI config directory so Codex does not reuse the personal Owner login:

```bash
source "$HOME/.azure-codex-ecommerce/env"
export AZURE_CONFIG_DIR="$HOME/.azure-codex-ecommerce/cli"

az login --service-principal \
  --username "$AZURE_CLIENT_ID" \
  --password "$AZURE_CLIENT_SECRET" \
  --tenant "$AZURE_TENANT_ID" \
  --allow-no-subscriptions

az account set --subscription "$AZURE_SUBSCRIPTION_ID"
```

## Safe Commands

Preview changes before any deployment:

```bash
az deployment group what-if \
  --subscription "$AZURE_SUBSCRIPTION_ID" \
  --resource-group ecommerce \
  --template-file infra/main.bicep \
  --parameters infra/dev.bicepparam
```

Deploy only after reviewing `what-if`:

```bash
az deployment group create \
  --subscription "$AZURE_SUBSCRIPTION_ID" \
  --resource-group ecommerce \
  --template-file infra/main.bicep \
  --parameters infra/dev.bicepparam
```

After a successful deployment, the non-sensitive Bicep output `webAppUrl`
contains the public App Service URL:

```text
https://<webAppName>.azurewebsites.net
```

This URL is enough for the MVP and can be shared without buying a custom domain.

## Required Provider Registration

Before the first full deployment, an Owner must register these providers at
subscription scope:

```text
Microsoft.DBforPostgreSQL
Microsoft.KeyVault
Microsoft.OperationalInsights
Microsoft.Insights
```

Codex must not register providers because its identity is intentionally limited
to `Contributor` on the `ecommerce` Resource Group.

## Database Bootstrap

After PostgreSQL Flexible Server is deployed and reachable, apply:

```bash
psql "$DATABASE_URL" -f infra/postgres-schema.sql
```

Use the `DATABASE_URL` stored in Key Vault. Do not commit database passwords or
connection strings.

Validate the service principal RBAC scope:

```bash
az role assignment list \
  --assignee "$AZURE_CLIENT_ID" \
  --all \
  --query '[].{role:roleDefinitionName,scope:scope}' \
  -o table
```

The only expected role assignment is `Contributor` on:

```text
/subscriptions/3274731e-9035-49fa-9d05-11c978277669/resourceGroups/ecommerce
```

## Explicitly Out Of Scope

- `Owner`, `User Access Administrator`, or RBAC administration for Codex.
- Subscription-scope deployments.
- Production resources.
- Any Resource Group other than `ecommerce`.
