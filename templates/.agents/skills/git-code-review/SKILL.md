---
name: git-code-review
description: Review code changes, identify bugs, inspect Git history, manage branches, prepare commits, and maintain code quality in software projects. Use when reviewing implementations, investigating regressions, preparing commits, analyzing diffs, or managing Git workflows.
---

# Git Version Control & Professional Code Review

Follow this guide to inspect Git state, conduct thorough code reviews, investigate regressions, structure clean commits, and enforce software quality while safeguarding user work.

---

## 1. Git Project Inspection & Working Tree Triage
Before reviewing or staging changes:
- **Inspect Working State:** Check status using `git status` or `git status --short`.
- **Identify File States:** Explicitly separate:
  - Staged changes (`git diff --staged`)
  - Unstaged modifications (`git diff`)
  - Untracked files and build artifacts
  - Deleted or renamed files
- **Inspect History:** Examine recent commit history (`git log -n 5 --oneline` or `git log -p -n 1`) to understand context, author intent, and ongoing feature work.
- **Branch Context:** Check the active branch name (`git branch --show-current`) and tracking upstream before performing branch-sensitive operations. Never assume the repository state is clean.

---

## 2. Professional Code Review Dimensions
Review diffs systematically across six core quality dimensions:
1. **Correctness & Logic:**
   - Detect logic errors, off-by-one errors, incorrect boundary conditions, and broken control flows.
   - Verify that null safety is preserved without speculative force-unwrapping (`!`).
   - Identify race conditions, unhandled Futures, and unawaited async calls.
2. **Architecture & Conventions:**
   - Ensure separation between UI presentation, business logic, and data layers.
   - Verify consistency with project-specific architectural rules and existing library conventions.
3. **Security & Data Safety:**
   - Detect hardcoded secrets, plain-text API keys, connection strings, and exposed authentication tokens.
   - Verify that client input is validated and sanitized before dispatching to backend endpoints.
4. **Maintainability & Duplication:**
   - Flag copy-pasted logic, bloated functions, and unnecessarily nested widget trees.
   - Recommend composable helpers, pure functions, or reusable models where appropriate.
5. **Resource Management:**
   - Verify that all controllers, timers, listeners, and stream subscriptions are cancelled and disposed of.
6. **Performance Impact:**
   - Flag unnecessary rebuild triggers, unindexed queries, expensive computations inside `build()`, and unpaginated collection renders.

---

## 3. Git Diff Analysis & Hygiene
- **Detailed Diff Inspection:** Review exact line diffs (`git diff HEAD`) before commenting or approving.
- **Signal vs. Noise:** Distinguish existing legacy issues from newly introduced defects.
- **Accidental Files:** Flag unintended modifications, debug print statements, leftover scratch files, IDE configuration files, and temporary build outputs (`obj/`, `bin/`, `*.cache`).
- **Generated File Policy:** Verify whether code-generated files (`*.g.dart`, `*.freezed.dart`) align with current schema source changes.

---

## 4. Bug & Regression Prevention
- **Call-Site Impact:** Inspect all callers and references across the codebase when modifying function signatures, model definitions, or shared utilities.
- **Contract Compatibility:** Check for breaking changes in JSON serialization, database models, or API payloads.
- **Targeted Test Guidance:** Recommend or draft focused unit, widget, or integration tests targeting the modified failure modes.
- **Evidence-Based Findings:** Provide concrete code line references and failure scenarios; avoid vague or speculative feedback.

---

## 5. Commit Preparation & Hygiene
- **Logical Atomicity:** Group changes into small, cohesive, logically independent commits (e.g., separate refactoring from new feature logic).
- **Conventional Commit Messages:** Structure commit messages clearly:
  - `feat: <description>` (new capability)
  - `fix: <description>` (bug resolution)
  - `refactor: <description>` (code restructuring without behavioral changes)
  - `test: <description>` (adding or modifying tests)
  - `docs: <description>` / `chore: <description>`
- **Pre-Commit Verification:** Run `git diff --cached` to verify the exact staged content before executing a commit.

---

## 6. Branch Management & Conflict Resolution
- **Branch Naming:** Adhere to project conventions (`feature/<name>`, `bugfix/<issue>`, `chore/<task>`).
- **Conflict Inspection:** When resolving merge conflicts, inspect both branches' intent (`git diff --check`, `git log ..<branch>`) rather than guessing resolutions.
- **Preserve Uncommitted Work:** Use `git stash push -m "WIP: description"` to safeguard uncommitted changes before switching branches or pulling updates.

---

## 7. Verification Protocol
Before approving changes or finalizing commits:
1. **Formatting:** Confirm modified files adhere to standards (`dart format --output=none --set-exit-if-changed .`).
2. **Static Analysis:** Run project analyzers (`flutter analyze` / `dart analyze`) to confirm zero newly introduced warnings.
3. **Automated Tests:** Execute test suites covering the modified area.
4. **Final Diff Sanity:** Review the final consolidated diff (`git diff HEAD~1` or `git status`) to guarantee no leftover artifacts exist.

---

## 8. Strict Git Safety Rules
To protect codebase integrity and prevent irreversible data loss:
- **NEVER** run destructive commands (`git reset --hard`, `git clean -fd`, `git checkout -- .`) without explicit, unambiguous user confirmation.
- **NEVER** discard uncommitted user changes or untracked work.
- **NEVER** amend (`git commit --amend`) or rebase shared, pushed branch history without explicit user instruction.
- **NEVER** execute `git push` (especially `git push --force`) without explicit user permission.
- **NEVER** delete local or remote Git branches without user authorization.

---

## 9. Final Code Review Report Format
When completing a code review or Git inspection, deliver findings using this structure:

### 1. Review Summary
High-level overview of the pull request or working tree changeset, stating the overall health and readiness of the changes.

### 2. Findings by Severity
- **Critical (P0):** Security vulnerabilities, data loss risks, compile-breaking bugs, crash exceptions.
- **Major (P1):** Logic flaws, memory leaks, missed error states, performance regressions.
- **Minor (P2):** Code duplication, naming inconsistencies, unneeded complexity, style issues.
- **Nitpick (P3):** Formatting observations, optional readability enhancements.

### 3. Files Reviewed
Bulleted list of reviewed files with specific line references.

### 4. Verification Performed
Summary of executed checks (formatting, analysis, test runs) and outcomes.

### 5. Recommended Actions & Next Steps
Concrete, prioritized list of required fixes or improvements before merging/committing.
