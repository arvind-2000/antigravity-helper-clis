import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { DoctorValidator } from '../src/core/doctor-validator.js';

describe('DoctorValidator', { timeout: 25000 }, () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'flutter-agent-doc-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  it('fails project check when pubspec.yaml is missing', async () => {
    const result = await DoctorValidator.runDiagnostics(tempDir);
    const pubspecCheck = result.checks.find(c => c.name === 'Flutter Project Configuration');
    expect(pubspecCheck).toBeDefined();
    expect(pubspecCheck?.status).toBe('fail');
  });

  it('detects broken links in AGENTS.md', async () => {
    // Create valid pubspec.yaml
    await fs.writeFile(
      path.join(tempDir, 'pubspec.yaml'),
      'name: test_app\nenvironment:\n  sdk: ">=3.0.0 <4.0.0"\ndependencies:\n  flutter:\n    sdk: flutter\n'
    );

    // Create AGENTS.md with non-existent link
    await fs.writeFile(
      path.join(tempDir, 'AGENTS.md'),
      '@[Missing Rule](.agents/rules/non-existent.md)'
    );

    const result = await DoctorValidator.runDiagnostics(tempDir);
    const brokenLinkCheck = result.checks.find(c => c.name.includes('AGENTS.md Reference'));
    expect(brokenLinkCheck).toBeDefined();
    expect(brokenLinkCheck?.status).toBe('fail');
  });

  it('passes AGENTS.md link check when target file exists', async () => {
    await fs.writeFile(
      path.join(tempDir, 'pubspec.yaml'),
      'name: test_app\nenvironment:\n  sdk: ">=3.0.0 <4.0.0"\ndependencies:\n  flutter:\n    sdk: flutter\n'
    );

    const ruleRel = path.join('.agents', 'rules', 'rule.md');
    const ruleFull = path.join(tempDir, ruleRel);
    await fs.ensureDir(path.dirname(ruleFull));
    await fs.writeFile(ruleFull, '# Rule');

    await fs.writeFile(
      path.join(tempDir, 'AGENTS.md'),
      '@[Rule](.agents/rules/rule.md)'
    );

    const result = await DoctorValidator.runDiagnostics(tempDir);
    const resolutionCheck = result.checks.find(c => c.name === 'AGENTS.md Link Resolution');
    expect(resolutionCheck).toBeDefined();
    expect(resolutionCheck?.status).toBe('pass');
  });
});
