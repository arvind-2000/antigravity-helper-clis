---
name: flutter-responsive-ui
description: Design, implement, debug, and optimize responsive Flutter interfaces for mobile, tablet, desktop, and web. Use when creating screens, reusable widgets, adaptive layouts, responsive navigation, or fixing UI overflow and layout problems.
---

# Professional Responsive Flutter UI Development

Follow this guide to build, adapt, and optimize responsive Flutter user interfaces that look polished across mobile, tablet, desktop, and web viewports.

---

## 1. Project Analysis
Before creating or modifying UI components:
- **Design Tokens & Theme:** Inspect `ThemeData`, color schemes, typography styles (`TextTheme`), spacing constants, and component styling in the project.
- **Breakpoints & Utilities:** Identify any existing responsive helper classes, layout builders, or breakpoint constants (e.g., mobile `< 600px`, tablet `600–1024px`, desktop `> 1024px`).
- **Existing Screens:** Review peer screens and existing widget libraries to reuse established card layouts, tables, headers, and navigation patterns.
- **Visual Identity:** Strictly preserve the existing brand styling, icon sets, color palette, and visual hierarchy.

---

## 2. Responsive Layout Architecture
- **Constraint-Based Design:** Design layouts around available parent constraints (`BoxConstraints`) using `LayoutBuilder` rather than device screen dimensions alone.
- **MediaQuery vs. LayoutBuilder:**
  - Use `MediaQuery.of(context)` for device-level metrics (orientation, safe area padding, text scale factor, overall viewport size).
  - Use `LayoutBuilder` for component-level adaptation based on local container width and height.
- **Viewport Tiers:**
  - **Compact (Mobile < 600px):** Single-column stacked layouts, full-width cards, modal bottom sheets.
  - **Medium (Tablet 600–1024px):** Two-column grids, master-detail layouts, responsive side sheets.
  - **Expanded (Desktop / Web > 1024px):** Multi-column dashboard grids, fixed sidebars, data tables, centered content with maximum reading widths (`ConstrainedBox(constraints: BoxConstraints(maxWidth: 1200))`).
- **Overflow Prevention:**
  - Wrap flexing elements in `Expanded` or `Flexible` with appropriate flex ratios.
  - Ensure dynamic content uses `SingleChildScrollView` or `ListView` with bouncing/clamping scroll physics.
  - Never use rigid, fixed pixel widths or heights that exceed compact screen boundaries.

---

## 3. Adaptive Navigation
- **Navigation Patterns by Viewport:**
  - **Mobile:** `NavigationBar` (bottom navigation), modal bottom sheets, or drawer menus.
  - **Tablet:** `NavigationRail` (collapsed icons with labels) or compact side navigation.
  - **Desktop / Web:** Persistent sidebar (`NavigationDrawer` or custom `SideNavigation`), top app bars with breadcrumbs.
- **Routing Preservation:** Integrate seamlessly with the project's routing solution (GoRouter, GetX, or Navigator 2.0). Never break deep links or browser navigation history.
- **Dynamic Resize Handling:** Ensure switching between navigation types during window resize (e.g., resizing desktop or web browsers) maintains active route selection without restarting the screen.

---

## 4. Widget Engineering & Composition
- **Composable Architecture:** Break complex interfaces into small, focused, composable widgets rather than single monolithic `build()` trees.
- **Performance Optimization with Const:** Use `const` constructors on all static widgets, borders, paddings, and styles to avoid redundant rebuilds.
- **Component Isolation:** Keep presentation widgets decoupled from business logic; receive data through constructor arguments and emit events via callbacks.
- **Reuse Design System:** Reuse existing application cards (`KpiCard`), table components, buttons, and form inputs.

---

## 5. UI Quality, Accessibility & Content Handling
- **Dynamic Content & Long Strings:**
  - Use `TextOverflow.ellipsis`, `maxLines`, or auto-wrapping.
  - Support user-configured accessibility text scaling (`MediaQuery.textScalerOf(context)`).
- **Touch Targets & Clickables:** Ensure interactive elements meet minimum touch target sizes ($48 \times 48\text{ dp}$ on mobile and touch devices; standard hover/cursor padding on desktop).
- **Comprehensive UI States:**
  - **Loading:** Skeleton loaders or shimmer effects mirroring the final layout structure.
  - **Empty:** Engaging empty state illustrations with clear calls-to-action.
  - **Error:** Human-readable error messages with retry actions.

---

## 6. Rendering Performance
- **Selective Rebuilds:** Scope state listeners (Riverpod `Consumer`, GetX `Obx`, Bloc `BlocBuilder`) to the smallest necessary sub-trees.
- **Lazy Collections:** Render large or dynamic lists and grids using `ListView.builder` or `GridView.builder`.
- **Intrinsic Layouts:** Avoid expensive `IntrinsicWidth` and `IntrinsicHeight` passes unless strictly required for table row alignments.
- **Image Optimization:** Supply explicit `cacheWidth` and `cacheHeight` on `Image.network` / `Image.asset` to minimize GPU memory pressure.

---

## 7. Flutter Web & Desktop Considerations
- **Window Resizing:** Test rapid browser window resizing to ensure layouts adapt smoothly without throwing assertion errors.
- **Pointers & Cursors:** Use `MouseRegion(cursor: SystemMouseCursors.click)` for interactive desktop elements.
- **Keyboard & Focus:** Ensure text inputs and actions support keyboard navigation (Tab key traversal, Enter key submission).
- **Scrolling Behavior:** Configure appropriate `ScrollBehavior` (supporting drag with touch, trackpad, and mouse wheel).

---

## 8. Verification Protocol
1. **Viewport Verification:** Validate UI across representative breakpoints:
   - Mobile: $375 \times 667$ / $412 \times 915$
   - Tablet: $768 \times 1024$
   - Desktop / Web: $1440 \times 900$ / $1920 \times 1080$
2. **Constraint & Overflow Check:** Confirm zero `RenderFlex` yellow-and-black stripe overflow errors.
3. **Format & Analyze:**
   - Run `dart format` on modified files.
   - Run `flutter analyze` to confirm zero lint warnings.
4. **Widget Testing:** Add responsive widget tests verifying layouts under varying screen dimensions using `WidgetTester.view.physicalSize`.

---

## 9. Execution Rules
- **Preserve Visual Theme:** Adhere strictly to the established design system, color palette, and component styles.
- **No Unrelated Redesigns:** Modify only the requested screens or widgets. Do not restyle unrelated features.
- **No Unvetted Packages:** Check existing packages in `pubspec.yaml` before adding responsive utility dependencies.
- **Non-Destructive:** Ask before deleting or refactoring shared core widgets.

---

## 10. Final Report Checklist
When delivering a responsive UI task, summarize:
1. **Files Created / Modified:** Exact paths with links.
2. **Responsive Behaviors Implemented:** Layout strategies, breakpoint transitions, and overflow remedies.
3. **Viewports Verified:** Specific screen dimensions and orientations tested.
4. **Verification Results:** Formatting, static analysis (`flutter analyze`), and test execution output.
5. **Remaining Limitations:** Any known viewport constraints, orientation considerations, or recommended enhancements.
