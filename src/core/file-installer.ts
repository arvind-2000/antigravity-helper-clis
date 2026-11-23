import path from 'node:path';
import fs from 'fs-extra';
import { calculateFileSha256 } from '../utils/checksum.js';
import { ManifestFileEntry } from '../types/index.js';
import { toCanonicalPath } from '../utils/paths.js';

export interface InstallResult {
  installed: string[];
  updated: string[];
  skipped: string[];
  backedUp: string[];
  manifestEntries: Record<string, ManifestFileEntry>;
}

export class FileInstaller {
  /**
   * Safely installs or updates a file. Creates a backup if requested.
   */
  static async installFile(
    sourcePath: string,
    targetPath: string,
    createBackup = false
  ): Promise<{ backupPath?: string; sha256: string }> {
    await fs.ensureDir(path.dirname(targetPath));

    let backupPath: string | undefined;
    if (createBackup && (await fs.pathExists(targetPath))) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      backupPath = `${targetPath}.bak.${timestamp}`;
      await fs.copy(targetPath, backupPath);
    }

    await fs.copy(sourcePath, targetPath, { overwrite: true });
    const sha256 = await calculateFileSha256(targetPath);

    return { backupPath, sha256 };
  }

  /**
   * Installs a single template file and returns its manifest entry.
   */
  static async installTemplate(
    projectRoot: string,
    relativePath: string,
    templateSourcePath: string,
    createBackup = false
  ): Promise<{ relativePath: string; entry: ManifestFileEntry; backupPath?: string }> {
    const targetPath = path.join(projectRoot, relativePath);
    const { backupPath, sha256 } = await this.installFile(templateSourcePath, targetPath, createBackup);

    return {
      relativePath: toCanonicalPath(relativePath),
      backupPath,
      entry: {
        bundledSha256: sha256,
        installedSha256: sha256,
        lastUpdated: new Date().toISOString()
      }
    };
  }
}
