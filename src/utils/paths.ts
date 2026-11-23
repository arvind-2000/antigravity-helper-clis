import path from 'node:path';
import os from 'node:os';

/**
 * Normalizes any OS path to use forward slashes (canonical key format for manifest).
 */
export function toCanonicalPath(filePath: string): string {
  return filePath.replace(/\\/g, '/').replace(/^\/+/, '');
}

/**
 * Resolves an absolute path against a base directory, normalized.
 */
export function resolvePath(basePath: string, relativePath: string): string {
  return path.resolve(basePath, relativePath);
}

/**
 * Returns the global Gemini configuration file path on Windows / current OS.
 * Defaults to `%USERPROFILE%/.gemini/GEMINI.md` on Windows or `~/.gemini/GEMINI.md`.
 */
export function getGlobalGeminiPath(): string {
  const homeDir = process.env.USERPROFILE || os.homedir();
  return path.join(homeDir, '.gemini', 'GEMINI.md');
}

/**
 * Resolves relative path from target root.
 */
export function getRelativePath(rootPath: string, fullPath: string): string {
  return toCanonicalPath(path.relative(rootPath, fullPath));
}
