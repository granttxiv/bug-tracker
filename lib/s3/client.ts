import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client (works with both AWS S3 and MinIO)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT, // For MinIO: http://localhost:9000
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "minioadmin",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "minioadmin",
  },
  forcePathStyle: true, // Required for MinIO
});

export const uploadFile = async (
  bucket: string,
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Return S3 key for reference
    return key;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file");
  }
};

export const generateDownloadUrl = async (
  bucket: string,
  key: string,
  expiresIn: number = 3600, // 1 hour default
): Promise<string> => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    // Generate signed URL for GET request
    const url = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
      { expiresIn },
    );

    return url;
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw new Error("Failed to generate download URL");
  }
};

export const deleteFile = async (bucket: string, key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error("Failed to delete file");
  }
};

export const getS3Client = () => s3Client;
