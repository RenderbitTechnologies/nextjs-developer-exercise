import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Uploads a file to a storage provider.
 * The current implementation writes to the local public/uploads directory.
 * To switch to S3/Cloudinary/UploadThing, only the implementation of this function needs to be changed.
 *
 * @param file The file object to upload.
 * @returns The public URL of the uploaded image.
 */
export async function uploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename with random bytes
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${uniqueId}${ext.toLowerCase()}`;

  // Resolve upload path
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadsDir, filename);

  // Ensure uploads directory exists
  await fs.mkdir(uploadsDir, { recursive: true });

  // Write file
  await fs.writeFile(filePath, buffer);

  // Return public URL path
  return `/uploads/${filename}`;
}
