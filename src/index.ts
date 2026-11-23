import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { updateCommand } from './commands/update.js';
import { doctorCommand } from './commands/doctor.js';
import { listCommand } from './commands/list.js';
import { skillAddCommand, skillListCommand } from './commands/skill.js';
import { globalInstallCommand } from './commands/global.js';
import { Logger } from './utils/logger.js';

const program = new Command();

program
  .name('flutter-agent')
  .description('Production-quality CLI to install, maintain, and audit Antigravity Flutter/Dart engineering configurations, rules, workflows, and skills.')
  .version('1.0.0');

// 1. init [path]
program
  .command('init')
  .description('Initialize a new or existing Flutter project with Antigravity rules, workflows, and skills')
  .argument('[path]', 'Target project directory (defaults to current working directory)')
  .option('-a, --all', 'Install all 18 bundled skills without prompting')
  .option('--firebase', 'Include Firebase engineering skill')
  .option('--no-firebase', 'Exclude Firebase engineering skill')
  .option('--api', 'Include API integration skill')
  .option('--no-api', 'Exclude API integration skill')
  .option('-s, --skills <list>', 'Comma-separated list of skills to install')
  .option('--uiux-init [keywords]', 'Self-initialize UI/UX Pro Max design system with optional keywords')
  .option('-f, --force', 'Overwrite customized files without interactive prompt')
  .option('--no-interactive', 'Disable interactive prompts (safe defaults)')
  .action(async (targetPath, options) => {
    try {
      await initCommand(targetPath, options);
    } catch (err: any) {
      Logger.error(`Initialization failed: ${err.message}`, err);
      process.exit(1);
    }
  });

// 2. update
program
  .command('update')
  .description('Compare installed templates with bundled versions and update cleanly')
  .option('-f, --force', 'Force overwrite user-customized files')
  .option('-d, --dry-run', 'Preview available updates without modifying files')
  .action(async options => {
    try {
      await updateCommand(options);
    } catch (err: any) {
      Logger.error(`Update failed: ${err.message}`, err);
      process.exit(1);
    }
  });

// 3. doctor [path]
program
  .command('doctor')
  .description('Audit system toolchains, Flutter configuration, AGENTS.md links, rules, and skill integrity')
  .argument('[path]', 'Target project directory (defaults to current working directory)')
  .action(async targetPath => {
    try {
      const success = await doctorCommand(targetPath);
      if (!success) {
        process.exit(1);
      }
    } catch (err: any) {
      Logger.error(`Doctor failed: ${err.message}`, err);
      process.exit(1);
    }
  });

// 4. list
program
  .command('list')
  .description('List all bundled Antigravity rules, workflows, and skills')
  .action(async () => {
    try {
      await listCommand();
    } catch (err: any) {
      Logger.error(`List failed: ${err.message}`, err);
      process.exit(1);
    }
  });

// 5. skill
const skillGroup = program
  .command('skill')
  .description('Manage individual skills within the current project');

skillGroup
  .command('add')
  .description('Add one or more specific skills into the project')
  .argument('<skills...>', 'Names of skills to add')
  .option('-f, --force', 'Force overwrite existing files')
  .action(async (skills, options) => {
    try {
      await skillAddCommand(skills, options);
    } catch (err: any) {
      Logger.error(`Skill installation failed: ${err.message}`, err);
      process.exit(1);
    }
  });

skillGroup
  .command('list')
  .description('Show status of all bundled skills in current project')
  .action(async () => {
    try {
      await skillListCommand();
    } catch (err: any) {
      Logger.error(`Skill list failed: ${err.message}`, err);
      process.exit(1);
    }
  });

// 6. global
const globalGroup = program
  .command('global')
  .description('Manage global user configurations');

globalGroup
  .command('install')
  .description('Install global Antigravity Flutter engineering GEMINI.md instructions into user profile')
  .option('-f, --force', 'Force overwrite existing GEMINI.md without prompt')
  .action(async options => {
    try {
      await globalInstallCommand(options);
    } catch (err: any) {
      Logger.error(`Global install failed: ${err.message}`, err);
      process.exit(1);
    }
  });

export { program };

// If executed directly
export async function runCli(): Promise<void> {
  await program.parseAsync(process.argv);
}
