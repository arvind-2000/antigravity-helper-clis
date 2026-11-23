import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { ManifestManager, CURRENT_CLI_VERSION } from '../src/core/manifest-manager.js';
import { calculateSha256 } from '../src/utils/checksum.js';

describe('ManifestManager', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'flutter-agent-manifest-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('creates and saves manifest with correct structure', async () => {
    const manager = new ManifestManager(tempDir);
    const hash = calculateSha256('sample content');

    const manifest = await manager.createOrUpdate(tempDir, {
      'AGENTS.md': {
        bundledSha256: hash,
        installedSha256: hash,
        lastUpdated: new Date().toISOString()
      }
    });

    expect(manifest.cliVersion).toBe(CURRENT_CLI_VERSION);
    expect(manifest.files['AGENTS.md']).toBeDefined();
    expect(manifest.files['AGENTS.md'].installedSha256).toBe(hash);

    // Verify loaded matches
    const loaded = await manager.load();
    expect(loaded).not.toBeNull();
    expect(loaded?.files['AGENTS.md'].installedSha256).toBe(hash);
  });

  it('updates existing manifest incrementally', async () => {
    const manager = new ManifestManager(tempDir);
    const hash1 = calculateSha256('content 1');
    const hash2 = calculateSha256('content 2');

    await manager.createOrUpdate(tempDir, {
      'file1.md': {
        bundledSha256: hash1,
        installedSha256: hash1,
        lastUpdated: new Date().toISOString()
      }
    });

    const updated = await manager.createOrUpdate(tempDir, {
      'file2.md': {
        bundledSha256: hash2,
        installedSha256: hash2,
        lastUpdated: new Date().toISOString()
      }
    });

    expect(Object.keys(updated.files)).toHaveLength(2);
    expect(updated.files['file1.md']).toBeDefined();
    expect(updated.files['file2.md']).toBeDefined();
  });
});
