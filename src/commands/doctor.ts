import path from 'node:path';
import chalk from 'chalk';
import { DoctorValidator } from '../core/doctor-validator.js';
import { Logger } from '../utils/logger.js';

export async function doctorCommand(targetPath?: string): Promise<boolean> {
  const projectRoot = path.resolve(targetPath || process.cwd());
  Logger.header(`Running Flutter Agent Kit Doctor in: ${projectRoot}`);

  const spinner = Logger.spinner('Auditing system runtime, Flutter project, rules, and skills...');
  spinner.start();

  const result = await DoctorValidator.runDiagnostics(projectRoot);
  spinner.stop();

  // Group checks by category
  const categories = Array.from(new Set(result.checks.map(c => c.category)));

  for (const category of categories) {
    console.log('\n' + chalk.bold.underline(category));
    const items = result.checks.filter(c => c.category === category);
    for (const item of items) {
      let icon = chalk.green('✔');
      if (item.status === 'warn') icon = chalk.yellow('⚠');
      if (item.status === 'fail') icon = chalk.red('✖');

      console.log(`  ${icon} ${chalk.bold(item.name)}: ${item.message}`);
      if (item.details) {
        console.log(`    ${chalk.dim(item.details)}`);
      }
    }
  }

  console.log('');
  if (result.hasErrors) {
    Logger.error('Doctor identified critical configuration or link errors.');
    console.log('Run `flutter-agent init` to repair missing templates or review the broken references above.\n');
    return false;
  } else if (result.hasWarnings) {
    Logger.warn('Doctor passed with non-critical warnings.');
    return true;
  } else {
    Logger.success('All checks passed! Project is fully configured for Antigravity Flutter agent engineering.\n');
    return true;
  }
}
