/**
 * Softrova Security Utility
 * Enterprise-grade sanitization, input filtering, and validation
 */

// Whitelisted MIME types for binaries and images
export const ALLOWED_FILE_EXTENSIONS = [
  'apk',
  'zip',
  'exe',
  'dmg',
  'tar.gz',
  'deb',
] as const;

export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
] as const;

export const MAX_PACKAGE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Sanitize untrusted user input string to prevent XSS and script injections
 */
export function sanitizeString(input: string, maxLength = 500): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Block pseudo-protocols
    .replace(/data:/gi, '')
    .replace(/on\w+=/gi, ''); // Block event handlers (e.g. onclick, onerror)
}

/**
 * Validate package identifier format (e.g. com.softrova.app)
 */
export function isValidPackageId(packageId: string): boolean {
  const regex = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/i;
  return regex.test(packageId) && packageId.length <= 128;
}

/**
 * Validate semver version format (e.g. 1.0.0 or 2.1.4-beta)
 */
export function isValidVersion(version: string): boolean {
  const regex = /^\d+\.\d+\.\d+([-\w.]+)?$/;
  return regex.test(version.trim()) && version.length <= 32;
}

/**
 * Check if uploaded file is safe and whitelisted
 */
export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  if (!file) return { valid: false, error: 'No file provided.' };

  if (file.size > MAX_PACKAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the maximum limit of ${MAX_PACKAGE_SIZE_BYTES / (1024 * 1024)} MB.`,
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const isAllowed = ALLOWED_FILE_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!isAllowed) {
    return {
      valid: false,
      error: `Unsupported file extension (.${extension}). Allowed: ${ALLOWED_FILE_EXTENSIONS.join(', ')}.`,
    };
  }

  // Prevent path traversal in file names
  if (file.name.includes('/') || file.name.includes('\\') || file.name.includes('..')) {
    return {
      valid: false,
      error: 'Invalid file name detected (potential directory traversal payload).',
    };
  }

  return { valid: true };
}

/**
 * Validate uploaded image file
 */
export function validateUploadImage(file: File): { valid: boolean; error?: string } {
  if (!file) return { valid: false, error: 'No image provided.' };

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image exceeds maximum size limit of ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)} MB.`,
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Invalid image format (${file.type}). Allowed: PNG, JPEG, WebP, SVG.`,
    };
  }

  return { valid: true };
}

/**
 * Client-side rate limiter / brute-force guard
 */
const rateLimitMap = new Map<string, { attempts: number; lockedUntil: number }>();

export function checkRateLimit(action: string, maxAttempts = 5, lockDurationMs = 60000): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(action) || { attempts: 0, lockedUntil: 0 };

  if (now < record.lockedUntil) {
    return {
      allowed: false,
      waitSeconds: Math.ceil((record.lockedUntil - now) / 1000),
    };
  }

  if (record.attempts >= maxAttempts) {
    record.lockedUntil = now + lockDurationMs;
    record.attempts = 0;
    rateLimitMap.set(action, record);
    return {
      allowed: false,
      waitSeconds: Math.ceil(lockDurationMs / 1000),
    };
  }

  record.attempts += 1;
  rateLimitMap.set(action, record);
  return { allowed: true };
}
