targetScope = 'resourceGroup'

@description('Azure region for future ecommerce development resources.')
param location string = resourceGroup().location

@description('Deployment environment label.')
param environment string = 'dev'

output resourceGroupName string = resourceGroup().name
output deploymentLocation string = location
output deploymentEnvironment string = environment
