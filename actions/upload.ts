"use server";

import { getCurrentUser } from "@/lib/auth-helper";
import { uploadFile } from "@/lib/storage";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Server action to validate and upload post images.
 * Enforces session checks and size/type constraints on the server side.
 * 
 * @param formData FormData containing the "file" field.
 */
export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  try {
    // 1. Enforce authentication
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please log in to upload images." };
    }

    // 2. Extract file from form data
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return { success: false, error: "No image file provided." };
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { success: false, error: "Image size must be less than 5MB." };
    }

    // 4. Validate file type (MIME Type)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.",
      };
    }

    // 5. Upload file using decoupled storage service
    const url = await uploadFile(file);

    return { success: true, url };
  } catch (error) {
    console.error("Error in uploadImageAction:", error);
    return { success: false, error: "An unexpected error occurred during the image upload." };
  }
}

/**
 * Server action to validate and upload profile pictures during registration.
 * Does NOT enforce authentication checks because registration happens before login.
 * 
 * @param formData FormData containing the "file" field.
 */
export async function uploadAvatarAction(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File | null;
    if (!file || !(file instanceof File)) {
      return { success: false, error: "No image file provided." };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { success: false, error: "Avatar size must be less than 5MB." };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.",
      };
    }

    const url = await uploadFile(file);
    return { success: true, url };
  } catch (error) {
    console.error("Error in uploadAvatarAction:", error);
    return { success: false, error: "An unexpected error occurred during the avatar upload." };
  }
}

