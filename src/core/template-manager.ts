import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { toCanonicalPath } from '../utils/paths.js';
import { calculateFileSha256 } from '../utils/checksum.js';
import { SkillDefinition } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const KNOWN_SKILLS: SkillDefinition[] = [
  // 1. Core Flutter Skills (9)
  {
    name: 'flutter-testing',
    category: 'core',
    description: 'Unit, widget, golden, and integration test architectures',
    defaultSelected: true,
    requiredForCore: true
  },
  {
    name: 'flutter-debugging',
    category: 'core',
    description: 'DevTools, inspector, memory leak diagnostics, and error tracing',
    defaultSelected: true,
    requiredForCore: true
  },
  {
    name: 'flutter-responsive-ui',
    category: 'core',
    description: 'Responsive layouts, breakpoints, mobile, tablet, and desktop adaptation',
    defaultSelected: true,
    requiredForCore: true
  },
  {
    name: 'create-feature',
    category: 'core',
    description: 'Structured 5-step feature implementation lifecycle & scaffolding',
    defaultSelected: true,
    requiredForCore: true
  },
  {
    name: 'flutter-performance',
    category: 'core',
    description: 'Widget rebuild minimization, list view optimization, and isolate management',
    defaultSelected: true,
    requiredForCore: true
  },
  {
    name: 'flutter-accessibility',
    category: 'core',
    description: 'WCAG compliance, Semantics widget, contrast guidelines, screen reader testing',
    defaultSelected: true,
    requiredForCore: true
  },
  {
    name: 'dart-model-generation',
    category: 'core',
    description: 'Typed models, JSON serialization, and immutability standards',
    defaultSelected: true,
    requiredForCore: true
  },
  {
    name: 'flutter-release-engineering',
    category: 'core',
    description: 'Keystores, flavors, CI/CD, obfuscation, and deployment readiness',
    defaultSelected: true,
    requiredForCore: true
  },
  {
    name: 'git-code-review',
    category: 'core',
    description: 'PR conventions, code review checklists, and architecture compliance audits',
    defaultSelected: true,
    requiredForCore: true
  },

  // 2. Backend & Network Skills (2)
  {
    name: 'firebase-engineering',
    category: 'backend',
    description: 'Firebase Auth, Firestore rules, security best practices, and Cloud Functions',
    defaultSelected: false
  },
  {
    name: 'api-integration',
    category: 'backend',
    description: 'REST/HTTP client architecture, auth token refresh, and network error handling',
    defaultSelected: false
  },

  // 3. Design & Presentation Skills (7)
  {
    name: 'ui-ux-pro-max',
    category: 'design',
    description: 'UI/UX design intelligence, design systems, and multi-stack catalogs (self-initializing)',
    defaultSelected: true
  },
  {
    name: 'design-system',
    category: 'design',
    description: 'Token architecture, typography scale, component libraries, and documentation',
    defaultSelected: false
  },
  {
    name: 'design',
    category: 'design',
    description: 'Visual design foundations, color systems, micro-interactions, and layout templates',
    defaultSelected: false
  },
  {
    name: 'ui-styling',
    category: 'design',
    description: 'ThemeExtensions, ColorScheme tailoring, and typography styling',
    defaultSelected: false
  },
  {
    name: 'brand',
    category: 'design',
    description: 'Brand voice, visual identity checklists, and guidelines',
    defaultSelected: false
  },
  {
    name: 'banner-design',
    category: 'design',
    description: 'Hero banners, store assets, aspect ratios, and visual styling',
    defaultSelected: false
  },
  {
    name: 'slides',
    category: 'design',
    description: 'Presentation slide decks, themes, and layout templates',
    defaultSelected: false
  }
];

export class TemplateManager {
  private templatesRoot: string;

  constructor(customTemplatesRoot?: string) {
    if (customTemplatesRoot) {
      this.templatesRoot = customTemplatesRoot;
    } else {
      // Look for templates directory relative to package root
      // In src/: ../../templates or in dist/src/core/: ../../../templates
      const candidates = [
        path.resolve(__dirname, '../../templates'),
        path.resolve(__dirname, '../../../templates'),
        path.resolve(__dirname, '../templates'),
        path.resolve(process.cwd(), 'templates')
      ];

      const found = candidates.find(c => fs.existsSync(c));
      this.templatesRoot = found || candidates[0];
    }
  }

  getTemplatesRoot(): string {
    return this.templatesRoot;
  }

  getGlobalGeminiTemplatePath(): string {
    return path.join(this.templatesRoot, 'global', 'GEMINI.md');
  }

  getProjectAgentsTemplatePath(): string {
    return path.join(this.templatesRoot, 'project', 'AGENTS.md');
  }

  getAgentsTemplatesRoot(): string {
    return path.join(this.templatesRoot, '.agents');
  }

  /**
   * Recursively collects all files in a directory with relative paths and SHA-256 hashes.
   */
  async collectTemplateFiles(subDir?: string): Promise<Array<{ relativePath: string; fullPath: string; sha256: string }>> {
    const root = subDir ? path.join(this.templatesRoot, subDir) : this.templatesRoot;
    if (!(await fs.pathExists(root))) {
      return [];
    }

    const results: Array<{ relativePath: string; fullPath: string; sha256: string }> = [];

    const scan = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await scan(full);
        } else if (entry.isFile()) {
          const rel = toCanonicalPath(path.relative(this.templatesRoot, full));
          const sha = await calculateFileSha256(full);
          results.push({ relativePath: rel, fullPath: full, sha256: sha });
        }
      }
    };

    await scan(root);
    return results;
  }

  /**
   * Returns metadata for all bundled rules.
   */
  async getBundledRules(): Promise<Array<{ name: string; path: string; fileCount: number }>> {
    const rulesDir = path.join(this.getAgentsTemplatesRoot(), 'rules');
    if (!(await fs.pathExists(rulesDir))) return [];

    const files = await fs.readdir(rulesDir);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        name: f,
        path: path.join(rulesDir, f),
        fileCount: 1
      }));
  }

  /**
   * Returns metadata for all bundled workflows.
   */
  async getBundledWorkflows(): Promise<Array<{ name: string; path: string; fileCount: number }>> {
    const workflowsDir = path.join(this.getAgentsTemplatesRoot(), 'workflows');
    if (!(await fs.pathExists(workflowsDir))) return [];

    const files = await fs.readdir(workflowsDir);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        name: f,
        path: path.join(workflowsDir, f),
        fileCount: 1
      }));
  }

  /**
   * Returns metadata for all bundled skills.
   */
  async getBundledSkills(): Promise<Array<SkillDefinition & { fileCount: number; path: string }>> {
    const skillsDir = path.join(this.getAgentsTemplatesRoot(), 'skills');
    if (!(await fs.pathExists(skillsDir))) return [];

    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    const result: Array<SkillDefinition & { fileCount: number; path: string }> = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(skillsDir, entry.name);
        const allFiles = await this.countFilesInDir(skillPath);
        const known = KNOWN_SKILLS.find(s => s.name === entry.name) || {
          name: entry.name,
          category: 'core' as const,
          description: 'Antigravity workspace skill',
          defaultSelected: false
        };

        result.push({
          ...known,
          fileCount: allFiles,
          path: skillPath
        });
      }
    }

    return result;
  }

  private async countFilesInDir(dir: string): Promise<number> {
    let count = 0;
    const scan = async (d: string) => {
      const items = await fs.readdir(d, { withFileTypes: true });
      for (const item of items) {
        const full = path.join(d, item.name);
        if (item.isDirectory()) {
          await scan(full);
        } else if (item.isFile()) {
          count++;
        }
      }
    };
    await scan(dir);
    return count;
  }
}
