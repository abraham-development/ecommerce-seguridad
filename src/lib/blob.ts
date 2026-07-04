import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

export class BlobStorageNotConfiguredError extends Error {
  constructor() {
    super("Azure Blob Storage is not configured");
    this.name = "BlobStorageNotConfiguredError";
  }
}

function getBlobServiceClient(): BlobServiceClient {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (connectionString) {
    return BlobServiceClient.fromConnectionString(connectionString);
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName) {
    throw new BlobStorageNotConfiguredError();
  }

  return new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );
}

export async function uploadProductImage(file: File): Promise<string> {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const containerName =
    process.env.AZURE_STORAGE_CONTAINER_NAME ?? "product-images";

  if (!accountName && !process.env.AZURE_STORAGE_CONNECTION_STRING) {
    throw new BlobStorageNotConfiguredError();
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const blobName = `products/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const container = getBlobServiceClient().getContainerClient(containerName);
  const blockBlob = container.getBlockBlobClient(blobName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await blockBlob.uploadData(bytes, {
    blobHTTPHeaders: {
      blobContentType: file.type || "application/octet-stream",
    },
  });

  return blockBlob.url;
}
