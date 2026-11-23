
# Project Architecture Rules

## 1. Understand Before Modifying
- Read `pubspec.yaml` before making changes.
- Inspect the existing folder structure.
- Identify the state management, routing, dependency injection, and data-access patterns.
- Read related files before implementing a feature.
- Follow existing project conventions.

## 2. Architecture
- Maintain clear separation between UI, business logic, and data access.
- Keep widgets responsible for presentation.
- Keep API and database operations outside widgets.
- Reuse existing services, repositories, and utilities.
- Avoid unnecessary abstraction and overengineering.

## 3. State Management
- Follow the state management solution already used by the project.
- Do not introduce another state management package without justification.
- Keep state predictable and avoid unnecessary rebuilds.
- Handle loading, success, empty, and error states.

## 4. Models and Serialization
- Use strongly typed models.
- Handle nullable API fields safely.
- Keep JSON serialization consistent with existing models.
- Validate data before using it.
- Do not silently discard unexpected API responses.

## 5. Navigation
- Follow the existing routing implementation.
- Preserve route names and navigation behaviour.
- Handle deep links and browser navigation where applicable.
- Avoid duplicate navigation logic.

## 6. UI and Design
- Preserve the existing theme and design system.
- Reuse existing widgets and components.
- Ensure responsive layouts.
- Avoid changing unrelated screens.
- Check overflow, spacing, and accessibility.

## 7. Change Management
- Make focused changes.
- Do not rewrite entire modules unnecessarily.
- Preserve existing functionality.
- Explain architectural changes before making significant structural modifications.
- Update related tests and documentation.

## 8. Verification
- Run `dart format` on modified Dart files.
- Run `flutter analyze`.
- Run relevant tests.
- Report errors honestly.
- Never claim successful verification without executing the checks.
