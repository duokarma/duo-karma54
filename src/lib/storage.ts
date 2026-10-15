import { supabase } from "@/lib/supabase";

/**
 * DuoKarma Storage Client (Powered by Supabase Storage)
 * Bucket: duokarma-files
 */

export interface UploadOptions {
  folder?: "leads" | "clients" | "documents" | "general";
  entityId?: string;
  onProgress?: (percent: number) => void;
}

export interface UploadResult {
  publicUrl: string;
  key: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: string;
}

export interface StorageStatus {
  service: string;
  configured: boolean;
  bucket: string;
  maxFileSizeBytes: number;
}

export const STORAGE_BUCKET = "duokarma-files";

/**
 * Check Supabase Storage connection
 */
export async function checkStorageStatus(): Promise<StorageStatus> {
  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).list("", { limit: 1 });
    return {
      service: "Supabase Storage",
      configured: !error,
      bucket: STORAGE_BUCKET,
      maxFileSizeBytes: 50 * 1024 * 1024,
    };
  } catch {
    return {
      service: "Supabase Storage",
      configured: false,
      bucket: STORAGE_BUCKET,
      maxFileSizeBytes: 50 * 1024 * 1024,
    };
  }
}

/**
 * Upload a file directly to Supabase Storage bucket
 */
export async function uploadToStorage(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const folder = options.folder || "documents";
  const entityId = options.entityId;

  // Sanitize filename to avoid weird character issues
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${entityId ? `${entityId}/` : ""}${Date.now()}_${cleanName}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Supabase Storage upload error:", error);
    throw new Error(error.message || "Failed to upload file to storage.");
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  let sizeStr = "";
  if (file.size < 1024 * 1024) {
    sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
  } else {
    sizeStr = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
  }

  return {
    publicUrl: urlData.publicUrl,
    key: data.path,
    fileName: file.name,
    fileSize: sizeStr,
    fileType: file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFromStorage(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return !error;
  } catch (err) {
    console.error("Delete from storage error:", err);
    return false;
  }
}
