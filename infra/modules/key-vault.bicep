@description('Azure region for Key Vault resources.')
param location string

@description('Stable lowercase suffix used for globally unique resource names.')
param resourceSuffix string

@description('System-assigned managed identity principal id for the Web App.')
param webAppPrincipalId string

@description('Storage account name for product image uploads.')
param storageAccountName string

@description('Storage account resource id for product image uploads.')
param storageAccountId string

@secure()
@description('Database connection string.')
param databaseUrl string

@secure()
@description('PostgreSQL administrator password.')
param postgresAdminPassword string

@description('OIDC client id for Entra External ID.')
param entraExternalIdClientId string

@secure()
@description('OIDC client secret for Entra External ID.')
param entraExternalIdClientSecret string

@description('OIDC issuer URL for Entra External ID.')
param entraExternalIdIssuer string

@secure()
@description('Auth.js/NextAuth secret.')
param nextAuthSecret string

@description('Common resource tags.')
param tags object

var keyVaultName = 'kv-afcr-ecom-dev-${resourceSuffix}'
var storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${listKeys(storageAccountId, '2023-05-01').keys[0].value};EndpointSuffix=${environment().suffixes.storage}'

resource keyVault 'Microsoft.KeyVault/vaults@2024-11-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enableRbacAuthorization: false
    enabledForTemplateDeployment: false
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    publicNetworkAccess: 'Enabled'
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: webAppPrincipalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
    ]
  }
}

resource databaseUrlSecret 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'DATABASE-URL'
  properties: {
    value: databaseUrl
  }
}

resource postgresPasswordSecret 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'POSTGRES-ADMIN-PASSWORD'
  properties: {
    value: postgresAdminPassword
  }
}

resource entraClientIdSecret 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'ENTRA-EXTERNAL-ID-CLIENT-ID'
  properties: {
    value: entraExternalIdClientId
  }
}

resource entraClientSecretSecret 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'ENTRA-EXTERNAL-ID-CLIENT-SECRET'
  properties: {
    value: entraExternalIdClientSecret
  }
}

resource entraIssuerSecret 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'ENTRA-EXTERNAL-ID-ISSUER'
  properties: {
    value: entraExternalIdIssuer
  }
}

resource nextAuthSecretResource 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'NEXTAUTH-SECRET'
  properties: {
    value: nextAuthSecret
  }
}

resource storageConnectionStringSecret 'Microsoft.KeyVault/vaults/secrets@2024-11-01' = {
  parent: keyVault
  name: 'AZURE-STORAGE-CONNECTION-STRING'
  properties: {
    value: storageConnectionString
  }
}

output keyVaultName string = keyVault.name
