import path from 'node:path';
import fs from 'fs-extra';
import { Manifest, ManifestFileEntry } from '../types/index.js';
import { toCanonicalPath } from '../utils/paths.js';

export const MANIFEST_FILENAME = '.manifest.json';
export const CURRENT_CLI_VERSION = '1.0.0';

export class ManifestManager {
  private manifestPath: string;

  constructor(projectRoot: string) {
    this.manifestPath = path.join(projectRoot, '.agents', MANIFEST_FILENAME);
  }

  getManifestPath(): string {
    return this.manifestPath;
  }

  async exists(): Promise<boolean> {
    return fs.pathExists(this.manifestPath);
  }

  async load(): Promise<Manifest | null> {
    try {
      if (await this.exists()) {
        const data = await fs.readJson(this.manifestPath);
        return data as Manifest;
      }
      return null;
    } catch {
      return null;
    }
  }

  async save(manifest: Manifest): Promise<void> {
    await fs.ensureDir(path.dirname(this.manifestPath));
    await fs.writeJson(this.manifestPath, manifest, { spaces: 2 });
  }

  async createOrUpdate(
    projectRoot: string,
    entries: Record<string, ManifestFileEntry>
  ): Promise<Manifest> {
    const existing = (await this.load()) || {
      cliVersion: CURRENT_CLI_VERSION,
      installedAt: new Date().toISOString(),
      projectRoot: toCanonicalPath(projectRoot),
      files: {}
    };

    const updatedFiles: Record<string, ManifestFileEntry> = {
      ...existing.files,
      ...entries
    };

    const updatedManifest: Manifest = {
      cliVersion: CURRENT_CLI_VERSION,
      installedAt: existing.installedAt,
      projectRoot: toCanonicalPath(projectRoot),
      files: updatedFiles
    };

    await this.save(updatedManifest);
    return updatedManifest;
  }
}
