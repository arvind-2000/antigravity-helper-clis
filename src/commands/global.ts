import path from 'node:path';
import fs from 'fs-extra';
import { select } from '@inquirer/prompts';
import { TemplateManager } from '../core/template-manager.js';
import { getGlobalGeminiPath } from '../utils/paths.js';
import { calculateFileSha256 } from '../utils/checksum.js';
import { FileInstaller } from '../core/file-installer.js';
import { Logger } from '../utils/logger.js';

export async function globalInstallCommand(options: { force?: boolean } = {}): Promise<void> {
  const globalPath = getGlobalGeminiPath();
  Logger.header(`Installing Global Antigravity GEMINI.md: ${globalPath}`);

  const templateManager = new TemplateManager();
  const templatePath = templateManager.getGlobalGeminiTemplatePath();

  if (!(await fs.pathExists(templatePath))) {
    Logger.error(`Global GEMINI.md template not found in bundle at ${templatePath}`);
    return;
  }

  const bundledSha = await calculateFileSha256(templatePath);
  const exists = await fs.pathExists(globalPath);

  if (exists) {
    const diskSha = await calculateFileSha256(globalPath);
    if (diskSha === bundledSha) {
      Logger.success(`Global GEMINI.md at ${globalPath} is already identical to bundled version.`);
      return;
    }

    let shouldInstall = false;
    let createBackup = false;

    if (options.force) {
      shouldInstall = true;
      createBackup = true;
    } else if (process.stdin.isTTY) {
      const action = await select({
        message: `Existing GEMINI.md detected at "${globalPath}". Replace with bundled version?`,
        choices: [
          { name: 'Keep existing GEMINI.md (cancel)', value: 'skip' },
          { name: 'Backup existing file and install bundled version', value: 'backup' },
          { name: 'Overwrite directly', value: 'overwrite' }
        ]
      });

      if (action === 'backup') {
        shouldInstall = true;
        createBackup = true;
      } else if (action === 'overwrite') {
        shouldInstall = true;
      }
    } else {
      Logger.error(`Existing GEMINI.md found at ${globalPath}. Refusing to overwrite without explicit confirmation or --force.`);
      return;
    }

    if (!shouldInstall) {
      Logger.info('Global GEMINI.md installation cancelled by user.');
      return;
    }

    const { backupPath } = await FileInstaller.installFile(templatePath, globalPath, createBackup);
    if (backupPath) {
      Logger.info(`Backup created at: ${backupPath}`);
    }
  } else {
    await FileInstaller.installFile(templatePath, globalPath, false);
  }

  Logger.success(`Global GEMINI.md successfully installed at ${globalPath}`);
}
