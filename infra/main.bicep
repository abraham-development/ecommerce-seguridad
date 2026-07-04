targetScope = 'resourceGroup'

@description('Azure region for future ecommerce development resources.')
param location string = resourceGroup().location

@description('Deployment environment label.')
param environment string = 'dev'

@description('Stable lowercase suffix used for globally unique resource names.')
@minLength(3)
@maxLength(8)
param resourceSuffix string

@description('PostgreSQL administrator login name.')
param postgresAdminLogin string = 'afcradmin'

@secure()
@description('PostgreSQL administrator password. Pass from environment or Key Vault, never commit it.')
param postgresAdminPassword string

@secure()
@description('OIDC client secret for Entra External ID. Pass from environment or Key Vault, never commit it.')
param entraExternalIdClientSecret string

@description('OIDC client id for Entra External ID.')
param entraExternalIdClientId string = ''

@description('OIDC issuer URL for Entra External ID.')
param entraExternalIdIssuer string = ''

@secure()
@description('Auth.js/NextAuth secret. Pass from environment or Key Vault, never commit it.')
param nextAuthSecret string

var tags = {
  app: 'afcr-ecommerce'
  env: environment
  owner: 'abraham'
  managedBy: 'bicep'
}

module network './modules/network.bicep' = {
  name: 'network-${environment}'
  params: {
    location: location
    tags: tags
  }
}

module monitoring './modules/monitoring.bicep' = {
  name: 'monitoring-${environment}'
  params: {
    location: location
    tags: tags
  }
}

module storage './modules/storage.bicep' = {
  name: 'storage-${environment}'
  params: {
    location: location
    resourceSuffix: resourceSuffix
    tags: tags
  }
}

module postgres './modules/postgres.bicep' = {
  name: 'postgres-${environment}'
  params: {
    location: location
    resourceSuffix: resourceSuffix
    administratorLogin: postgresAdminLogin
    administratorPassword: postgresAdminPassword
    delegatedSubnetId: network.outputs.postgresSubnetId
    privateDnsZoneId: network.outputs.postgresPrivateDnsZoneId
    tags: tags
  }
}

module appService './modules/app-service.bicep' = {
  name: 'app-service-${environment}'
  params: {
    location: location
    resourceSuffix: resourceSuffix
    appSubnetId: network.outputs.appSubnetId
    applicationInsightsConnectionString: monitoring.outputs.applicationInsightsConnectionString
    storageAccountName: storage.outputs.storageAccountName
    blobContainerName: storage.outputs.productImagesContainerName
    postgresHost: postgres.outputs.postgresHost
    postgresDatabaseName: postgres.outputs.databaseName
    postgresAdminLogin: postgresAdminLogin
    tags: tags
  }
}

module keyVault './modules/key-vault.bicep' = {
  name: 'key-vault-${environment}'
  params: {
    location: location
    resourceSuffix: resourceSuffix
    webAppPrincipalId: appService.outputs.webAppPrincipalId
    storageAccountName: storage.outputs.storageAccountName
    storageAccountId: storage.outputs.storageAccountId
    databaseUrl: 'postgresql://${postgresAdminLogin}:${postgresAdminPassword}@${postgres.outputs.postgresHost}:5432/${postgres.outputs.databaseName}?sslmode=require'
    postgresAdminPassword: postgresAdminPassword
    entraExternalIdClientId: entraExternalIdClientId
    entraExternalIdClientSecret: entraExternalIdClientSecret
    entraExternalIdIssuer: entraExternalIdIssuer
    nextAuthSecret: nextAuthSecret
    tags: tags
  }
}

output resourceGroupName string = resourceGroup().name
output deploymentLocation string = location
output deploymentEnvironment string = environment
output webAppName string = appService.outputs.webAppName
output webAppUrl string = appService.outputs.webAppUrl
output storageAccountName string = storage.outputs.storageAccountName
output productImagesContainerName string = storage.outputs.productImagesContainerName
output postgresServerName string = postgres.outputs.postgresServerName
output keyVaultName string = keyVault.outputs.keyVaultName
