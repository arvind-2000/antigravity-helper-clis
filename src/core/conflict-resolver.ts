import path from 'node:path';
import fs from 'fs-extra';
import { calculateFileSha256 } from '../utils/checksum.js';
import { Manifest, FileDiffResult, FileDiffStatus } from '../types/index.js';
import { toCanonicalPath } from '../utils/paths.js';

export class ConflictResolver {
  /**
   * Compares a template file with disk state and manifest history.
   */
  static async evaluateFile(
    projectRoot: string,
    relativePath: string, // e.g. "AGENTS.md" or ".agents/rules/project-architecture.md"
    templateFilePath: string,
    manifest: Manifest | null
  ): Promise<FileDiffResult> {
    const diskPath = path.join(projectRoot, relativePath);
    const bundledSha = await calculateFileSha256(templateFilePath);
    const canonicalRel = toCanonicalPath(relativePath);
    const manifestEntry = manifest?.files?.[canonicalRel];

    const diskExists = await fs.pathExists(diskPath);

    if (!diskExists) {
      return {
        relativePath: canonicalRel,
        status: manifestEntry ? 'MISSING_ON_DISK' : 'NEW_TEMPLATE',
        bundledSha,
        manifestSha: manifestEntry?.installedSha256,
        diskPath,
        templatePath: templateFilePath
      };
    }

    const diskSha = await calculateFileSha256(diskPath);

    if (diskSha === bundledSha) {
      return {
        relativePath: canonicalRel,
        status: 'IDENTICAL',
        diskSha,
        bundledSha,
        manifestSha: manifestEntry?.installedSha256,
        diskPath,
        templatePath: templateFilePath
      };
    }

    if (manifestEntry) {
      // Check if disk matches what was previously installed
      if (diskSha === manifestEntry.installedSha256) {
        // Disk is untouched from prior install, bundle has changed
        return {
          relativePath: canonicalRel,
          status: 'CLEAN_UPDATE',
          diskSha,
          bundledSha,
          manifestSha: manifestEntry.installedSha256,
          diskPath,
          templatePath: templateFilePath
        };
      }

      // Disk differs from what was recorded in manifest: user modified it
      return {
        relativePath: canonicalRel,
        status: 'USER_MODIFIED',
        diskSha,
        bundledSha,
        manifestSha: manifestEntry.installedSha256,
        diskPath,
        templatePath: templateFilePath
      };
    }

    // No manifest entry, but file exists and differs from bundled default
    return {
      relativePath: canonicalRel,
      status: 'USER_MODIFIED',
      diskSha,
      bundledSha,
      diskPath,
      templatePath: templateFilePath
    };
  }
}
