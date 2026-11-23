export type SkillCategory = 'core' | 'backend' | 'design';

export interface SkillDefinition {
  name: string;
  category: SkillCategory;
  description: string;
  defaultSelected: boolean;
  requiredForCore?: boolean;
}

export interface ManifestFileEntry {
  bundledSha256: string;
  installedSha256: string;
  lastUpdated: string;
}

export interface Manifest {
  cliVersion: string;
  installedAt: string;
  projectRoot: string;
  files: Record<string, ManifestFileEntry>;
}

export interface InitOptions {
  all?: boolean;
  firebase?: boolean;
  api?: boolean;
  skills?: string;
  uiuxInit?: string | boolean;
  interactive?: boolean;
  force?: boolean;
}

export interface UpdateOptions {
  force?: boolean;
  dryRun?: boolean;
}

export type FileDiffStatus = 
  | 'IDENTICAL'        // Disk matches bundle exactly
  | 'CLEAN_UPDATE'     // Disk matches old manifest hash, bundle is newer -> safe auto-update
  | 'USER_MODIFIED'    // Disk differs from manifest hash -> user customized it
  | 'MISSING_ON_DISK'  // File recorded in manifest or bundle is missing on disk
  | 'NEW_TEMPLATE';    // New template bundled that wasn't in target

export interface FileDiffResult {
  relativePath: string;
  status: FileDiffStatus;
  diskSha?: string;
  bundledSha: string;
  manifestSha?: string;
  diskPath: string;
  templatePath: string;
}

export interface DiagnosticCheck {
  category: 'Runtime' | 'Project' | 'Agents' | 'Rules' | 'Workflows' | 'Skills' | 'Manifest';
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: string;
}

export interface DoctorResult {
  checks: DiagnosticCheck[];
  hasErrors: boolean;
  hasWarnings: boolean;
}
