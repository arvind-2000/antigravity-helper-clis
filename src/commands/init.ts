import path from 'node:path';
import fs from 'fs-extra';
import { confirm, checkbox, input, select } from '@inquirer/prompts';
import { TemplateManager, KNOWN_SKILLS } from '../core/template-manager.js';
import { ProjectDetector } from '../core/project-detector.js';
import { ManifestManager } from '../core/manifest-manager.js';
import { ConflictResolver } from '../core/conflict-resolver.js';
import { FileInstaller } from '../core/file-installer.js';
import { UiUxRunner } from '../core/uiux-runner.js';
import { Logger } from '../utils/logger.js';
import { InitOptions, ManifestFileEntry } from '../types/index.js';
import { toCanonicalPath } from '../utils/paths.js';

export async function initCommand(targetPath?: string, options: InitOptions = {}): Promise<void> {
  const projectRoot = path.resolve(targetPath || process.cwd());
  Logger.header(`Initializing Flutter Agent Kit in: ${projectRoot}`);

  // 1. Detect project
  const projectInfo = await ProjectDetector.detect(projectRoot);
  if (!projectInfo.isFlutterProject) {
    Logger.warn(`Warning: Directory does not appear to be a standard Flutter project (pubspec.yaml missing).`);
    const proceed = options.force || (process.stdin.isTTY && !options.all ? await confirm({
      message: 'Do you want to initialize Antigravity configuration here anyway?',
      default: false
    }) : options.force);

    if (!proceed) {
      Logger.info('Initialization aborted.');
      return;
    }
  } else {
    Logger.success(`Detected Flutter project: ${projectInfo.name || 'unnamed'}`);
  }

  const templateManager = new TemplateManager();
  const manifestManager = new ManifestManager(projectRoot);
  const existingManifest = await manifestManager.load();

  // 2. Determine skills to install
  const selectedSkills = new Set<string>();

  // Always include core skills
  KNOWN_SKILLS.filter(s => s.category === 'core').forEach(s => selectedSkills.add(s.name));

  const isInteractive = Boolean(process.stdin.isTTY && !options.all && !options.skills && options.interactive !== false);

  if (options.all) {
    KNOWN_SKILLS.forEach(s => selectedSkills.add(s.name));
  } else if (options.skills) {
    const list = options.skills.split(',').map(s => s.trim().toLowerCase());
    list.forEach(name => selectedSkills.add(name));
  } else if (isInteractive) {
    // Interactive prompt for Firebase
    const defaultFirebase = projectInfo.usesFirebase ?? false;
    const wantFirebase = options.firebase !== undefined
      ? options.firebase
      : await confirm({
          message: 'Does this project use Firebase (Auth, Firestore, Cloud Functions)?',
          default: defaultFirebase
        });

    if (wantFirebase) {
      selectedSkills.add('firebase-engineering');
    }

    // Interactive prompt for API
    const defaultHttp = projectInfo.usesHttp ?? false;
    const wantApi = options.api !== undefined
      ? options.api
      : await confirm({
          message: 'Does this project connect to REST / HTTP APIs?',
          default: defaultHttp
        });

    if (wantApi) {
      selectedSkills.add('api-integration');
    }

    // Interactive checkbox for design & specialized skills
    const designSkills = KNOWN_SKILLS.filter(s => s.category === 'design');
    const chosen = await checkbox({
      message: 'Select additional design, presentation & specialized skills to install:',
      choices: designSkills.map(s => ({
        name: `${s.name.padEnd(20)} - ${s.description}`,
        value: s.name,
        checked: s.defaultSelected
      }))
    });

    chosen.forEach(name => selectedSkills.add(name));
  } else {
    // Non-interactive fallback: respect CLI flags or defaults
    if (options.firebase || projectInfo.usesFirebase) {
      selectedSkills.add('firebase-engineering');
    }
    if (options.api || projectInfo.usesHttp) {
      selectedSkills.add('api-integration');
    }
    // Include default selected design skills (e.g. ui-ux-pro-max)
    KNOWN_SKILLS.filter(s => s.defaultSelected).forEach(s => selectedSkills.add(s.name));
  }

  Logger.info(`Installing core configuration + ${selectedSkills.size} skills...`);

  // 3. Collect template files to install
  const filesToInstall: Array<{ relativePath: string; templatePath: string }> = [];

  // Project core files: AGENTS.md
  filesToInstall.push({
    relativePath: 'AGENTS.md',
    templatePath: templateManager.getProjectAgentsTemplatePath()
  });

  // Rules
  const rules = await templateManager.getBundledRules();
  for (const rule of rules) {
    filesToInstall.push({
      relativePath: toCanonicalPath(path.join('.agents', 'rules', rule.name)),
      templatePath: rule.path
    });
  }

  // Workflows
  const workflows = await templateManager.getBundledWorkflows();
  for (const wf of workflows) {
    filesToInstall.push({
      relativePath: toCanonicalPath(path.join('.agents', 'workflows', wf.name)),
      templatePath: wf.path
    });
  }

  // Selected Skills
  const allBundledSkills = await templateManager.getBundledSkills();
  for (const skill of allBundledSkills) {
    if (selectedSkills.has(skill.name)) {
      const skillFiles = await templateManager.collectTemplateFiles(path.join('.agents', 'skills', skill.name));
      for (const file of skillFiles) {
        filesToInstall.push({
          relativePath: file.relativePath,
          templatePath: file.fullPath
        });
      }
    }
  }

  // 4. Install files with conflict resolution
  const newManifestEntries: Record<string, ManifestFileEntry> = {};
  let installedCount = 0;
  let skippedCount = 0;
  let backedUpCount = 0;

  for (const item of filesToInstall) {
    const diff = await ConflictResolver.evaluateFile(
      projectRoot,
      item.relativePath,
      item.templatePath,
      existingManifest
    );

    if (diff.status === 'IDENTICAL') {
      // Keep existing manifest entry or record current
      newManifestEntries[diff.relativePath] = {
        bundledSha256: diff.bundledSha,
        installedSha256: diff.bundledSha,
        lastUpdated: existingManifest?.files[diff.relativePath]?.lastUpdated || new Date().toISOString()
      };
      continue;
    }

    let shouldInstall = true;
    let createBackup = false;

    if (diff.status === 'USER_MODIFIED') {
      if (options.force) {
        shouldInstall = true;
        createBackup = true;
      } else if (isInteractive) {
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
          // Retain user's current hash in manifest so it remains tracked
          newManifestEntries[diff.relativePath] = {
            bundledSha256: diff.bundledSha,
            installedSha256: diff.diskSha || diff.bundledSha,
            lastUpdated: existingManifest?.files[diff.relativePath]?.lastUpdated || new Date().toISOString()
          };
        } else if (action === 'backup') {
          createBackup = true;
        }
      } else {
        // Safe non-interactive default: do not overwrite customized files without --force
        Logger.warn(`Skipping user-customized file: ${diff.relativePath}`);
        shouldInstall = false;
        skippedCount++;
        newManifestEntries[diff.relativePath] = {
          bundledSha256: diff.bundledSha,
          installedSha256: diff.diskSha || diff.bundledSha,
          lastUpdated: existingManifest?.files[diff.relativePath]?.lastUpdated || new Date().toISOString()
        };
      }
    }

    if (shouldInstall) {
      const result = await FileInstaller.installTemplate(
        projectRoot,
        item.relativePath,
        item.templatePath,
        createBackup
      );
      newManifestEntries[diff.relativePath] = result.entry;
      installedCount++;
      if (result.backupPath) {
        backedUpCount++;
        Logger.info(`Created backup: ${path.basename(result.backupPath)}`);
      }
    }
  }

  // 5. Save manifest
  await manifestManager.createOrUpdate(projectRoot, newManifestEntries);
  Logger.success(`Configuration installed: ${installedCount} files written, ${skippedCount} skipped, ${backedUpCount} backed up.`);

  // 6. UI/UX Pro Max Self-Initialization
  if (selectedSkills.has('ui-ux-pro-max')) {
    let shouldRunUiUx = false;
    let userQuery = typeof options.uiuxInit === 'string' ? options.uiuxInit : undefined;

    if (options.uiuxInit) {
      shouldRunUiUx = true;
    } else if (isInteractive) {
      shouldRunUiUx = await confirm({
        message: 'Would you like UI/UX Pro Max to self-initialize the Flutter design system contract now?',
        default: true
      });

      if (shouldRunUiUx) {
        const defaultApp = projectInfo.name || path.basename(projectRoot);
        const entered = await input({
          message: 'Enter app domain/keywords for UI/UX reasoning:',
          default: `${defaultApp} modern clean mobile app`
        });
        if (entered.trim()) {
          userQuery = entered.trim();
        }
      }
    }

    if (shouldRunUiUx) {
      const appName = projectInfo.name || path.basename(projectRoot);
      await UiUxRunner.initialize({
        projectRoot,
        projectName: appName,
        query: userQuery,
        force: options.force
      });
    }
  }

  Logger.header('Next Steps');
  console.log(`1. Review ${path.join(projectRoot, 'AGENTS.md')}`);
  console.log(`2. Run 'flutter-agent doctor' to verify all toolchains and skill metadata.`);
  console.log(`3. Start developing Flutter features following .agents/workflows/create-feature.md\n`);
}
