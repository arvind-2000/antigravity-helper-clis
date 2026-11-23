---
name: create-feature
description: Build complete Flutter features following the existing project architecture, coding conventions, and testing requirements. Use when implementing a new screen, module, or application feature.
---

# Flutter Feature Development

## 1. Analyze the Project
- Inspect `pubspec.yaml` and the project structure.
- Identify the existing state management, routing, and dependency injection.
- Inspect similar features before implementing.
- Identify reusable widgets, services, repositories, and models.
- Never assume a package or architecture is being used.

## 2. Plan the Feature
- Identify required screens and widgets.
- Identify models and data requirements.
- Determine API and database interactions.
- Define loading, success, empty, and error states.
- Present a concise plan before significant implementation.

## 3. Implement
- Follow existing project conventions.
- Separate presentation, business logic, and data access.
- Use strongly typed models.
- Handle null values and exceptions safely.
- Reuse existing components.
- Implement responsive layouts.
- Avoid unnecessary dependencies.
- Avoid unrelated modifications.

## 4. Verify
- Format modified Dart files.
- Run `flutter analyze`.
- Run relevant unit and widget tests.
- Fix issues introduced by the implementation.
- Verify important navigation and user interactions.

## 5. Report
Summarize:
- What was implemented.
- Files created or modified.
- Architectural decisions.
- Commands and tests executed.
- Remaining issues.

## Safety
- Do not expose credentials or secrets.
- Do not overwrite unrelated code.
- Do not perform destructive operations without approval.
- Do not deploy or push Git changes without approval.
- Never claim tests passed without executing them.
