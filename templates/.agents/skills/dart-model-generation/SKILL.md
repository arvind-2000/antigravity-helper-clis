---
name: dart-model-generation
description: Architect, generate, and maintain robust, strongly typed Dart data models and JSON serialization in Flutter applications. Use when creating domain models, handling JSON parsing, implementing fromJson/toJson, supporting immutability, or managing data contracts.
---

# Dart Data Model Generation & Serialization

Follow this guide to design, implement, and maintain strongly typed, immutable data models with safe JSON serialization in Flutter and Dart projects.

---

## 1. Project Inspection & Serialization Strategy
Before creating or modifying models:
- **Inspect Existing Models:** Examine `lib/models/` to identify the established pattern:
  - Manual `fromJson` / `toJson` constructors with null-aware parsing.
  - Code generation via `json_serializable` / `build_runner`.
  - Immutable models via `freezed` or Dart 3 records / class modifiers.
- **Preserve Conventions:** Adhere strictly to the project's existing serialization and naming conventions. Do not introduce new code-generation dependencies if the project relies on manual mapping.
- **Type Safety First:** Avoid passing unstructured `Map<String, dynamic>` dictionaries across layers; always map payloads into typed domain models.

---

## 2. Model Architecture & Immutability
- **Immutable Fields:** Declare all model fields as `final` to ensure thread safety and predictable state.
- **Safe Constructors:**
  - Provide a `const` generative constructor with required and optional/nullable named parameters.
  - Implement a `copyWith(...)` method for state updates without mutating existing instances.
- **Value Equality & Hashing:**
  - Implement `operator ==` and `hashCode` (or extend `Equatable`) to ensure accurate equality comparisons in collections and state management stores.
  - Provide an informative `toString()` implementation for debugging and logging.

---

## 3. Safe JSON Serialization (`fromJson` & `toJson`)
- **Robust Field Extraction:**
  - Safely cast dynamic JSON values using null-aware fallback operators (`json['name'] as String? ?? ''`).
  - Safely handle numeric conversions (e.g., parsing integers or doubles from ambiguous num/string JSON types: `(json['price'] as num?)?.toDouble() ?? 0.0`).
  - Safely parse timestamps (`DateTime.tryParse(json['createdAt'] as String? ?? '')`).
- **Nested Objects & Lists:**
  - Safely map nested lists using null-safe list comprehensions or mapping:
    ```dart
    items: (json['items'] as List<dynamic>?)
            ?.map((e) => ItemModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        const [],
    ```
- **Reverse Serialization (`toJson`):**
  - Return a clean `Map<String, dynamic>` mirroring backend database or API contract expectations.
  - Format `DateTime` instances to ISO 8601 strings (`toIso8601String()`).

---

## 4. Error Handling & Parsing Resilience
- **Never Crash on Unexpected Nulls:** Provide safe defaults or mark fields nullable (`?`) when backend schemas might omit keys.
- **Malformed Data Protection:** Wrap fragile custom parsing in `try-catch` blocks that throw clear, descriptive exceptions identifying the failing field name.
- **Enum Mapping:** Map API string constants to Dart enums safely with an unknown/fallback value to prevent crashes when backend APIs introduce new enum values.

---

## 5. Verification Protocol
1. **Formatting:** Run `dart format lib/models/`.
2. **Static Analysis:** Run `flutter analyze` to ensure zero typing or null-safety warnings.
3. **Unit Testing:** Write unit tests for models verifying:
   - Successful roundtrip serialization: `Model.fromJson(model.toJson()) == model`.
   - Null handling with empty/partial JSON maps (`Model.fromJson({})`).
   - Parsing of edge-case formats (floats as ints, invalid dates).

---

## 6. Execution Rules
- **No Hallucinated Fields:** Derive model schemas strictly from backend API documentation, database tables, or controller endpoints.
- **No Direct Widget Mutations:** Models must remain pure data carriers without Flutter UI or widget imports.
- **Preserve Existing Signatures:** Do not rename public getters or constructor parameters in existing models without verifying all call sites.
