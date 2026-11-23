
# Global Flutter & Dart Engineering Rules

## 1. Core Principles
- Follow official Flutter and Dart documentation and recommended conventions.
- Prioritize maintainability, readability, performance, security, and scalability.
- Write production-quality code, not temporary demonstrations.
- Prefer simple, well-structured solutions over unnecessary abstraction.
- Never introduce breaking changes without explaining their impact.
- Preserve existing project architecture unless a change is explicitly requested or technically necessary.

## 2. Project Analysis
Before modifying a project:
- Inspect its folder structure and `pubspec.yaml`.
- Identify Flutter/Dart versions and dependencies.
- Identify its existing architecture, state management, routing, and dependency injection.
- Inspect related models, services, repositories, and existing implementations.
- Reuse existing utilities and conventions wherever possible.
- Do not assume a project uses a particular package or architecture.

## 3. Architecture
For new projects:
- Use a feature-first folder structure.
- Separate presentation, business logic, and data access.
- Keep widgets focused on UI responsibilities.
- Move API calls and database operations out of widgets.
- Use repositories to abstract data sources where appropriate.
- Avoid unnecessary layers and overengineering.

For existing projects:
- Respect the established architecture.
- Do not migrate state management or restructure folders without a clear reason and approval.

## 4. Dart Coding Standards
- Use sound null safety.
- Prefer `final` and `const` wherever possible.
- Use meaningful names for classes, methods, variables, and files.
- Keep methods focused and reasonably small.
- Avoid duplicated logic.
- Avoid unnecessary dynamic types and unsafe casts.
- Handle exceptions explicitly.
- Use typed models instead of passing unstructured maps throughout the application.
- Follow Effective Dart guidelines.

## 5. Flutter UI Development
- Build reusable, composable widgets.
- Keep build methods readable.
- Avoid large monolithic widgets.
- Use `const` constructors where possible.
- Handle loading, empty, error, and success states.
- Implement responsive layouts for mobile, tablet, and desktop.
- Prevent overflow and layout constraint issues.
- Preserve the existing design system, theme, and visual identity.
- Do not make unrequested UI changes.

## 6. State Management
- Inspect the existing state management solution before making changes.
- For new projects, prefer Riverpod unless project requirements justify another approach.
- Keep business logic outside presentation widgets.
- Avoid unnecessary rebuilds.
- Dispose of controllers, subscriptions, and other resources correctly.
- Do not introduce multiple competing state management solutions without justification.

## 7. API & Data Handling
- Separate API communication from UI code.
- Use appropriate HTTP methods and status-code handling.
- Handle timeouts, network failures, authentication failures, and malformed responses.
- Validate API responses before using them.
- Use typed request and response models.
- Avoid hardcoding API endpoints, credentials, or environment-specific configuration.
- Never expose secrets in source code or logs.
- Handle pagination and large responses efficiently.

## 8. Firebase
- Follow Firebase security best practices.
- Never rely on client-side checks as the only authorization mechanism.
- Validate permissions in Firestore and Storage security rules.
- Avoid unnecessary reads, writes, listeners, and repeated queries.
- Handle authentication and token expiration correctly.
- Use Cloud Functions for trusted server-side operations.
- Never expose service-account credentials or private keys in client applications.

## 9. Performance
- Avoid unnecessary widget rebuilds.
- Use lazy builders for large lists.
- Optimize images and expensive computations.
- Avoid blocking the main isolate.
- Use pagination or incremental loading for large datasets.
- Profile before introducing complex optimizations.
- Do not sacrifice readability for insignificant performance gains.

## 10. Testing & Quality Assurance
- Run Dart formatting on modified files.
- Run `flutter analyze` after meaningful changes.
- Add unit tests for business logic and repositories.
- Add widget tests for important UI behaviour.
- Add integration tests for critical user flows where appropriate.
- Test loading, empty, error, and edge cases.
- Do not claim a task is complete if required checks have not been run.
- Report test failures honestly.

## 11. Dependency Management
- Check whether an existing dependency already solves the problem.
- Prefer maintained packages with compatible SDK constraints.
- Avoid adding dependencies for trivial functionality.
- Explain significant dependency additions.
- Do not upgrade unrelated packages.
- Check compatibility before changing package versions.

## 12. Agent Execution Behaviour
- Analyze first, then implement.
- For routine, reversible code changes, proceed without repeatedly asking for confirmation.
- Ask before destructive operations, deleting substantial data, changing production infrastructure, deploying, pushing Git changes, or modifying credentials and secrets.
- Do not overwrite working implementations without understanding their purpose.
- Make focused changes instead of rewriting entire files unnecessarily.
- Verify changes after implementation.
- Report files modified, important decisions, commands executed, and remaining issues.
- Never fabricate test results or successful execution.

## 13. Documentation
- Use official Flutter and Dart documentation as the primary reference.
- Check package documentation when using third-party dependencies.
- Explain non-obvious architectural decisions.
- Keep documentation aligned with actual implementation.
- Avoid unnecessary comments that simply repeat the code.

## 14. Final Delivery
After completing a task, provide:
1. What was implemented.
2. Which files were modified.
3. Important architectural or dependency decisions.
4. Analysis and test results.
5. Any unresolved issues or recommended next steps.
