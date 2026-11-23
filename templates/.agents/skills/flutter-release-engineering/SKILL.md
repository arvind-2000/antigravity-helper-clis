---
name: flutter-release-engineering
description: Build, configure, validate, package, and prepare Flutter applications for production release across Android, iOS, desktop, and web. Use when generating release builds, configuring signing, troubleshooting build failures, managing environments, optimizing deployment, or preparing application releases.
---

# Flutter Release Engineering & Deployment

Follow this guide to configure, build, package, validate, and prepare production-grade Flutter releases across Android, Web, iOS, and desktop platforms safely and reliably.

---

## 1. Project Inspection & Environment
Before initiating release builds:
- **SDK & Environment Verification:** Check Flutter and Dart versions (`flutter --version`) and verify installed platform build tools (Android SDK, Java/JDK, Gradle, Xcode, Visual Studio toolchain).
- **Project Configuration:** Inspect `pubspec.yaml` to identify versioning (`version: x.y.z+build`), native assets, and build dependencies.
- **Platform Files:** Inspect platform-specific folders (`android/`, `ios/`, `web/`, `windows/`, `macos/`, `linux/`) and existing deployment scripts (`deploy.sh`, CI/CD pipelines, Dockerfiles).
- **Preserve Conventions:** Respect the project's existing build conventions and target directories (`build/`, `publish/`).

---

## 2. Build Modes & Environment Configuration
- **Mode Discipline:**
  - **Release (`--release`):** Minified, tree-shaken, optimized for maximum speed and minimum binary footprint; debugging aids and asserts are disabled.
  - **Profile (`--profile`):** High-performance build retaining tracing probes for DevTools profiling.
  - **Debug (`--debug`):** Unoptimized JIT build with hot reload for local development.
- **Environment Separation:**
  - Manage configuration and endpoints via compile-time variables (`--dart-define` / `--dart-define-from-file`) or dedicated configuration files rather than hardcoding production values.
  - Never embed sensitive credentials, private keys, or API secrets inside client-side builds.
- **Versioning:** Synchronize semantic version names (`versionName`) and integer build numbers (`versionCode` / `buildNumber`) across platform manifests and `pubspec.yaml`.

---

## 3. Android Releases
- **Build Targets:**
  - Google Play / Store Distribution: Android App Bundle (`flutter build appbundle --release`).
  - Direct Sideloading / Enterprise: Split per-ABI or universal APKs (`flutter build apk --release --split-per-abi`).
- **Compatibility Matrix:** Ensure Java JDK (e.g., JDK 17), Gradle wrapper (`gradle-wrapper.properties`), Android Gradle Plugin (AGP), and Kotlin versions are strictly compatible.
- **Signing Hygiene:**
  - Configure release signing via `key.properties` loaded into `android/app/build.gradle`.
  - Never commit keystore files (`*.jks`, `*.keystore`) or plain-text passwords into version control. Ensure `key.properties` is listed in `.gitignore`.
- **Permissions:** Review `android/app/src/main/AndroidManifest.xml` to ensure only strictly required permissions are requested.

---

## 4. Flutter Web Releases
- **Compilation Options:**
  - Standard JS build: `flutter build web --release`
  - WebAssembly (Wasm) build: `flutter build web --wasm` (ensure zero `dart:html` or incompatible legacy JS packages are imported).
- **Base HREF & URL Strategy:**
  - Configure `--base-href` when deploying to a subfolder (e.g., `flutter build web --base-href /app/`).
  - Ensure path URL strategy (`usePathUrlStrategy()`) is paired with proper web server rewrite rules.
- **Hosting Server Configuration:**
  - **IIS (`web.config`):** Configure URL rewrite rules to redirect all virtual route requests back to `index.html`, and register correct MIME types (`application/wasm`, `application/json`, `font/woff2`).
  - **Firebase Hosting (`firebase.json`):** Configure rewrites: `[{"source": "**", "destination": "/index.html"}]` with appropriate asset caching headers.
  - **Nginx / Apache:** Configure fallback to `index.html` on 404 (`try_files $uri $uri/ /index.html;`).
- **Asset Optimization & PWA:** Validate `manifest.json`, icon assets, and service worker / bootstrap caching.

---

## 5. iOS & Desktop Packaging
- **iOS:**
  - Validate CocoaPods dependencies (`pod install`), deployment target versions in `Podfile`, and Xcode project settings.
  - Build IPA packages: `flutter build ipa --release`.
  - Handle provisioning profiles, signing certificates, and App Store export options safely without exposing developer identity keys.
- **Desktop (Windows, macOS, Linux):**
  - Verify native build toolchains (MSVC C++ tools on Windows, Xcode on macOS, CMake/ninja on Linux).
  - Package desktop executables with their bundled dependency DLLs/frameworks and asset folders (`data/`).

---

## 6. Pre-Release Quality & Gatekeeping
Before declaring a build ready for release:
1. **Format Check:** Run `dart format . --set-exit-if-changed`.
2. **Static Analysis:** Run `flutter analyze` to ensure zero errors and zero warnings.
3. **Automated Testing:** Run `flutter test` to ensure all unit and widget tests pass.
4. **Debug Code Purge:** Verify that no debug flags (`debugPaintSizeEnabled`, mock data toggles, hardcoded bypasses) remain active.
5. **Asset & Bundle Verification:** Check that only required assets are bundled in `pubspec.yaml` to minimize total package footprint.

---

## 7. Build Troubleshooting & Triage
- **Gradle & AGP Incompatibilities:** Inspect Gradle deprecation notices, namespace declarations, and compileSdk constraints when Android builds fail.
- **Dependency Conflicts:** Run `flutter pub outdated` and inspect `pubspec.lock` when package version incompatibilities prevent compilation.
- **Web Wasm Compilation Errors:** Inspect dart2wasm error outputs to isolate incompatible `dart:html` or `dart:js` usages.
- **Minimal Interventions:** Fix root build causes with targeted configuration edits rather than wiping project configurations indiscriminately.

---

## 8. Deployment Safety & Rollback Gates
- **Target Inspection:** Verify server host, IIS site, or cloud bucket status before executing deployments.
- **Strict Approval Gate:** **Never trigger automated deployment commands or modify live production servers without explicit user confirmation.**
- **Rollback Readiness:** Ensure previously running binaries or web assets are backed up before deploying updates.
- **Data Protection:** Never alter production databases, schemas, or storage buckets during a client build/release task.

---

## 9. Verification Protocol
1. **Execute Build:** Run the exact target build command (e.g., `flutter build web --release`).
2. **Artifact Verification:** Check that expected output files exist on disk:
   - Web: `build/web/index.html`, `build/web/flutter_bootstrap.js` (or `main.dart.js` / `main.dart.wasm`).
   - Android: `build/app/outputs/bundle/release/app-release.aab` or `build/app/outputs/flutter-apk/app-release.apk`.
   - Desktop: `build/windows/x64/runner/Release/` executable and DLLs.
3. **Artifact Size & Sanity:** Record and report the output file sizes and build duration.
4. **Honest Output:** Never report a successful build without verifying that the command exited with code 0 and generated valid artifacts.

---

## 10. Final Report Checklist
When completing a build engineering task, summarize:
1. **Target Platform & Mode:** e.g., Web (Release / Wasm), Android App Bundle, Windows Release.
2. **Files Created / Modified:** Build configs, manifests, or scripts updated.
3. **Build Commands Executed:** The exact CLI invocations used.
4. **Generated Artifact Paths & Sizes:** Absolute or workspace-relative artifact locations and file sizes.
5. **Verification Outcomes:** Static analysis status, test pass rates, and artifact presence checks.
6. **Remaining Release Risks:** Outstanding manual steps (Play Console upload, Apple TestFlight submission, IIS service restart).
