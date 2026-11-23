import path from 'node:path';
import { select } from '@inquirer/prompts';
import { TemplateManager } from '../core/template-manager.js';
import { ManifestManager } from '../core/manifest-manager.js';
import { ConflictResolver } from '../core/conflict-resolver.js';
import { FileInstaller } from '../core/file-installer.js';
import { Logger } from '../utils/logger.js';
import { UpdateOptions, ManifestFileEntry } from '../types/index.js';

export async function updateCommand(options: UpdateOptions = {}): Promise<void> {
  const projectRoot = path.resolve(process.cwd());
  Logger.header(`Checking for Antigravity Template Updates in: ${projectRoot}`);

  const manifestManager = new ManifestManager(projectRoot);
  const manifest = await manifestManager.load();

  if (!manifest) {
    Logger.error('No .manifest.json found in this project. Please run `flutter-agent init` first to initialize.');
    return;
  }

  const templateManager = new TemplateManager();
  const trackedFiles = Object.keys(manifest.files);

  if (trackedFiles.length === 0) {
    Logger.info('No files currently tracked in manifest.');
    return;
  }

  Logger.info(`Comparing ${trackedFiles.length} installed files with bundled templates...`);

  const updatesToApply: Array<{
    relativePath: string;
    templatePath: string;
    isCustomized: boolean;
  }> = [];

  for (const relPath of trackedFiles) {
    let templatePath: string;
    if (relPath === 'AGENTS.md') {
      templatePath = templateManager.getProjectAgentsTemplatePath();
    } else {
      templatePath = path.join(templateManager.getTemplatesRoot(), relPath);
    }

    const diff = await ConflictResolver.evaluateFile(
      projectRoot,
      relPath,
      templatePath,
      manifest
    );

    if (diff.status === 'CLEAN_UPDATE') {
      updatesToApply.push({
        relativePath: relPath,
        templatePath,
        isCustomized: false
      });
    } else if (diff.status === 'USER_MODIFIED') {
      // Check if bundle differs from disk
      if (diff.bundledSha !== diff.diskSha) {
        updatesToApply.push({
          relativePath: relPath,
          templatePath,
          isCustomized: true
        });
      }
    } else if (diff.status === 'MISSING_ON_DISK') {
      updatesToApply.push({
        relativePath: relPath,
        templatePath,
        isCustomized: false
      });
    }
  }

  if (updatesToApply.length === 0) {
    Logger.success('All templates are up to date! No updates required.');
    return;
  }

  Logger.info(`Found ${updatesToApply.length} files with available updates.`);

  if (options.dryRun) {
    Logger.header('Dry-Run Summary');
    for (const item of updatesToApply) {
      console.log(`- ${item.relativePath} [${item.isCustomized ? 'USER CUSTOMIZED' : 'CLEAN UPDATE'}]`);
    }
    return;
  }

  let updatedCount = 0;
  let skippedCount = 0;
  let backedUpCount = 0;
  const updatedManifestEntries: Record<string, ManifestFileEntry> = {};

  for (const item of updatesToApply) {
    let shouldInstall = true;
    let createBackup = false;

    if (item.isCustomized) {
      if (options.force) {
        shouldInstall = true;
        createBackup = true;
      } else if (process.stdin.isTTY) {
        const action = await select({
          message: `Customization detected in "${item.relativePath}". How would you like to proceed?`,
          choices: [
            { name: 'Keep current customized file (skip)', value: 'skip' },
            { name: 'Backup existing and apply template update', value: 'backup' },
            { name: 'Overwrite directly with template update', value: 'overwrite' }
          ]
        });

        if (action === 'skip') {
          shouldInstall = false;
          skippedCount++;
        } else if (action === 'backup') {
          createBackup = true;
        }
      } else {
        Logger.warn(`Preserving user-customized file (skip): ${item.relativePath}`);
        shouldInstall = false;
        skippedCount++;
      }
    }

    if (shouldInstall) {
      const result = await FileInstaller.installTemplate(
        projectRoot,
        item.relativePath,
        item.templatePath,
        createBackup
      );
      updatedManifestEntries[item.relativePath] = result.entry;
      updatedCount++;
      if (result.backupPath) {
        backedUpCount++;
        Logger.info(`Created backup: ${path.basename(result.backupPath)}`);
      }
    }
  }

  await manifestManager.createOrUpdate(projectRoot, updatedManifestEntries);
  Logger.success(`Update complete: ${updatedCount} updated, ${skippedCount} skipped, ${backedUpCount} backed up.`);
}
