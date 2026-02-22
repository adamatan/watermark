import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "../constants";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "File exceeds the 50 MB limit." };
  }
  if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return {
      valid: false,
      error:
        "Unsupported format. Please upload a JPEG, PNG, WebP, BMP, TIFF, or GIF.",
    };
  }
  return { valid: true };
}
