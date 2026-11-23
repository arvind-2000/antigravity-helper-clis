import { TemplateManager } from '../core/template-manager.js';
import { Logger } from '../utils/logger.js';
import chalk from 'chalk';

export async function listCommand(): Promise<void> {
  const templateManager = new TemplateManager();

  Logger.header('Bundled Antigravity Engineering Templates');

  // Rules
  const rules = await templateManager.getBundledRules();
  console.log('\n' + chalk.cyan.bold('Rules (.agents/rules/):'));
  for (const rule of rules) {
    console.log(`  • ${chalk.bold(rule.name)} (${rule.fileCount} file)`);
  }

  // Workflows
  const workflows = await templateManager.getBundledWorkflows();
  console.log('\n' + chalk.cyan.bold('Workflows (.agents/workflows/):'));
  for (const wf of workflows) {
    console.log(`  • ${chalk.bold(wf.name)} (${wf.fileCount} file)`);
  }

  // Skills
  const skills = await templateManager.getBundledSkills();
  console.log('\n' + chalk.cyan.bold('Skills (.agents/skills/):'));

  const coreSkills = skills.filter(s => s.category === 'core');
  const backendSkills = skills.filter(s => s.category === 'backend');
  const designSkills = skills.filter(s => s.category === 'design');

  console.log(chalk.yellow.bold('\n  [Core Flutter Engineering Skills] (9 skills):'));
  const coreRows = coreSkills.map(s => [s.name, `${s.fileCount} files`, s.description]);
  Logger.table(['Skill Name', 'Files', 'Description'], coreRows);

  console.log(chalk.yellow.bold('\n  [Backend & Network Skills] (2 skills):'));
  const backendRows = backendSkills.map(s => [s.name, `${s.fileCount} files`, s.description]);
  Logger.table(['Skill Name', 'Files', 'Description'], backendRows);

  console.log(chalk.yellow.bold('\n  [Design & Presentation Skills] (7 skills):'));
  const designRows = designSkills.map(s => [s.name, `${s.fileCount} files`, s.description]);
  Logger.table(['Skill Name', 'Files', 'Description'], designRows);

  const totalFiles = skills.reduce((acc, s) => acc + s.fileCount, 0) + rules.length + workflows.length + 2;
  console.log(chalk.dim(`\nTotal: 18 skills, ${rules.length} rules, ${workflows.length} workflows (${totalFiles} template files bundled)\n`));
}
