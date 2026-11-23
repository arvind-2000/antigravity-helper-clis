import path from 'node:path';
import { spawn } from 'node:child_process';
import fs from 'fs-extra';
import { Logger } from '../utils/logger.js';

export interface UiUxInitOptions {
  projectRoot: string;
  projectName: string;
  query?: string;
  force?: boolean;
}

export class UiUxRunner {
  /**
   * Checks if Python is available in PATH.
   */
  static async checkPython(): Promise<{ available: boolean; command: string; version?: string }> {
    for (const cmd of ['python', 'python3']) {
      try {
        const version = await new Promise<string>((resolve, reject) => {
          const proc = spawn(cmd, ['--version'], { shell: true });
          let stdout = '';
          let stderr = '';
          proc.stdout.on('data', d => (stdout += d.toString()));
          proc.stderr.on('data', d => (stderr += d.toString()));
          proc.on('close', code => {
            if (code === 0) {
              resolve((stdout || stderr).trim());
            } else {
              reject(new Error(`Exit code ${code}`));
            }
          });
          proc.on('error', reject);
        });

        if (version.toLowerCase().includes('python')) {
          return { available: true, command: cmd, version };
        }
      } catch {
        // try next
      }
    }

    return { available: false, command: 'python' };
  }

  /**
   * Self-initializes UI/UX Pro Max by running the bundled search script
   * to generate and persist the Flutter design system contract.
   */
  static async initialize(options: UiUxInitOptions): Promise<{ success: boolean; message: string }> {
    const pythonCheck = await this.checkPython();
    if (!pythonCheck.available) {
      return {
        success: false,
        message: 'Python 3 is required for UI/UX Pro Max self-initialization but was not found in PATH.'
      };
    }

    const scriptPath = path.join(
      options.projectRoot,
      '.agents',
      'skills',
      'ui-ux-pro-max',
      'scripts',
      'search.py'
    );

    if (!(await fs.pathExists(scriptPath))) {
      return {
        success: false,
        message: `ui-ux-pro-max search.py not found at ${scriptPath}. Ensure skill is installed first.`
      };
    }

    const query = options.query || `${options.projectName} modern clean mobile app`;
    const args = [
      `"${scriptPath}"`,
      `"${query}"`,
      '--stack',
      'flutter',
      '--design-system',
      '--persist',
      '-p',
      `"${options.projectName}"`,
      '--output-dir',
      `"${options.projectRoot}"`
    ];

    if (options.force) {
      args.push('--force');
    }

    const spinner = Logger.spinner(`Initializing UI/UX Pro Max design system for "${options.projectName}"...`);
    spinner.start();

    try {
      const output = await new Promise<string>((resolve, reject) => {
        const proc = spawn(`${pythonCheck.command} ${args.join(' ')}`, {
          shell: true,
          cwd: options.projectRoot
        });

        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', d => (stdout += d.toString()));
        proc.stderr.on('data', d => (stderr += d.toString()));

        proc.on('close', code => {
          if (code === 0) {
            resolve(stdout || stderr);
          } else {
            reject(new Error(`UI/UX init exited with code ${code}: ${stderr || stdout}`));
          }
        });

        proc.on('error', reject);
      });

      spinner.succeed(`UI/UX Pro Max design system initialized for "${options.projectName}".`);
      return { success: true, message: output };
    } catch (err: any) {
      spinner.fail(`UI/UX Pro Max initialization encountered an issue: ${err.message}`);
      return { success: false, message: err.message };
    }
  }
}
