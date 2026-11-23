---
name: flutter-performance
description: Analyze, profile, diagnose, and optimize Flutter and Dart application performance. Use when investigating slow screens, excessive widget rebuilds, memory leaks, high CPU usage, large application memory consumption, slow startup, rendering problems, or Flutter Web performance.
---

# Flutter & Dart Performance Optimization

Follow this guide to profile, diagnose, optimize, and verify Flutter and Dart performance systematically without sacrificing code readability or maintainability.

---

## 1. Performance Investigation & Profiling
Before applying optimizations:
- **Identify Measurable Symptoms:** Quantify reported issues (e.g., dropped UI frames $< 60\text{ fps}$ / $120\text{ fps}$, startup duration $> 3\text{s}$, memory growth over time, excessive bandwidth).
- **Categorize Bottlenecks:** Determine whether the bottleneck is rooted in:
  - **CPU:** Main isolate contention, expensive data parsing, redundant algorithms.
  - **Rendering / GPU:** Complex shader passes, excessive rasterization, overdraw.
  - **Memory:** Retained object references, uncollected image decodes, leaks.
  - **I/O & Network:** Repeated HTTP roundtrips, unpaginated Firestore queries.
- **Evidence First:** Use Flutter DevTools (CPU Profiler, Memory View, Timeline / Performance View) before applying speculative optimizations. Never guess when you can measure.

---

## 2. Widget & Rendering Performance
- **Minimize Widget Rebuilds:**
  - Scope state listeners (`Consumer`, `Obx`, `BlocBuilder`) to the smallest necessary sub-trees.
  - Use `const` constructors on all static widgets, borders, insets, and text styles to enable element caching.
- **Keep `build()` Methods Pure:**
  - Never initiate network calls, heavy computations, or controller instantiations inside `build()`.
  - Extract complex sub-trees into standalone `StatelessWidget` classes rather than large helper methods returning widgets (helper methods do not benefit from framework caching).
- **Lazy List & Grid Rendering:**
  - Use `ListView.builder`, `GridView.builder`, or `CustomScrollView` with slivers for dynamic or large collections.
  - Avoid rendering pre-instantiated widget lists (`Column(children: [...])`) inside scrollable parents.
- **Layout Calculations:**
  - Avoid multiple intrinsic layout passes (`IntrinsicHeight`, `IntrinsicWidth`) unless structurally indispensable.
  - Apply `RepaintBoundary` judiciously to isolate high-frequency animated widgets (e.g., progress indicators, canvas visualizers) from static backgrounds.

---

## 3. Memory Management & Leak Prevention
- **Resource Disposal:** Always cancel and dispose of resources in `dispose()` or framework cleanup hooks:
  - Controllers: `TextEditingController`, `ScrollController`, `AnimationController`, `PageController`.
  - Streams: `StreamSubscription`, `Timer.periodic`.
  - State Notifiers: `ChangeNotifier`, reactive bindings.
- **Avoid Stale Object References:**
  - Never retain `BuildContext` references across long asynchronous gaps.
  - Avoid static or global lists that accumulate historical objects indefinitely.
- **Image Memory Management:**
  - Supply explicit `cacheWidth` and `cacheHeight` on `Image.network` or `ResizeImage` to ensure images are decoded only to display dimensions rather than original high-resolution sizes.
  - Clear or tune `PaintingBinding.instance.imageCache` maximum sizes for image-heavy catalogs.

---

## 4. Asynchronous Execution & Isolates
- **Main Isolate Offloading:**
  - Offload heavy CPU-bound tasks (large JSON decoding, cryptographic calculations, CSV/Excel file exports, heavy list filtering) to background isolates using `Isolate.run()` or `compute()`.
- **Request Lifecycle:**
  - Debounce rapid user input (e.g., search text changes) to avoid firing overlapping API requests.
  - Cancel obsolete network operations or image downloads when the originating widget unmounts.

---

## 5. Flutter Web Performance
- **Startup & Bundle Size:**
  - Utilize deferred loading (`import '...' deferred as ...`) for secondary screens, dashboards, and heavy third-party dependencies to reduce initial chunk download size.
  - Evaluate WebAssembly (`flutter build web --wasm`) and CanvasKit / Skwasm configurations for faster rendering and smoother frame rates.
- **Asset Optimization:**
  - Compress web assets, fonts, and images (prefer modern formats like WebP or SVG).
  - Configure caching headers (`Cache-Control`) on static hosting servers (`web.config`, `firebase.json`, or CDN configurations).
- **DOM & Browser Interactions:**
  - Prevent layout thrashing and handle rapid browser window resizing gracefully.

---

## 6. Lists, Pagination & Large Datasets
- **Incremental Loading:** Implement cursor-based or offset pagination (`pageSize: 20-50`) rather than loading complete datasets into memory.
- **Efficient Data Operations:**
  - Avoid full collection re-sorting or mapping inside `build()` passes.
  - Perform indexing, sorting, and filtering once upon data arrival or within state stores.
- **Caching Strategy:** Cache processed data only when repeated expensive computations or slow network fetches demonstrably degrade responsiveness.

---

## 7. API & Database Performance
- **Query Restraint:** Query only the fields and documents required for the active screen.
- **Firestore Optimization:**
  - Avoid unbounded collection listeners (`snapshots()`). Use one-time fetches (`get()`) when real-time updates are unnecessary.
  - Define composite indexes in Firestore for multi-field queries to avoid slow client-side filtering.
- **Batching & Network Hygiene:** Batch related write operations (`WriteBatch`, bulk HTTP endpoints) to minimize connection handshakes and server roundtrips.

---

## 8. Optimization Discipline
- **Measure $\to$ Modify $\to$ Measure:** Establish a measurable baseline before making code changes, and verify the gain post-implementation.
- **Smallest Safe Fix:** Choose the least intrusive modification that addresses the bottleneck without architectural overengineering.
- **Preserve Maintainability:** Do not introduce unreadable micro-optimizations for negligible, sub-millisecond gains.
- **No Premature Optimization:** Optimize verified bottlenecks backed by profiling traces, not speculative assumptions.

---

## 9. Verification Protocol
1. **Formatting & Static Analysis:**
   - Run `dart format` on all modified files.
   - Run `flutter analyze` to ensure zero errors or warnings.
2. **Regression Testing:** Run existing unit, widget, and integration test suites to confirm that behavior and business logic remain intact.
3. **Performance Re-measurement:** Re-run DevTools or targeted benchmarks under identical test conditions and document the comparative metrics.
4. **Honest Reporting:** State actual observed timings, frame rates, and memory numbers without fabricating passes.

---

## 10. Final Report Checklist
When delivering a performance optimization task, summarize:
1. **Performance Issue Identified:** Specific symptom, affected screen/flow, and initial benchmark metrics.
2. **Root Cause:** Technical explanation of why the bottleneck occurred.
3. **Optimization Applied:** Detailed description of code and architectural modifications.
4. **Files Modified:** List of all altered files with links.
5. **Measurements & Verification Results:** Comparison of before vs. after metrics (frame time, memory usage, bundle size, or query count), plus static analysis and test outcomes.
6. **Remaining Risks & Recommendations:** Any residual edge cases, architectural trade-offs, or follow-up recommendations.
