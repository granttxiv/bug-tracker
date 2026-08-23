import { z } from "zod";

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "video/mp4",
  "video/quicktime",
  "application/zip",
  "application/x-rar-compressed",
];

export const UploadFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "File size must be less than 50MB",
    })
    .refine((file) => ALLOWED_MIME_TYPES.includes(file.type), {
      message: "File type not allowed",
    }),
});

export type UploadFileInput = z.infer<typeof UploadFileSchema>;
