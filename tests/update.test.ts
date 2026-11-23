import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { initCommand } from '../src/commands/init.js';
import { updateCommand } from '../src/commands/update.js';
import { ManifestManager } from '../src/core/manifest-manager.js';

describe('updateCommand', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'flutter-agent-update-test-'));
    originalCwd = process.cwd();

    await fs.writeFile(
      path.join(tempDir, 'pubspec.yaml'),
      'name: update_test_app\nenvironment:\n  sdk: ">=3.0.0 <4.0.0"\ndependencies:\n  flutter:\n    sdk: flutter\n'
    );
    await fs.ensureDir(path.join(tempDir, 'lib'));
    await fs.writeFile(path.join(tempDir, 'lib', 'main.dart'), 'void main() {}');

    // Run initial init
    await initCommand(tempDir, { interactive: false, all: false, force: true });
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  it('runs update without modifying identical files', async () => {
    const manifestBefore = await new ManifestManager(tempDir).load();
    await updateCommand({ force: false });
    const manifestAfter = await new ManifestManager(tempDir).load();

    expect(manifestAfter).toEqual(manifestBefore);
  });

  it('preserves user modified files when not forced in non-interactive mode', async () => {
    const rulePath = path.join(tempDir, '.agents', 'rules', 'project-architecture.md');
    const customContent = '# Custom User Architecture Rules\n- Rule 1: Custom rule';
    await fs.writeFile(rulePath, customContent);

    // Run update in non-interactive mode
    await updateCommand({ force: false });

    // Custom content should be completely preserved
    const preservedContent = await fs.readFile(rulePath, 'utf8');
    expect(preservedContent).toBe(customContent);
  });

  it('supports dry-run mode without changing disk', async () => {
    const rulePath = path.join(tempDir, '.agents', 'rules', 'project-architecture.md');
    const customContent = '# Custom User Architecture Rules';
    await fs.writeFile(rulePath, customContent);

    await updateCommand({ dryRun: true });

    const preservedContent = await fs.readFile(rulePath, 'utf8');
    expect(preservedContent).toBe(customContent);
  });
});
