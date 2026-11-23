---
name: flutter-testing
description: Design, implement, execute, and maintain automated tests for Flutter and Dart applications. Use when creating unit tests, widget tests, integration tests, testing state management, validating API integrations, or reviewing application quality before release.
---

# Flutter & Dart Testing and Quality Assurance

Follow this guide to architect, implement, execute, and maintain robust automated test suites in Flutter and Dart applications.

---

## 1. Project Inspection & Setup
Before writing or running tests:
- Inspect `pubspec.yaml` to identify configured testing packages (`flutter_test`, `integration_test`, `mockito`, `mocktail`, `fake_async`, etc.).
- Inspect the `test/` directory structure to mirror `lib/` conventions (`test/models/`, `test/services/`, `test/controllers/`, `test/widgets/`).
- Identify established test patterns, fixtures, shared mocks, and base test helpers.
- Preserve the existing testing architecture and naming conventions (`*_test.dart`).
- Do not introduce redundant testing packages without verifying existing test utilities.

---

## 2. Unit Testing Business Logic
- **Scope:** Isolate business logic, repositories, data models, parsing logic, and utility functions from Flutter UI dependencies.
- **Independence:** Keep unit tests fast, hermetic, and deterministic. Avoid real network requests, actual disk I/O, or system clock dependencies.
- **Scenario Coverage:**
  - Standard happy paths with valid data.
  - Failure scenarios and expected exceptions (`throwsA(isA<ExpectedException>())`).
  - Null, empty, zero, and boundary inputs.
  - Data transformation and JSON serialization/deserialization integrity.

---

## 3. Widget Testing
- **UI State Verification:** Test that widgets render appropriately across lifecycle states:
  - Loading state (spinners, skeleton loaders).
  - Empty state (no data placeholders, empty illustrations).
  - Success state (data lists, cards, form inputs).
  - Error state (error alerts, retry buttons).
- **User Interactions:** Simulate user taps (`tester.tap`), text entry (`tester.enterText`), scrolls (`tester.drag`, `tester.scrollUntilVisible`), and pump frames (`tester.pump()`, `tester.pumpAndSettle()`).
- **Resilient Matchers & Finders:**
  - Find widgets using `find.byType`, `find.text`, `find.byKey`, or semantic labels.
  - Avoid brittle assertions tied to superficial widget trees or arbitrary layout details.
- **Responsive Layout Testing:** Test widgets under constrained dimensions using `tester.view.physicalSize` and `tester.view.devicePixelRatio`.

---

## 4. State Management Testing
- Test state transitions deterministically in accordance with the project's chosen architecture:
  - **GetX:** Test controller actions, reactive `Rx` value changes, and async workers (`ever`, `debounce`).
  - **Riverpod:** Use `ProviderContainer` to read and override providers, asserting state emissions.
  - **Bloc / Cubit:** Test event processing, state sequences (`blocTest`), and error emissions.
- **Lifecycle & Resource Disposal:** Verify that controllers, listeners, and stream subscriptions initialize properly and release resources upon disposal without memory leaks.

---

## 5. API & Firebase Testing
- **HTTP Mocking:** Mock HTTP endpoints using `http.Client` mocks, `MockClient`, or test adapters. Test headers, query params, status codes (200, 400, 401, 404, 500), and timeouts.
- **Payload Verification:** Verify that request payloads match API contracts and responses parse into domain models accurately.
- **Firebase Testing:**
  - Use fake/in-memory Firebase instances or connect to the local Firebase Emulator Suite.
  - Never run automated tests against live production Firestore databases or Storage buckets.

---

## 6. Integration Testing
- **Critical Journeys:** Target end-to-end user journeys (e.g., authentication $\to$ dashboard $\to$ product creation $\to$ checkout).
- **Maintainability:** Keep integration test files focused in `integration_test/` using the official `package:integration_test`.
- **Flakiness Prevention:** Avoid arbitrary `sleep()` delays. Use `tester.pumpAndSettle()` or poll for expected UI conditions.

---

## 7. Test Quality Standards
- **Naming Conventions:** Write descriptive test names indicating unit under test, scenario, and expected outcome (e.g., `test('ProductRepository.fetchById throws NotFoundException when ID does not exist', () ...)`).
- **AAA Pattern:** Structure tests strictly with **Arrange**, **Act**, and **Assert** phases.
- **Clean Fixtures:** Avoid duplicate test setup by using `setUp()`, `tearDown()`, or reusable test factories/builders.
- **Deterministic Data:** Use deterministic test fixtures over random data generators to ensure reproducible results.

---

## 8. Coverage & Verification Protocol
1. **Execute Tests:** Run targeted test suites:
   - Specific test file: `flutter test test/path/to/target_test.dart`
   - Full suite: `flutter test`
   - With coverage: `flutter test --coverage`
2. **Static Analysis & Formatting:**
   - Format test files: `dart format test/`
   - Run analysis: `flutter analyze`
3. **Honest Reporting:** Report actual command output, execution duration, passed tests, skipped tests, and failures without fabricating passes.

---

## 9. Execution Rules
- **Inspect First:** Examine existing test helpers and libraries before introducing new patterns.
- **Preserve Behavior:** Never alter application behavior merely to make a flawed test pass.
- **Targeted Scope:** Do not modify unrelated source code or test files outside the task.
- **No Unvetted Packages:** Check existing test dependencies in `pubspec.yaml` before adding new testing packages.
- **Approval Gate:** Ask before running destructive test scripts or altering CI/CD pipeline configurations.

---

## 10. Final Report Checklist
When completing a testing task, provide:
1. **Tests Created / Modified:** File paths and suite names.
2. **Features & Scenarios Covered:** Explicit list of happy paths, error states, and edge cases tested.
3. **Commands Executed:** The exact CLI commands used to run and verify the tests.
4. **Test Results:** Total tests executed, passed, failed, and skipped.
5. **Coverage & Known Gaps:** Any identified untested modules, limitations, or recommended next steps.
