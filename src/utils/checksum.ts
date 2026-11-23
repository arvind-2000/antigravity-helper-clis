import crypto from 'node:crypto';
import fs from 'fs-extra';

/**
 * Calculates SHA-256 for a string or buffer.
 * If normalizeNewlines is true, standardizes \r\n to \n to ensure Windows/Unix cross-platform consistency.
 */
export function calculateSha256(content: string | Buffer, normalizeNewlines = true): string {
  let data: string | Buffer = content;
  if (typeof content === 'string' && normalizeNewlines) {
    data = content.replace(/\r\n/g, '\n');
  } else if (Buffer.isBuffer(content) && normalizeNewlines) {
    // Attempt utf-8 decoding for line ending normalization if it's text
    try {
      const text = content.toString('utf8');
      // If it has no null bytes, treat as text
      if (!text.includes('\0')) {
        data = text.replace(/\r\n/g, '\n');
      }
    } catch {
      // keep raw buffer
    }
  }

  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Reads a file from disk and calculates its normalized SHA-256 hash.
 */
export async function calculateFileSha256(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  return calculateSha256(buffer, true);
}
