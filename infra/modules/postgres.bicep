@description('Azure region for PostgreSQL resources.')
param location string

@description('Stable lowercase suffix used for globally unique resource names.')
param resourceSuffix string

@description('PostgreSQL administrator login name.')
param administratorLogin string

@secure()
@description('PostgreSQL administrator password.')
param administratorPassword string

@description('Delegated private subnet id for PostgreSQL Flexible Server.')
param delegatedSubnetId string

@description('Private DNS zone id for PostgreSQL Flexible Server.')
param privateDnsZoneId string

@description('Common resource tags.')
param tags object

var postgresServerName = 'psql-afcr-ecom-dev-${resourceSuffix}'
var databaseName = 'afcr_ecommerce'

resource server 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: postgresServerName
  location: location
  tags: tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorPassword
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    network: {
      delegatedSubnetResourceId: delegatedSubnetId
      privateDnsZoneArmResourceId: privateDnsZoneId
    }
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
  parent: server
  name: databaseName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

output postgresServerName string = server.name
output postgresHost string = server.properties.fullyQualifiedDomainName
output databaseName string = database.name
