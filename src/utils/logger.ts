import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  static info(message: string): void {
    console.log(chalk.blue('ℹ') + ' ' + message);
  }

  static success(message: string): void {
    console.log(chalk.green('✔') + ' ' + chalk.bold(message));
  }

  static warn(message: string): void {
    console.log(chalk.yellow('⚠') + ' ' + chalk.yellow(message));
  }

  static error(message: string, error?: unknown): void {
    console.error(chalk.red('✖') + ' ' + chalk.red.bold(message));
    if (error instanceof Error) {
      console.error(chalk.dim(error.stack || error.message));
    }
  }

  static header(title: string): void {
    console.log('\n' + chalk.cyan.bold('=== ' + title + ' ==='));
  }

  static step(step: number, total: number, message: string): void {
    console.log(chalk.cyan(`[${step}/${total}]`) + ' ' + chalk.bold(message));
  }

  static spinner(text: string): Ora {
    return ora({ text, color: 'cyan' });
  }

  static table(headers: string[], rows: string[][]): void {
    const colWidths = headers.map((h, i) => {
      const colItems = [h, ...rows.map(r => r[i] || '')];
      return Math.max(...colItems.map(item => item.length)) + 2;
    });

    const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join('');
    const separatorLine = colWidths.map(w => '-'.repeat(w - 1) + ' ').join('');

    console.log(chalk.bold(headerLine));
    console.log(chalk.dim(separatorLine));

    for (const row of rows) {
      const line = row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join('');
      console.log(line);
    }
  }
}
