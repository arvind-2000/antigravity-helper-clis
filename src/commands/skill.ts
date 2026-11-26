import path from 'node:path';
import fs from 'fs-extra';
import { confirm, input, select } from '@inquirer/prompts';
import { TemplateManager, KNOWN_SKILLS } from '../core/template-manager.js';
import { ManifestManager } from '../core/manifest-manager.js';
import { ConflictResolver } from '../core/conflict-resolver.js';
import { FileInstaller } from '../core/file-installer.js';
import { UiUxRunner } from '../core/uiux-runner.js';
import { Logger } from '../utils/logger.js';
import chalk from 'chalk';
import { ManifestFileEntry } from '../types/index.js';

export async function skillAddCommand(skillNames: string[], options: { force?: boolean } = {}): Promise<void> {
  const projectRoot = path.resolve(process.cwd());
  const templateManager = new TemplateManager();
  const manifestManager = new ManifestManager(projectRoot);
  const existingManifest = await manifestManager.load();

  if (skillNames.length === 0) {
    Logger.warn('No skill names specified. Usage: `flutter-agent skill add <skill-name>`');
    console.log('Available skills:');
    KNOWN_SKILLS.forEach(s => console.log(`  • ${s.name} - ${s.description}`));
    return;
  }

  const allBundledSkills = await templateManager.getBundledSkills();
  const expandedSkillNames = new Set(skillNames);
  if (expandedSkillNames.has('antislop')) {
    allBundledSkills
      .filter(s => s.name === 'antislop' || s.name.startsWith('antislop-'))
      .forEach(s => expandedSkillNames.add(s.name));
  }

  const validSkills = allBundledSkills.filter(s => expandedSkillNames.has(s.name));

  if (validSkills.length === 0) {
    Logger.error(`None of the specified skills were found in bundled templates: ${skillNames.join(', ')}`);
    return;
  }

  Logger.header(`Adding ${validSkills.length} skill(s) to project: ${validSkills.map(s => s.name).join(', ')}`);

  const filesToInstall: Array<{ relativePath: string; fullPath: string }> = [];
  let hasUiUx = false;

  for (const skill of validSkills) {
    if (skill.name === 'ui-ux-pro-max') {
      hasUiUx = true;
    }

    const files = await templateManager.collectTemplateFiles(path.join('.agents', 'skills', skill.name));
    filesToInstall.push(...files);
  }

  if (expandedSkillNames.has('antislop')) {
    const antislopRule = path.join(templateManager.getAgentsTemplatesRoot(), 'rules', 'antislop.md');
    if (await fs.pathExists(antislopRule)) {
      filesToInstall.push({
        relativePath: '.agents/rules/antislop.md',
        fullPath: antislopRule
      });
    }
  }

  const newManifestEntries: Record<string, ManifestFileEntry> = {};
  let installedCount = 0;
  let skippedCount = 0;

  for (const file of filesToInstall) {
    const diff = await ConflictResolver.evaluateFile(
      projectRoot,
      file.relativePath,
      file.fullPath,
      existingManifest
    );

    let shouldInstall = true;
    let createBackup = false;

    if (diff.status === 'USER_MODIFIED') {
      if (options.force) {
        shouldInstall = true;
        createBackup = true;
      } else if (process.stdin.isTTY) {
        const action = await select({
          message: `Customization detected in "${diff.relativePath}". What would you like to do?`,
          choices: [
            { name: 'Keep existing customized file (skip)', value: 'skip' },
            { name: 'Backup and overwrite with bundled template', value: 'backup' },
            { name: 'Overwrite directly', value: 'overwrite' }
          ]
        });

        if (action === 'skip') {
          shouldInstall = false;
          skippedCount++;
        } else if (action === 'backup') {
          createBackup = true;
        }
      } else {
        Logger.warn(`Skipping user-customized file: ${diff.relativePath}`);
        shouldInstall = false;
        skippedCount++;
      }
    }

    if (shouldInstall) {
      const result = await FileInstaller.installTemplate(
        projectRoot,
        file.relativePath,
        file.fullPath,
        createBackup
      );
      newManifestEntries[diff.relativePath] = result.entry;
      installedCount++;
    }
  }

  await manifestManager.createOrUpdate(projectRoot, newManifestEntries);
  Logger.success(`Skill installation finished: ${installedCount} files installed, ${skippedCount} skipped.`);

  // Self-init if ui-ux-pro-max was added
  if (hasUiUx && process.stdin.isTTY) {
    const runSelfInit = await confirm({
      message: 'Would you like UI/UX Pro Max to self-initialize the design system contract now?',
      default: true
    });

    if (runSelfInit) {
      const projectName = path.basename(projectRoot);
      const keywords = await input({
        message: 'Enter app domain/keywords for UI/UX reasoning:',
        default: `${projectName} modern clean mobile app`
      });

      await UiUxRunner.initialize({
        projectRoot,
        projectName,
        query: keywords.trim(),
        force: options.force
      });
    }
  }
}

export async function skillListCommand(): Promise<void> {
  const projectRoot = path.resolve(process.cwd());
  const templateManager = new TemplateManager();
  const allBundledSkills = await templateManager.getBundledSkills();

  Logger.header(`Skills Status for: ${projectRoot}`);

  const rows = await Promise.all(
    allBundledSkills.map(async s => {
      const diskSkillPath = path.join(projectRoot, '.agents', 'skills', s.name);
      const isInstalled = await fs.pathExists(diskSkillPath);
      const statusStr = isInstalled ? chalk.green('Installed') : chalk.dim('Not installed');
      return [s.name, s.category, `${s.fileCount} files`, statusStr, s.description];
    })
  );

  Logger.table(['Skill Name', 'Category', 'Files', 'Status', 'Description'], rows);
  console.log(chalk.cyan(`\nTo install any skill, run: flutter-agent skill add <skill-name>\n`));
}
