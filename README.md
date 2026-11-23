# Flutter Agent Kit (`flutter-agent`)

> **Production-grade Node.js CLI to install, maintain, and audit Antigravity Flutter & Dart engineering standards, rules, workflows, and workspace skills across multiple projects.**

[![Node Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/tested%20with-vitest-6E9F18.svg)](https://vitest.dev/)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start: One-Click Installation](#quick-start-one-click-installation)
- [Setup on a New PC](#setup-on-a-new-pc)
- [Command Reference](#command-reference)
  - [`flutter-agent init`](#1-flutter-agent-init-path)
  - [`flutter-agent doctor`](#2-flutter-agent-doctor-path)
  - [`flutter-agent update`](#3-flutter-agent-update)
  - [`flutter-agent list`](#4-flutter-agent-list)
  - [`flutter-agent skill`](#5-flutter-agent-skill-add--list)
  - [`flutter-agent global install`](#6-flutter-agent-global-install)
- [UI/UX Pro Max Self-Initialization](#uiux-pro-max-self-initialization)
- [Three-Way Change Tracking (`.manifest.json`)](#three-way-change-tracking-manifestjson)
- [Complete Catalog of Bundled Templates (189 Files)](#complete-catalog-of-bundled-templates-189-files)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Publishing to npm](#publishing-to-npm)

---

## Overview

When developing multiple Flutter applications with Antigravity, manually copying rules, prompt instructions, workflows, and skills across repositories is repetitive and error-prone. 

**Flutter Agent Kit** packages your canonical Antigravity Flutter/Dart engineering configuration into a reusable, self-contained CLI. The CLI bundles all **18 workspace skills (187 files)**, project architecture rules, feature workflows, and global engineering guidelines—enabling one-command initialization, automated updates, and complete health audits.

---

## Key Features

- **100% Self-Contained**: All 189 templates are bundled within the package. Initialization works offline without accessing external repositories.
- **Interactive Prompts for Backend & APIs**: Intelligently prompts whether to include Firebase (`firebase-engineering`) and REST/HTTP (`api-integration`) based on project needs.
- **Granular Skill Selection**: Multi-select picker to install specific design and presentation skills, or add them on-demand via `flutter-agent skill add`.
- **UI/UX Pro Max Self-Initialization**: Bootstraps and persists the project's design system profile (`design-system/<app>/MASTER.md`) tailored to Flutter using its bundled Python reasoning engine.
- **Three-Way Manifest Engine**: Tracks installed file checksums in `.agents/.manifest.json`. Automatically updates clean template files while safely preserving user-customized modifications.
- **Strict Application Safety**: Never touches application source code (`lib/`, `pubspec.yaml`, etc.). Only manages agent configurations.
- **Windows First**: Fully optimized for Windows paths, PowerShell, and CMD. Includes a native one-click `install.bat`.

---

## Quick Start: One-Click Installation

### Windows One-Click Installer (Recommended)
Double-click **`install.bat`** in the project root, or run it from CMD/PowerShell:

```bat
install.bat
```

The installer will:
1. Verify Node.js 22+ and npm in your system `PATH`.
2. Install npm dependencies (`npm install`).
3. Compile the TypeScript source code (`npm run build`).
4. Register `flutter-agent` globally across Windows (`npm link`).
5. Install global Antigravity rules to `%USERPROFILE%\.gemini\GEMINI.md`.

---

## Setup on a New PC

To transfer and configure Flutter Agent Kit on a new computer:

### Prerequisites
- **Node.js 22+**: Download from [nodejs.org](https://nodejs.org/).
- **Flutter & Dart SDKs**: Added to system `PATH`.
- **Python 3**: For UI/UX Pro Max design system reasoning.

### Method A: Transfer Folder + Run `install.bat`
1. Copy the `antigravity helper clis` folder to the new PC.
2. Double-click `install.bat`.
3. Open any terminal and run `flutter-agent --help`.

### Method B: Portable `.tgz` (Single File Transfer)
1. On your current PC, pack the package:
   ```powershell
   npm run build
   npm pack
   ```
2. Copy the generated `flutter-agent-kit-1.0.0.tgz` to the new PC.
3. On the new PC, install it globally:
   ```powershell
   npm install -g ./flutter-agent-kit-1.0.0.tgz
   flutter-agent global install
   ```

---

## Command Reference

### 1. `flutter-agent init [path]`
Initializes a new or existing Flutter project with Antigravity agent configuration.

```powershell
flutter-agent init [target-directory]
```

#### Interactive Flow (Default in TTY):
1. **Detects Flutter Project**: Verifies `pubspec.yaml` and extracts project metadata.
2. **Installs Core Configuration**: Copies `AGENTS.md`, `.agents/rules/`, `.agents/workflows/`, and 9 core Flutter skills.
3. **Backend Prompt**: `Does this project use Firebase? (Y/n)`
4. **API Prompt**: `Does this project connect to REST / HTTP APIs? (Y/n)`
5. **Skill Selection**: Multi-select menu for design, presentation, and branding skills.
6. **UI/UX Self-Init**: `Would you like UI/UX Pro Max to self-initialize the design system contract now? (Y/n)`
7. **Manifest Generation**: Saves `.agents/.manifest.json`.

#### CLI Flags:
| Flag | Description |
| :--- | :--- |
| `-a, --all` | Install all 18 bundled skills without prompting |
| `--firebase` / `--no-firebase` | Conditionally include/exclude Firebase engineering skill |
| `--api` / `--no-api` | Conditionally include/exclude REST/HTTP API integration skill |
| `-s, --skills <list>` | Comma-separated list of specific skills to install |
| `--uiux-init [keywords]` | Self-initialize UI/UX Pro Max with optional search keywords |
| `-f, --force` | Overwrite customized files without interactive confirmation |
| `--no-interactive` | Disable interactive prompts (uses safe defaults) |

**Examples:**
```powershell
# Interactive init in current directory
flutter-agent init

# Target an existing project
flutter-agent init E:\arvind\projects\readingapp

# Install with Firebase, API, and UI/UX self-init for an e-commerce app
flutter-agent init --firebase --api --uiux-init "ecommerce retail shopping modern"

# Batch install all 18 skills without prompts
flutter-agent init --all
```

---

### 2. `flutter-agent doctor [path]`
Performs a comprehensive diagnostic audit of the project, development toolchains, rules, workflows, links, and skill integrity.

```powershell
flutter-agent doctor [target-directory]
```

#### Diagnostic Checks Performed:
- **Node.js Runtime**: Validates Node.js >= 22.0.0.
- **Flutter SDK**: Validates Flutter CLI installation and version.
- **Dart SDK**: Validates Dart CLI installation and version.
- **Python Environment**: Verifies Python 3 is available for `ui-ux-pro-max`.
- **Project Structure**: Validates `pubspec.yaml` and Flutter SDK dependencies.
- **`AGENTS.md` Link Resolution**: Parses markdown references (e.g. `@[Project Architecture Rules](.agents/rules/project-architecture.md)`) and verifies each file exists on disk.
- **Rules & Workflows**: Audits `.agents/rules/` and `.agents/workflows/` files.
- **Skill Metadata**: Scans all installed `.agents/skills/*/SKILL.md` files for valid YAML frontmatter (`name:`, `description:`).
- **Manifest Integrity**: Verifies disk files match `.agents/.manifest.json` checksums.

---

### 3. `flutter-agent update`
Safely updates installed Antigravity templates when newer versions are bundled with the CLI.

```powershell
flutter-agent update [options]
```

#### Intelligent Update Logic:
- **Clean Files (Untouched)**: If a file has not been modified by the user, it updates automatically.
- **User-Customized Files**: Detected by comparing SHA-256 hashes against the manifest. Prompts the user:
  - `Keep current customized file (skip)`
  - `Backup existing file (.bak.<timestamp>) and apply template update`
  - `Overwrite directly`
- **Dry Run Mode**:
  ```powershell
  flutter-agent update --dry-run
  ```

---

### 4. `flutter-agent list`
Displays a formatted inventory table of all bundled rules, workflows, and skills grouped by category, including file counts and descriptions.

```powershell
flutter-agent list
```

---

### 5. `flutter-agent skill (add | list)`
Manage specific skills inside an existing project on-demand.

#### Add Specific Skills:
```powershell
flutter-agent skill add <skills...>
```
*Example:*
```powershell
flutter-agent skill add firebase-engineering ui-ux-pro-max
```
*(If `ui-ux-pro-max` is added, it will prompt to self-initialize the design system contract).*

#### Check Skill Status:
```powershell
flutter-agent skill list
```
Displays all 18 bundled skills and reports whether each is **Installed** or **Not installed** in the current project.

---

### 6. `flutter-agent global install`
Installs the canonical global Flutter & Dart engineering guidelines into `%USERPROFILE%\.gemini\GEMINI.md`.

```powershell
flutter-agent global install
```

> [!IMPORTANT]
> Collision Safety: If an existing `GEMINI.md` file is detected and differs from the bundled version, the CLI **refuses to overwrite** without user confirmation or `--force`. When confirmed, it creates an automatic timestamped backup (`GEMINI.md.bak.<timestamp>`).

---

## UI/UX Pro Max Self-Initialization

The `ui-ux-pro-max` skill bundles a comprehensive UI/UX intelligence dataset (79 styles, 192 product palettes, 74 font pairings, 119 UX guidelines, and multi-stack rules for Flutter, React, Vue, SwiftUI, etc.).

When initialized via `flutter-agent init` or `flutter-agent skill add ui-ux-pro-max`:
1. It verifies Python 3 is installed.
2. It executes the bundled reasoning engine:
   ```bash
   python .agents/skills/ui-ux-pro-max/scripts/search.py "<keywords>" --stack flutter --design-system --persist -p "<AppName>" --output-dir "."
   ```
3. It generates and persists **`design-system/<app-slug>/MASTER.md`** containing:
   - Design system pattern, style recommendations, and color palettes.
   - Recommended typography and spacing scales.
   - Anti-patterns to avoid.
   - Specific Flutter implementation rules.

---

## Three-Way Change Tracking (`.manifest.json`)

All installations maintain a `.agents/.manifest.json` file:

```json
{
  "cliVersion": "1.0.0",
  "installedAt": "2026-11-23T14:22:15.000Z",
  "projectRoot": "E:/arvind/projects/my_app",
  "files": {
    "AGENTS.md": {
      "bundledSha256": "3cb402b1f81cf...",
      "installedSha256": "3cb402b1f81cf...",
      "lastUpdated": "2026-11-23T14:22:15.000Z"
    },
    ".agents/rules/project-architecture.md": {
      "bundledSha256": "ccae0d3bf4a2...",
      "installedSha256": "ccae0d3bf4a2...",
      "lastUpdated": "2026-11-23T14:22:15.000Z"
    }
  }
}
```

This manifest enables exact three-way diff evaluation:
- `currentDiskSha === manifest.installedSha === bundledSha`: Up-to-date.
- `currentDiskSha === manifest.installedSha !== bundledSha`: Safe for automatic update.
- `currentDiskSha !== manifest.installedSha`: User modified. Never overwritten without confirmation.

---

## Complete Catalog of Bundled Templates (189 Files)

### 1. Global & Project Foundations
- `templates/global/GEMINI.md`: 14 global engineering sections (Core principles, state management, testing, Firebase security, performance budgets).
- `templates/project/AGENTS.md`: Canonical agent rules link.
- `templates/.agents/rules/`:
  - `project-architecture.md`: Architectural boundaries, models, routing, UI separation.
  - `project_architecture.md`: Backward-compatibility canonical alias.
- `templates/.agents/workflows/`:
  - `create-feature.md`: 5-step structured feature development lifecycle (Analyze, Plan, Implement, Verify, Report).

### 2. Core Flutter Engineering Skills (9 skills)
- **`create-feature`** (2 files): Feature scaffolding and workflow specification.
- **`dart-model-generation`** (1 file): Typed models, serialization, and immutability standards.
- **`flutter-accessibility`** (1 file): WCAG compliance, Semantics widget, contrast guidelines, screen readers.
- **`flutter-debugging`** (1 file): DevTools profiling, inspector diagnostics, memory leaks, error tracing.
- **`flutter-performance`** (1 file): Widget rebuild minimization, list optimization, isolate management.
- **`flutter-release-engineering`** (1 file): Keystores, build flavors, CI/CD, obfuscation, store deployment.
- **`flutter-responsive-ui`** (1 file): Responsive layouts, breakpoints, mobile, tablet, and desktop adaptation.
- **`flutter-testing`** (1 file): Unit, widget, golden, mockito, and integration test architectures.
- **`git-code-review`** (1 file): PR conventions, code review checklists, architecture compliance audits.

### 3. Backend & Network Skills (2 skills)
- **`firebase-engineering`** (1 file): Firebase Auth, Firestore security rules, Cloud Functions patterns.
- **`api-integration`** (1 file): REST/HTTP client patterns, token refresh lifecycles, network error handling.

### 4. Design & Presentation Skills (7 skills)
- **`ui-ux-pro-max`** (71 files): Multi-stack design intelligence, data taxonomies, stack catalogs (`flutter`, `react`, `shadcn`, `swiftui`, `vue`), Python reasoning scripts, and test fixtures.
- **`design-system`** (27 files): Token architecture, typography scale, component libraries, and documentation.
- **`design`** (35 files): Foundations, color systems, micro-interactions, layout templates.
- **`ui-styling`** (16 files): ThemeExtensions, ColorScheme tailoring, typography styling.
- **`brand`** (18 files): Brand voice, visual identity checklists, and guidelines.
- **`banner-design`** (2 files): Hero banners, store assets, aspect ratios, visual styling.
- **`slides`** (6 files): Presentation slide decks, themes, layout templates.

---

## Testing & Quality Assurance

The CLI includes an automated test suite powered by Vitest, covering:
- Clean initialization and idempotent re-runs.
- Existing file collision protection and user customization preservation.
- Three-way manifest checksum evaluation.
- `doctor` diagnostics and broken `AGENTS.md` markdown link detection.

Run the test suite:
```powershell
npm test
```

Build the TypeScript distribution:
```powershell
npm run build
```

---

## Publishing to npm

To publish this package to the npm registry for public or private distribution:

1. Ensure the package builds and tests pass:
   ```powershell
   npm run prepublishOnly
   ```
2. Log in to npm:
   ```powershell
   npm login
   ```
3. Publish:
   ```powershell
   npm publish --access public
   ```

---

## License

Distributed under the **MIT License**.
