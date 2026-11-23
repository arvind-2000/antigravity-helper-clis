import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { initCommand } from '../src/commands/init.js';
import { ManifestManager } from '../src/core/manifest-manager.js';

describe('initCommand', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'flutter-agent-init-test-'));
    // Setup dummy Flutter project
    await fs.writeFile(
      path.join(tempDir, 'pubspec.yaml'),
      'name: sample_flutter_app\nenvironment:\n  sdk: ">=3.0.0 <4.0.0"\ndependencies:\n  flutter:\n    sdk: flutter\n'
    );
    await fs.ensureDir(path.join(tempDir, 'lib'));
    await fs.writeFile(path.join(tempDir, 'lib', 'main.dart'), 'void main() {}');
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('installs core templates, rules, workflows, and AGENTS.md cleanly', async () => {
    await initCommand(tempDir, {
      interactive: false,
      all: false,
      firebase: false,
      api: false,
      force: true
    });

    expect(await fs.pathExists(path.join(tempDir, 'AGENTS.md'))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, '.agents', 'rules', 'project-architecture.md'))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, '.agents', 'workflows', 'create-feature.md'))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, '.agents', 'skills', 'flutter-testing', 'SKILL.md'))).toBe(true);

    const manifestManager = new ManifestManager(tempDir);
    const manifest = await manifestManager.load();
    expect(manifest).not.toBeNull();
    expect(manifest?.files['AGENTS.md']).toBeDefined();
    expect(manifest?.files['.agents/rules/project-architecture.md']).toBeDefined();

    // Verify application code (lib/main.dart) was NEVER touched or modified
    const mainDartContent = await fs.readFile(path.join(tempDir, 'lib', 'main.dart'), 'utf8');
    expect(mainDartContent).toBe('void main() {}');
  });

  it('is idempotent on consecutive executions', async () => {
    await initCommand(tempDir, { interactive: false, all: false, force: true });
    const manifest1 = await new ManifestManager(tempDir).load();

    // Re-run immediately
    await initCommand(tempDir, { interactive: false, all: false, force: true });
    const manifest2 = await new ManifestManager(tempDir).load();

    expect(manifest2?.installedAt).toBe(manifest1?.installedAt);
    expect(Object.keys(manifest2?.files || {})).toEqual(Object.keys(manifest1?.files || {}));
  });

  it('selectively installs firebase and api skills when requested', async () => {
    await initCommand(tempDir, {
      interactive: false,
      skills: 'firebase-engineering,api-integration',
      force: true
    });

    expect(await fs.pathExists(path.join(tempDir, '.agents', 'skills', 'firebase-engineering', 'SKILL.md'))).toBe(true);
    expect(await fs.pathExists(path.join(tempDir, '.agents', 'skills', 'api-integration', 'SKILL.md'))).toBe(true);
  });
});
