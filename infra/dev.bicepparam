using './main.bicep'

param location = 'westus2'
param environment = 'dev'
param resourceSuffix = readEnvironmentVariable('AFCR_RESOURCE_SUFFIX', 'afcr01')
param postgresAdminLogin = readEnvironmentVariable('POSTGRES_ADMIN_LOGIN', 'afcradmin')
param postgresAdminPassword = readEnvironmentVariable('POSTGRES_ADMIN_PASSWORD')
param entraExternalIdClientId = readEnvironmentVariable('ENTRA_EXTERNAL_ID_CLIENT_ID', '')
param entraExternalIdClientSecret = readEnvironmentVariable('ENTRA_EXTERNAL_ID_CLIENT_SECRET')
param entraExternalIdIssuer = readEnvironmentVariable('ENTRA_EXTERNAL_ID_ISSUER', '')
param nextAuthSecret = readEnvironmentVariable('NEXTAUTH_SECRET')
