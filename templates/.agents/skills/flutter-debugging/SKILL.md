---
name: flutter-debugging
description: Diagnose, investigate, and resolve Flutter and Dart errors systematically. Use when fixing compilation errors, runtime exceptions, widget rendering problems, state management bugs, API failures, performance issues, build failures, or unexpected application behaviour.
---

# Systematic Flutter & Dart Debugging

Follow this guide to isolate, diagnose, and resolve Flutter and Dart defects methodically while preventing regressions.

---

## 1. Understand the Problem
- **Full Trace Analysis:** Read the entire error message, exception type, and stack trace top-to-bottom.
- **Trace the Path:** Identify the exact file, line number, method, widget, and asynchronous call sequence where the failure originated.
- **Reproduce First:** Formulate the minimal sequence of user actions or automated test steps required to reliably reproduce the failure.
- **Inspect Before Modifying:** Examine the surrounding code, related models, and recent commits before writing code or changing dependencies.
- **Root Cause vs. Symptom:** Distinguish underlying causes (e.g., unawaited Future, missing null check, unbounded constraints) from superficial symptoms (e.g., LateInitializationError, RenderFlex overflow).

---

## 2. Static Analysis & Compilation Issues
- **Static Analysis:** Run `flutter analyze` or `dart analyze` to surface type mismatches, dead code, missing imports, and deprecated API usage.
- **Null Safety & Types:** Diagnose nullability errors, unsafe casts (`as`), and missing generic arguments. Avoid adding `!` force-unwraps without proving non-null guarantees.
- **Code Generation & Build Tools:** For projects using code generation (`build_runner`, `freezed`, `json_serializable`), inspect conflicting outputs and run `dart run build_runner build --delete-conflicting-outputs` when generated files are stale.
- **Build & Platform Tooling:**
  - Diagnose Gradle, Kotlin, AGP (Android Gradle Plugin), and SDK version incompatibilities in `android/build.gradle` and `android/app/build.gradle`.
  - Resolve CocoaPods, iOS deployment targets, and Xcode signing issues when debugging Apple builds.
  - Diagnose Wasm and Web compilation barriers (`dart:html` / `dart:io` usage on unsupported targets).

---

## 3. Runtime Exceptions & Lifecycle Bugs
- **Null & Initialization:** Resolve `NullPointerException`, `LateInitializationError`, and uninitialized late variables by providing safe defaults or handling nullable types idiomatically.
- **Async Execution & Race Conditions:**
  - Check for unhandled Futures and unawaited asynchronous operations.
  - Verify that `mounted` is checked before calling `setState()` or utilizing `BuildContext` across asynchronous gaps.
- **Streams & Subscriptions:** Ensure all `StreamSubscription` instances, timers, and controllers (TextEditingController, ScrollController, AnimationController) are properly cancelled and disposed of in `dispose()`.

---

## 4. Flutter UI & Layout Debugging
- **RenderFlex Overflows:**
  - Diagnose "A RenderFlex overflowed by X pixels" errors.
  - Wrap unbounded children in `Expanded`, `Flexible`, or scrollable viewports (`SingleChildScrollView`, `ListView`).
- **Unbounded Constraints:**
  - Resolve "Vertical viewport was given unbounded height" by supplying explicit constraints or setting `shrinkWrap: true` and `physics: const ClampingScrollPhysics()` when nesting scroll views.
- **Responsive Layouts:** Verify widget behaviour across compact, medium, and expanded screen breakpoints using `LayoutBuilder` or `MediaQuery`.
- **Inspection Tools:** Use Flutter DevTools (Widget Inspector, Layout Explorer) and debug flags (`debugPaintSizeEnabled`) when diagnosing visual anomalies.

---

## 5. State Management Debugging
- **State Flow Tracing:** Trace the state transition from action trigger, controller/bloc/notifier update, to UI listener consumption.
- **Framework Conventions:** Respect the project's chosen state management library (GetX, Riverpod, Bloc, Provider):
  - In GetX: Check controller registration (`Get.put` / `Get.find`), reactive `Rx` updates, and `Obx` scope.
  - In Riverpod: Check provider invalidation, `autoDispose` lifecycles, and `ref.watch` vs `ref.read`.
  - In Bloc: Inspect event emission, state equality (`Equatable`), and `BlocBuilder` conditionals.
- **Stale State & Over-Rebuilding:** Identify unneeded UI rebuilds by scoping listeners to the smallest necessary subtree.

---

## 6. API, Network & Firebase Debugging
- **Network Inspection:** Inspect outbound request URLs, query parameters, authorization headers, and JSON request bodies.
- **Status Code Triage:**
  - `401 Unauthorized`: Token missing, expired, or invalid auth header formatting.
  - `403 Forbidden`: Insufficient role permissions or failing backend access checks.
  - `404 Not Found`: Incorrect route URL, missing path parameters, or prefix mismatches (e.g., missing `/api/`).
  - `500 Server Error`: Inspect backend logs and handle server failures gracefully in UI.
- **Firebase Troubleshooting:**
  - Diagnose Firestore and Storage `permission-denied` errors by examining security rules and authentication state.
  - **Security Rule Integrity:** Never weaken, bypass, or open security rules (`allow read, write: if true;`) as a debugging shortcut. Fix client payloads or authentication tokens legitimately.

---

## 7. Performance & Memory Profiling
- **Main Isolate Offloading:** Ensure heavy computational tasks (large JSON decoding, image processing, complex filtering) run in background isolates via `compute()` or `Isolate.run()`.
- **Build Method Efficiency:** Keep `build()` methods pure, lightweight, and side-effect-free. Never trigger API requests or heavy computations inside `build()`.
- **List Optimization:** Use `ListView.builder` or `CustomScrollView` with slivers for large lists instead of rendering pre-allocated widget children.
- **Profiling First:** Base optimizations on DevTools CPU profiler and memory allocations rather than speculative guesswork.

---

## 8. Resolution Strategy
- **Smallest Safe Fix:** Propose and implement the minimal change that directly eliminates the root cause without collateral risk.
- **Preserve Architecture:** Do not rewrite entire modules, change routing libraries, or introduce alternative state management packages to fix a bug.
- **No Warning Suppression:** Never suppress linter warnings (`// ignore: ...`) without concrete, documented technical justification.
- **Incremental Steps:** Apply changes step-by-step, validating after each modification to confirm progress.

---

## 9. Verification Protocol
1. **Format:** Run `dart format <modified-files>`.
2. **Static Analysis:** Run `flutter analyze` to ensure zero errors and zero newly introduced warnings.
3. **Automated Tests:** Run existing unit, widget, and integration tests covering the affected module.
4. **Targeted Reproduction Check:** Retest the specific failure scenario to verify that the bug is completely resolved and edge cases are handled.
5. **Honest Reporting:** Report actual command and test results without fabricating passes.

---

## 10. Final Report Checklist
When completing a debugging task, provide:
1. **Original Problem:** Summary of reported symptoms, error message, and reproduction steps.
2. **Identified Root Cause:** Technical explanation of why the failure occurred.
3. **Files Modified:** List of all altered files with links.
4. **Fix Applied:** Description of the exact logic changes made.
5. **Verification Performed:** Output of formatting, analysis (`flutter analyze`), and test runs.
6. **Remaining Risks / Next Steps:** Any related edge cases, performance considerations, or follow-up recommendations.
