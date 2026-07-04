@description('Azure region for App Service resources.')
param location string

@description('Stable lowercase suffix used for globally unique resource names.')
param resourceSuffix string

@description('Subnet id used for App Service VNet integration.')
param appSubnetId string

@description('Application Insights connection string.')
param applicationInsightsConnectionString string

@description('Storage account name for product images.')
param storageAccountName string

@description('Blob container name for product images.')
param blobContainerName string

@description('PostgreSQL server host.')
param postgresHost string

@description('PostgreSQL database name.')
param postgresDatabaseName string

@description('PostgreSQL administrator login name.')
param postgresAdminLogin string

@description('Common resource tags.')
param tags object

var planName = 'plan-afcr-ecom-dev-wus2'
var webAppName = 'app-afcr-ecom-dev-${resourceSuffix}'
var keyVaultName = 'kv-afcr-ecom-dev-${resourceSuffix}'

resource plan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: planName
  location: location
  tags: tags
  sku: {
    name: 'B1'
    tier: 'Basic'
    size: 'B1'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource webApp 'Microsoft.Web/sites@2024-04-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    virtualNetworkSubnetId: appSubnetId
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      alwaysOn: true
      ftpsState: 'Disabled'
      minimumElasticInstanceCount: 1
      appCommandLine: 'node server.js'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~22'
        }
        {
          name: 'PORT'
          value: '8080'
        }
        {
          name: 'WEBSITES_PORT'
          value: '8080'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'NEXTAUTH_URL'
          value: 'https://${webAppName}.azurewebsites.net'
        }
        {
          name: 'AUTH_URL'
          value: 'https://${webAppName}.azurewebsites.net'
        }
        {
          name: 'NEXTAUTH_SECRET'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=NEXTAUTH-SECRET)'
        }
        {
          name: 'AUTH_SECRET'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=NEXTAUTH-SECRET)'
        }
        {
          name: 'DATABASE_URL'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=DATABASE-URL)'
        }
        {
          name: 'ENTRA_EXTERNAL_ID_CLIENT_ID'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=ENTRA-EXTERNAL-ID-CLIENT-ID)'
        }
        {
          name: 'ENTRA_EXTERNAL_ID_CLIENT_SECRET'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=ENTRA-EXTERNAL-ID-CLIENT-SECRET)'
        }
        {
          name: 'ENTRA_EXTERNAL_ID_ISSUER'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=ENTRA-EXTERNAL-ID-ISSUER)'
        }
        {
          name: 'AZURE_STORAGE_ACCOUNT_NAME'
          value: storageAccountName
        }
        {
          name: 'AZURE_STORAGE_CONNECTION_STRING'
          value: '@Microsoft.KeyVault(VaultName=${keyVaultName};SecretName=AZURE-STORAGE-CONNECTION-STRING)'
        }
        {
          name: 'AZURE_STORAGE_CONTAINER_NAME'
          value: blobContainerName
        }
        {
          name: 'POSTGRES_HOST'
          value: postgresHost
        }
        {
          name: 'POSTGRES_DATABASE'
          value: postgresDatabaseName
        }
        {
          name: 'POSTGRES_USER'
          value: postgresAdminLogin
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: applicationInsightsConnectionString
        }
      ]
    }
  }
}

output webAppName string = webApp.name
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output webAppPrincipalId string = webApp.identity.principalId
