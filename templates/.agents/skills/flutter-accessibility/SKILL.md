---
name: flutter-accessibility
description: Audit, implement, and improve accessibility in Flutter applications. Use when building accessible widgets, supporting screen readers, improving keyboard navigation, validating contrast, supporting text scaling, or conducting accessibility reviews.
---

# Flutter Accessibility & Inclusive UI Engineering

Follow this guide to audit, architect, implement, and verify accessible and inclusive user experiences across mobile, desktop, and web in Flutter.

---

## 1. Accessibility Inspection & Baseline Audit
Before modifying code:
- **Design System Review:** Inspect existing color palettes, text styles, input components, and icon buttons in `ThemeData`.
- **Targeted Screen Audit:** Examine requested screens for common accessibility gaps:
  - Missing semantic labels on icon-only buttons.
  - Insufficient color contrast between text and background.
  - Fixed-height containers that overflow when system text scaling increases.
  - Form fields without associated label semantics.
  - Interactive elements smaller than minimum physical touch target thresholds.
- **Tooling:** Use Flutter DevTools (Accessibility inspector), `debugDumpSemantics()`, or `showSemanticsDebugger = true` to view the active semantics tree.
- **Prioritize Impact:** Address high-severity barriers (unusable forms, missing button names, broken focus order) before cosmetic adjustments.

---

## 2. Screen Reader Support & Semantics Tree
- **Meaningful Labels:**
  - Provide `tooltip` or `Semantics(label: "...", ...)` for icon-only buttons (`IconButton`, `FloatingActionButton`).
  - Use `Semantics(button: true, label: "...")` when building custom clickable widgets via `InkWell` or `GestureDetector`.
- **Exclude Decorative Elements:**
  - Wrap purely decorative graphics, background gradients, or icons accompanied by adjacent text in `ExcludeSemantics` to eliminate announcement clutter.
- **Group Related Nodes:**
  - Use `MergeSemantics` to consolidate related items (e.g., an avatar, user name, and role badge in a list tile) into a single cohesive announcement.
- **Live Announcements:** Use `SemanticsService.announce(message, TextDirection.ltr)` for transient dynamic alerts (e.g., "Item added to cart", "Form submitted successfully").
- **Logical Traversal:** Ensure the order of semantic nodes follows logical reading and navigation flow.

---

## 3. Visual Accessibility & Typography
- **Contrast Ratios (WCAG 2.1 AA Standards):**
  - Normal text ($< 18\text{pt}$ or $< 14\text{pt}$ bold): Minimum contrast ratio of **$4.5:1$** against its background.
  - Large text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold) and UI components: Minimum contrast ratio of **$3.0:1$**.
- **System Text Scaling:**
  - Test UI under maximum system accessibility text scales (e.g., $1.5\times$ to $2.0\times$ font scale).
  - Avoid hardcoded container heights (`height: 48`) enclosing dynamic text; use flexible constraints (`minHeight`) or auto-expanding layouts.
  - Prevent text truncation (`TextOverflow.fade` / clipping) unless explicitly designed with expandable disclosure.
- **Color Independence:** Never use color alone to convey status (e.g., pair red error indicators with an exclamation icon and descriptive text).

---

## 4. Interaction, Focus & Touch Accessibility
- **Minimum Touch Targets:**
  - Ensure interactive elements measure at least **$48 \times 48\text{ dp}$** of physical target space (`kMinInteractiveDimension`).
  - Use `IconButton(padding: ..., constraints: BoxConstraints(minWidth: 48, minHeight: 48))` or `MaterialTapTargetSize.padded`.
- **Keyboard Navigation & Focus Order:**
  - Ensure all interactive controls are reachable via `Tab` key traversal.
  - Provide clear, high-contrast visual focus indicators using `Focus(focusNode: ...)` or `ThemeData.focusColor`.
  - Maintain an intuitive focus traversal order (`FocusTraversalGroup`, `OrderedTraversalPolicy`).
- **Gesture Alternatives:** Provide tap or button alternatives for swipe, pinch, or drag gestures.
- **Reduced Motion:** Check `MediaQuery.of(context).disableAnimations` to respect system-level "reduce motion" preferences, disabling or shortening transition animations.

---

## 5. Accessible Forms & Validation
- **Label Association:** Always supply explicit `labelText` or `Semantics(label: "...")` for input fields (`TextFormField`, `TextField`).
- **Error Feedback:**
  - Display clear, descriptive inline error text (`errorText`) beneath failed inputs.
  - Move accessibility focus or announce validation failures so assistive technology users are immediately informed.
- **Control Types:** Ensure checkboxes, radio buttons, switches, and dropdowns announce their state (`checked`, `selected`, `expanded`) accurately.

---

## 6. Multi-Platform & Responsive Considerations
- **Platform Conventions:**
  - iOS / macOS: Align with VoiceOver conventions and native accessibility traits.
  - Android: Support TalkBack announcements and swipe gestures.
  - Web & Desktop: Ensure full keyboard operability, proper ARIA mapping via Flutter web engine, and browser zoom compatibility.
- **Dynamic Orientation:** Support both portrait and landscape layouts with equal accessibility and zero clipping.

---

## 7. Verification Protocol
1. **Automated Accessibility Testing:**
   - Add widget tests using Flutter's built-in accessibility guidelines:
     ```dart
     testWidgets('Screen meets accessibility guidelines', (tester) async {
       await tester.pumpWidget(const MyApp());
       final handle = tester.ensureSemantics();
       await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
       await expectLater(tester, meetsGuideline(textContrastGuideline));
       await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
       handle.dispose();
     });
     ```
2. **Code Cleanliness:**
   - Run `dart format` on modified files.
   - Run `flutter analyze` to ensure zero lint errors.
3. **Manual Verification:** Test with keyboard navigation (`Tab`, `Space`, `Enter`) and verify system font scaling ($2.0\times$).
4. **Honest Limitations:** Acknowledge that automated checks cannot verify the subjective clarity of screen reader speech; manual testing remains essential.

---

## 8. Execution Rules
- **Preserve Design Language:** Enhance accessibility within the existing theme and design tokens; do not perform unwarranted redesigns.
- **Focused Scope:** Apply changes strictly to requested screens or shared components.
- **Zero Redundant Dependencies:** Utilize Flutter's built-in `Semantics`, `Focus`, and `MediaQuery` primitives; do not introduce external accessibility packages without justification.
- **No False Compliance Claims:** Never claim full WCAG certification based solely on automated test passes.

---

## 9. Final Report Checklist
When delivering an accessibility task, summarize:
1. **Accessibility Issues Identified:** Summary of audited barriers (contrast, touch targets, screen reader labels, scaling).
2. **Improvements Implemented:** Specific semantic annotations, layout adjustments, and focus enhancements applied.
3. **Files Modified:** List of all altered files with links.
4. **Verification Performed:** Output from `meetsGuideline` test runs, `flutter analyze`, and manual keyboard/scaling checks.
5. **Remaining Accessibility Considerations:** Any third-party widget limitations, complex canvas areas, or recommended real-device manual testing.
