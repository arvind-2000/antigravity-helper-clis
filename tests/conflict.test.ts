import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { ConflictResolver } from '../src/core/conflict-resolver.js';
import { calculateSha256 } from '../src/utils/checksum.js';
import { Manifest } from '../src/types/index.js';

describe('ConflictResolver', () => {
  let tempDir: string;
  let templateDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'flutter-agent-conflict-test-'));
    templateDir = await fs.mkdtemp(path.join(os.tmpdir(), 'flutter-agent-tpl-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
    await fs.remove(templateDir);
  });

  it('detects NEW_TEMPLATE when file does not exist on disk and no manifest entry', async () => {
    const tplPath = path.join(templateDir, 'test.md');
    await fs.writeFile(tplPath, 'bundled template content');

    const result = await ConflictResolver.evaluateFile(tempDir, 'test.md', tplPath, null);
    expect(result.status).toBe('NEW_TEMPLATE');
  });

  it('detects IDENTICAL when disk matches bundle exactly', async () => {
    const tplPath = path.join(templateDir, 'test.md');
    const diskPath = path.join(tempDir, 'test.md');
    const content = 'same content in both';
    await fs.writeFile(tplPath, content);
    await fs.writeFile(diskPath, content);

    const result = await ConflictResolver.evaluateFile(tempDir, 'test.md', tplPath, null);
    expect(result.status).toBe('IDENTICAL');
  });

  it('detects CLEAN_UPDATE when disk matches prior install and bundle has changed', async () => {
    const tplPath = path.join(templateDir, 'test.md');
    const diskPath = path.join(tempDir, 'test.md');
    const originalContent = 'version 1';
    const newContent = 'version 2 in bundle';

    await fs.writeFile(tplPath, newContent);
    await fs.writeFile(diskPath, originalContent);

    const manifest: Manifest = {
      cliVersion: '1.0.0',
      installedAt: new Date().toISOString(),
      projectRoot: tempDir,
      files: {
        'test.md': {
          bundledSha256: calculateSha256(originalContent),
          installedSha256: calculateSha256(originalContent),
          lastUpdated: new Date().toISOString()
        }
      }
    };

    const result = await ConflictResolver.evaluateFile(tempDir, 'test.md', tplPath, manifest);
    expect(result.status).toBe('CLEAN_UPDATE');
  });

  it('detects USER_MODIFIED when disk differs from manifest installed sha', async () => {
    const tplPath = path.join(templateDir, 'test.md');
    const diskPath = path.join(tempDir, 'test.md');
    const originalContent = 'version 1';
    const userContent = 'user modified custom version';

    await fs.writeFile(tplPath, 'version 2 in bundle');
    await fs.writeFile(diskPath, userContent);

    const manifest: Manifest = {
      cliVersion: '1.0.0',
      installedAt: new Date().toISOString(),
      projectRoot: tempDir,
      files: {
        'test.md': {
          bundledSha256: calculateSha256(originalContent),
          installedSha256: calculateSha256(originalContent),
          lastUpdated: new Date().toISOString()
        }
      }
    };

    const result = await ConflictResolver.evaluateFile(tempDir, 'test.md', tplPath, manifest);
    expect(result.status).toBe('USER_MODIFIED');
  });
});
