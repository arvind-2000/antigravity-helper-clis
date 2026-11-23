import path from 'node:path';
import fs from 'fs-extra';

export interface FlutterProjectInfo {
  isFlutterProject: boolean;
  projectRoot: string;
  name?: string;
  description?: string;
  usesFirebase?: boolean;
  usesHttp?: boolean;
  hasAgentsDir: boolean;
  hasAgentsMd: boolean;
  hasManifest: boolean;
  missingRequirements: string[];
}

export class ProjectDetector {
  /**
   * Inspects a directory to determine if it is a Flutter project.
   */
  static async detect(targetDir: string): Promise<FlutterProjectInfo> {
    const resolvedRoot = path.resolve(targetDir);
    const pubspecPath = path.join(resolvedRoot, 'pubspec.yaml');
    const libPath = path.join(resolvedRoot, 'lib');
    const agentsDirPath = path.join(resolvedRoot, '.agents');
    const agentsMdPath = path.join(resolvedRoot, 'AGENTS.md');
    const manifestPath = path.join(agentsDirPath, '.manifest.json');

    const missingRequirements: string[] = [];
    const hasPubspec = await fs.pathExists(pubspecPath);
    if (!hasPubspec) {
      missingRequirements.push('pubspec.yaml not found in directory');
    }

    const hasLib = await fs.pathExists(libPath);
    if (!hasLib) {
      missingRequirements.push('lib/ directory not found in directory');
    }

    let name: string | undefined;
    let description: string | undefined;
    let usesFirebase = false;
    let usesHttp = false;

    if (hasPubspec) {
      try {
        const content = await fs.readFile(pubspecPath, 'utf8');
        const nameMatch = content.match(/^name:\s*([a-zA-Z0-9_-]+)/m);
        if (nameMatch) {
          name = nameMatch[1].trim();
        }
        const descMatch = content.match(/^description:\s*(.+)$/m);
        if (descMatch) {
          description = descMatch[1].trim();
        }

        // Check for common firebase / api dependencies
        if (
          content.includes('firebase_core') ||
          content.includes('cloud_firestore') ||
          content.includes('firebase_auth')
        ) {
          usesFirebase = true;
        }

        if (
          content.includes('http:') ||
          content.includes('dio:') ||
          content.includes('retrofit:')
        ) {
          usesHttp = true;
        }
      } catch {
        // failed reading pubspec
      }
    }

    const hasAgentsDir = await fs.pathExists(agentsDirPath);
    const hasAgentsMd = await fs.pathExists(agentsMdPath);
    const hasManifest = await fs.pathExists(manifestPath);

    return {
      isFlutterProject: hasPubspec,
      projectRoot: resolvedRoot,
      name,
      description,
      usesFirebase,
      usesHttp,
      hasAgentsDir,
      hasAgentsMd,
      hasManifest,
      missingRequirements
    };
  }
}
