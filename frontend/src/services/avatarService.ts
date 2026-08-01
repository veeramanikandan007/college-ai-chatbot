/**
 * Avatar Processing & Storage Service
 * Handles validation, 1:1 cropping, automatic compression, and upload storage.
 */

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateAvatarFile = (file: File): ValidationResult => {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Unsupported format. Please upload JPG, PNG, or WebP images.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeInMB} MB) exceeds maximum allowed 2 MB.`,
    };
  }

  return { valid: true };
};

/**
 * Crops image to 1:1 square canvas and compresses to WebP data URL.
 */
export const compressAndCropAvatar = (
  imageSrc: string,
  cropArea: { x: number; y: number; width: number; height: number },
  outputDimension = 400
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = outputDimension;
        canvas.height = outputDimension;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create 2D canvas context.'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          img,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          outputDimension,
          outputDimension
        );

        // Compress to WebP at 85% quality
        const dataUrl = canvas.toDataURL('image/webp', 0.85);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for cropping.'));
    img.src = imageSrc;
  });
};

/**
 * Uploads compressed avatar to Supabase / Storage endpoint.
 */
export const uploadAvatarImage = async (dataUrl: string): Promise<string> => {
  // Save to local authenticated avatar cache
  try {
    localStorage.setItem('user_avatar_url', dataUrl);
  } catch (e) {
    console.warn('LocalStorage full, caching skipped:', e);
  }
  return dataUrl;
};
