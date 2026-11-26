import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { skillAddCommand } from '../src/commands/skill.js';

describe('skillAddCommand', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'flutter-agent-skill-test-'));
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tempDir);
  });

  it('installs all antislop skills and rule when adding antislop', async () => {
    await skillAddCommand(['antislop'], { force: true });

    const expectedSkills = [
      'antislop',
      'antislop-code',
      'antislop-copywriting',
      'antislop-human',
      'antislop-layoutmobile',
      'antislop-ui'
    ];

    for (const skill of expectedSkills) {
      expect(await fs.pathExists(path.join(tempDir, '.agents', 'skills', skill, 'SKILL.md'))).toBe(true);
    }
    expect(await fs.pathExists(path.join(tempDir, '.agents', 'rules', 'antislop.md'))).toBe(true);
  });

  it('installs all 15 superpowers skills when adding superpowers', async () => {
    await skillAddCommand(['superpowers'], { force: true });

    const expectedSkills = [
      'brainstorming',
      'diagnosing-superpowers',
      'dispatching-parallel-agents',
      'executing-plans',
      'finishing-a-development-branch',
      'receiving-code-review',
      'requesting-code-review',
      'subagent-driven-development',
      'systematic-debugging',
      'test-driven-development',
      'using-git-worktrees',
      'using-superpowers',
      'verification-before-completion',
      'writing-plans',
      'writing-skills'
    ];

    for (const skill of expectedSkills) {
      expect(await fs.pathExists(path.join(tempDir, '.agents', 'skills', skill, 'SKILL.md'))).toBe(true);
    }
  });
});
