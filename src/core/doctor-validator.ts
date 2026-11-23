import path from 'node:path';
import { spawn } from 'node:child_process';
import fs from 'fs-extra';
import { calculateFileSha256 } from '../utils/checksum.js';
import { ManifestManager } from './manifest-manager.js';
import { DiagnosticCheck, DoctorResult } from '../types/index.js';
import { toCanonicalPath } from '../utils/paths.js';

export class DoctorValidator {
  /**
   * Runs the full diagnostic suite for a project directory.
   */
  static async runDiagnostics(targetDir: string): Promise<DoctorResult> {
    const checks: DiagnosticCheck[] = [];
    const resolvedRoot = path.resolve(targetDir);

    // 1. Runtime checks
    await this.checkNodeVersion(checks);
    await this.checkFlutterSdk(checks);
    await this.checkDartSdk(checks);
    await this.checkPython(checks);

    // 2. Project structure checks
    await this.checkProjectStructure(resolvedRoot, checks);

    // 3. AGENTS.md checks & link resolution
    await this.checkAgentsMd(resolvedRoot, checks);

    // 4. Rules checks
    await this.checkRules(resolvedRoot, checks);

    // 5. Workflows checks
    await this.checkWorkflows(resolvedRoot, checks);

    // 6. Skills metadata checks
    await this.checkSkills(resolvedRoot, checks);

    // 7. Manifest integrity checks
    await this.checkManifestIntegrity(resolvedRoot, checks);

    const hasErrors = checks.some(c => c.status === 'fail');
    const hasWarnings = checks.some(c => c.status === 'warn');

    return {
      checks,
      hasErrors,
      hasWarnings
    };
  }

  private static async checkNodeVersion(checks: DiagnosticCheck[]): Promise<void> {
    const version = process.version; // e.g. v22.22.2
    const major = parseInt(version.replace(/^v/, '').split('.')[0], 10);
    if (major >= 22) {
      checks.push({
        category: 'Runtime',
        name: 'Node.js Version',
        status: 'pass',
        message: `${version} (Node.js 22+ requirement satisfied)`
      });
    } else {
      checks.push({
        category: 'Runtime',
        name: 'Node.js Version',
        status: 'fail',
        message: `${version} detected. Node.js 22+ is required.`
      });
    }
  }

  private static async checkFlutterSdk(checks: DiagnosticCheck[]): Promise<void> {
    const res = await this.runCliCommand('flutter --version');
    if (res.success) {
      const firstLine = res.output.split('\n')[0].trim();
      checks.push({
        category: 'Runtime',
        name: 'Flutter SDK',
        status: 'pass',
        message: firstLine
      });
    } else {
      checks.push({
        category: 'Runtime',
        name: 'Flutter SDK',
        status: 'fail',
        message: 'Flutter CLI not found in PATH.'
      });
    }
  }

  private static async checkDartSdk(checks: DiagnosticCheck[]): Promise<void> {
    const res = await this.runCliCommand('dart --version');
    if (res.success) {
      const output = res.output.trim().replace(/\r?\n.*/s, '');
      checks.push({
        category: 'Runtime',
        name: 'Dart SDK',
        status: 'pass',
        message: output
      });
    } else {
      checks.push({
        category: 'Runtime',
        name: 'Dart SDK',
        status: 'fail',
        message: 'Dart CLI not found in PATH.'
      });
    }
  }

  private static async checkPython(checks: DiagnosticCheck[]): Promise<void> {
    const res = await this.runCliCommand('python --version');
    if (res.success) {
      checks.push({
        category: 'Runtime',
        name: 'Python Environment',
        status: 'pass',
        message: `${res.output.trim()} (available for UI/UX Pro Max)`
      });
    } else {
      checks.push({
        category: 'Runtime',
        name: 'Python Environment',
        status: 'warn',
        message: 'Python 3 not detected. UI/UX Pro Max search scripts require Python.'
      });
    }
  }

  private static async checkProjectStructure(projectRoot: string, checks: DiagnosticCheck[]): Promise<void> {
    const pubspecPath = path.join(projectRoot, 'pubspec.yaml');
    if (await fs.pathExists(pubspecPath)) {
      try {
        const content = await fs.readFile(pubspecPath, 'utf8');
        const hasFlutter = content.includes('sdk: flutter') || content.includes('flutter:');
        if (hasFlutter) {
          checks.push({
            category: 'Project',
            name: 'Flutter Project Configuration',
            status: 'pass',
            message: 'Valid pubspec.yaml with Flutter SDK dependency found.'
          });
        } else {
          checks.push({
            category: 'Project',
            name: 'Flutter Project Configuration',
            status: 'warn',
            message: 'pubspec.yaml found but no Flutter SDK section detected (Dart standalone package?).'
          });
        }
      } catch (err: any) {
        checks.push({
          category: 'Project',
          name: 'Flutter Project Configuration',
          status: 'fail',
          message: `Failed to read pubspec.yaml: ${err.message}`
        });
      }
    } else {
      checks.push({
        category: 'Project',
        name: 'Flutter Project Configuration',
        status: 'fail',
        message: `pubspec.yaml missing at ${projectRoot}`
      });
    }
  }

  private static async checkAgentsMd(projectRoot: string, checks: DiagnosticCheck[]): Promise<void> {
    const agentsMdPath = path.join(projectRoot, 'AGENTS.md');
    if (await fs.pathExists(agentsMdPath)) {
      checks.push({
        category: 'Agents',
        name: 'AGENTS.md Presence',
        status: 'pass',
        message: 'AGENTS.md found in project root.'
      });

      // Parse and check markdown references
      try {
        const content = await fs.readFile(agentsMdPath, 'utf8');
        // Match @[Title](path) or [Title](path)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        let linksFound = 0;
        let brokenLinks = 0;

        while ((match = linkRegex.exec(content)) !== null) {
          linksFound++;
          const refPath = match[2].trim();
          if (!refPath.startsWith('http://') && !refPath.startsWith('https://')) {
            const resolvedRef = path.resolve(projectRoot, refPath);
            if (!(await fs.pathExists(resolvedRef))) {
              brokenLinks++;
              checks.push({
                category: 'Agents',
                name: `AGENTS.md Reference: ${match[1]}`,
                status: 'fail',
                message: `Referenced file does not exist: ${refPath}`
              });
            }
          }
        }

        if (linksFound > 0 && brokenLinks === 0) {
          checks.push({
            category: 'Agents',
            name: 'AGENTS.md Link Resolution',
            status: 'pass',
            message: `All ${linksFound} referenced documentation links resolve successfully.`
          });
        }
      } catch (err: any) {
        checks.push({
          category: 'Agents',
          name: 'AGENTS.md Parsing',
          status: 'fail',
          message: err.message
        });
      }
    } else {
      checks.push({
        category: 'Agents',
        name: 'AGENTS.md Presence',
        status: 'warn',
        message: 'AGENTS.md is missing. Run `flutter-agent init` to install it.'
      });
    }
  }

  private static async checkRules(projectRoot: string, checks: DiagnosticCheck[]): Promise<void> {
    const rulesDir = path.join(projectRoot, '.agents', 'rules');
    if (await fs.pathExists(rulesDir)) {
      const files = await fs.readdir(rulesDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      if (mdFiles.length > 0) {
        checks.push({
          category: 'Rules',
          name: 'Project Rules',
          status: 'pass',
          message: `${mdFiles.length} rule files found (${mdFiles.join(', ')})`
        });
      } else {
        checks.push({
          category: 'Rules',
          name: 'Project Rules',
          status: 'warn',
          message: '.agents/rules directory exists but contains no .md rule files.'
        });
      }
    } else {
      checks.push({
        category: 'Rules',
        name: 'Project Rules',
        status: 'warn',
        message: '.agents/rules directory not found.'
      });
    }
  }

  private static async checkWorkflows(projectRoot: string, checks: DiagnosticCheck[]): Promise<void> {
    const workflowsDir = path.join(projectRoot, '.agents', 'workflows');
    if (await fs.pathExists(workflowsDir)) {
      const files = await fs.readdir(workflowsDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));
      if (mdFiles.length > 0) {
        checks.push({
          category: 'Workflows',
          name: 'Project Workflows',
          status: 'pass',
          message: `${mdFiles.length} workflow files found (${mdFiles.join(', ')})`
        });
      } else {
        checks.push({
          category: 'Workflows',
          name: 'Project Workflows',
          status: 'warn',
          message: '.agents/workflows directory exists but contains no .md workflow files.'
        });
      }
    } else {
      checks.push({
        category: 'Workflows',
        name: 'Project Workflows',
        status: 'warn',
        message: '.agents/workflows directory not found.'
      });
    }
  }

  private static async checkSkills(projectRoot: string, checks: DiagnosticCheck[]): Promise<void> {
    const skillsDir = path.join(projectRoot, '.agents', 'skills');
    if (await fs.pathExists(skillsDir)) {
      const entries = await fs.readdir(skillsDir, { withFileTypes: true });
      const skillDirs = entries.filter(e => e.isDirectory());

      let validSkills = 0;
      let invalidSkills = 0;

      for (const dir of skillDirs) {
        const skillMd = path.join(skillsDir, dir.name, 'SKILL.md');
        if (await fs.pathExists(skillMd)) {
          const content = await fs.readFile(skillMd, 'utf8');
          // Frontmatter check
          const hasFrontmatter = content.includes('name:') && content.includes('description:');
          if (hasFrontmatter) {
            validSkills++;
          } else {
            invalidSkills++;
            checks.push({
              category: 'Skills',
              name: `Skill: ${dir.name}`,
              status: 'warn',
              message: 'SKILL.md is missing required YAML frontmatter (name/description).'
            });
          }
        } else {
          invalidSkills++;
          checks.push({
            category: 'Skills',
            name: `Skill: ${dir.name}`,
            status: 'fail',
            message: 'Skill folder exists but is missing SKILL.md specification.'
          });
        }
      }

      checks.push({
        category: 'Skills',
        name: 'Skills Inventory',
        status: invalidSkills > 0 ? 'warn' : 'pass',
        message: `${skillDirs.length} skill directories installed (${validSkills} valid, ${invalidSkills} warnings)`
      });
    } else {
      checks.push({
        category: 'Skills',
        name: 'Skills Inventory',
        status: 'warn',
        message: '.agents/skills directory not found.'
      });
    }
  }

  private static async checkManifestIntegrity(projectRoot: string, checks: DiagnosticCheck[]): Promise<void> {
    const manifestManager = new ManifestManager(projectRoot);
    const manifest = await manifestManager.load();

    if (!manifest) {
      checks.push({
        category: 'Manifest',
        name: 'Manifest File',
        status: 'warn',
        message: '.agents/.manifest.json not found. Run `flutter-agent init` or `flutter-agent update` to create it.'
      });
      return;
    }

    checks.push({
      category: 'Manifest',
      name: 'Manifest File',
      status: 'pass',
      message: `Manifest v${manifest.cliVersion} found with ${Object.keys(manifest.files).length} tracked files.`
    });

    let alteredFiles = 0;
    let missingFiles = 0;

    for (const [relPath, entry] of Object.entries(manifest.files)) {
      const diskPath = path.join(projectRoot, relPath);
      if (!(await fs.pathExists(diskPath))) {
        missingFiles++;
      } else {
        const currentSha = await calculateFileSha256(diskPath);
        if (currentSha !== entry.installedSha256) {
          alteredFiles++;
        }
      }
    }

    if (missingFiles > 0) {
      checks.push({
        category: 'Manifest',
        name: 'Tracked File Integrity',
        status: 'warn',
        message: `${missingFiles} tracked files recorded in manifest are missing on disk.`
      });
    } else if (alteredFiles > 0) {
      checks.push({
        category: 'Manifest',
        name: 'Tracked File Integrity',
        status: 'pass',
        message: `${alteredFiles} tracked files have user modifications (preserved during updates).`
      });
    } else {
      checks.push({
        category: 'Manifest',
        name: 'Tracked File Integrity',
        status: 'pass',
        message: 'All tracked files match manifest checksums.'
      });
    }
  }

  private static runCliCommand(command: string): Promise<{ success: boolean; output: string }> {
    return new Promise(resolve => {
      const proc = spawn(command, { shell: true });
      let output = '';
      proc.stdout?.on('data', d => (output += d.toString()));
      proc.stderr?.on('data', d => (output += d.toString()));
      proc.on('close', code => {
        resolve({ success: code === 0, output });
      });
      proc.on('error', err => {
        resolve({ success: false, output: err.message });
      });
    });
  }
}
