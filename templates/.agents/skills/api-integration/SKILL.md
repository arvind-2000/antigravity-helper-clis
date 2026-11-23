---
name: api-integration
description: Design, implement, debug, and test REST API integrations in Flutter and Dart applications. Use when connecting backend APIs, implementing authentication, handling HTTP requests, parsing JSON responses, managing pagination, uploading files, or troubleshooting network errors.
---

# Professional REST API Integration

Follow this guide to implement robust, secure, and maintainable REST API communication in Flutter and Dart projects.

---

## 1. Project Analysis
Before writing or modifying network code:
- Inspect `pubspec.yaml` to identify existing networking packages (`http`, `dio`, `retrofit`, etc.).
- Inspect current API architecture:
  - Base URLs and environment configuration (e.g., `lib/constants/api_config.dart`).
  - Existing API clients, services, repositories, interceptors, and data models.
  - State management and dependency injection patterns (GetX, Riverpod, Bloc, Provider).
- Preserve existing project conventions, folder structures, and naming schemes.
- Check whether existing utilities or abstractions already solve the problem before introducing new ones.

---

## 2. API Architecture
Maintain strict separation of concerns across layers:
- **Client Layer:** Core HTTP client instance, base options, headers, interceptors, and timeout configurations.
- **Service / Data Source Layer:** Performs raw HTTP requests and returns response data or throws typed network exceptions.
- **Repository Layer:** Translates raw API responses into domain models and manages caching or offline fallback.
- **Presentation Layer (UI):** Consumes repositories via state management controllers. **Never make HTTP calls directly inside widgets.**
- **Dependency Injection:** Register and resolve API clients and services consistently using the project's dependency injection container.

---

## 3. HTTP Communication Standards
- Support standard HTTP verbs appropriately: `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.
- Correctly format and pass:
  - Query parameters (properly URL-encoded).
  - Request headers (`Content-Type: application/json`, `Accept`, `Authorization`, etc.).
  - Request bodies (serialized JSON payloads).
- Always configure explicit connection, send, and receive timeouts (e.g., 10–30 seconds) to avoid hanging requests.
- Validate HTTP response status codes:
  - `2xx`: Success — parse response body.
  - `4xx`: Client errors — handle validation, bad requests, or authorization issues.
  - `5xx`: Server errors — provide graceful failure states.
- Avoid duplicate, in-flight requests for identical user actions (debounce or cancel previous requests where applicable).

---

## 4. Authentication & Session Management
- Support Bearer token authentication via HTTP headers (`Authorization: Bearer <token>`).
- Implement automatic token injection and refresh-token flows via client interceptors or token handlers when required.
- Handle session expiration (`401 Unauthorized`) cleanly by clearing cached credentials and redirecting to the login flow.
- Never hardcode API keys, client secrets, passwords, or tokens in source code.
- Never log raw authorization tokens or passwords in console logs or crash reports.
- Store client-side tokens securely (e.g., `flutter_secure_storage` or encrypted storage when appropriate).
- Recognize that client-side authentication checks are UI conveniences; enforce that the server validates authorization on every request.

---

## 5. JSON Serialization & Data Models
- Implement strongly typed request and response models.
- Safely handle nullable, optional, and missing JSON fields using null-aware operators and fallback defaults.
- Adhere to the project's established serialization convention (manual `fromJson`/`toJson`, `json_serializable`, or `freezed`). Do not introduce code-generation libraries unless already in use.
- Validate API responses before accessing nested fields.
- Gracefully handle malformed or unexpected JSON payloads with clear parsing exceptions instead of unhandled runtime type errors.

---

## 6. Advanced API Operations
- **Pagination & Filtering:**
  - Support query parameter pagination (`page`, `pageSize`, `limit`, `offset`) and search/filter parameters.
  - Maintain clean pagination state (current page, has more items, loading next page).
- **Multipart File Uploads & Downloads:**
  - Use `MultipartRequest` or multipart form data for uploading files and images.
  - Include correct MIME types and filename headers.
  - Report upload/download progress where appropriate.
- **Request Cancellation:** Cancel pending requests when widgets are disposed or when rapid searches supersede earlier queries.
- **Retry Logic:**
  - Retry only safe, idempotent requests (`GET`, `HEAD`, `OPTIONS`, or specific idempotent `PUT` requests) on transient network failures.
  - Never blindly retry non-idempotent operations (`POST` payments, order creation, or stock adjustments).

---

## 7. Error Handling & User Feedback
- Implement a centralized, typed exception hierarchy:
  - `NoInternetException` / `ConnectionTimeoutException`
  - `UnauthorizedException` (401) / `ForbiddenException` (403)
  - `NotFoundException` (404)
  - `ValidationException` (400 / 422 with validation errors)
  - `ServerException` (500 / 502 / 503)
  - `JsonParseException` (Malformed payload)
- Provide user-friendly, localized error messages rather than raw HTTP error codes or technical stack traces.
- Map error states to distinct UI states (loading, empty, error with retry action, success).
- Never silently swallow network or parsing exceptions.

---

## 8. Testing & Verification
- Write unit tests for API services and repositories:
  - Mock HTTP responses using `http.Client` mock, `MockClient`, or test fixtures.
  - Test the happy path (200 OK with valid JSON).
  - Test failure scenarios: 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error.
  - Test network timeouts and socket exceptions.
  - Test malformed or partial JSON responses.
- Verify code health:
  - Run `dart format` on all modified files.
  - Run `flutter analyze` to ensure zero warnings or errors.
  - Run tests and report exact results honestly.

---

## 9. Security Best Practices
- Never commit credentials, private keys, API secrets, or passwords into version control.
- Never log sensitive user data, passwords, or authentication tokens in debug or release builds.
- Sanitize and validate all client input before transmitting it to the backend.
- Do not bypass or disable TLS/SSL certificate verification in production builds (`badCertificateCallback` / `HttpOverrides`).

---

## 10. Execution Rules
- **Package Integrity:** Do not install new dependencies without checking existing packages in `pubspec.yaml` first.
- **Architecture Respect:** Do not rewrite existing networking architecture unnecessarily; extend and harmonize with current patterns.
- **Non-Destructive:** Do not modify unrelated features or screens.
- **Approval Gate:** Ask before performing destructive changes, modifying production database schemes, or deploying.
- **No Hallucinated Endpoints:** Never invent API endpoints, field names, or response formats. Request or inspect backend API documentation and controller definitions when specifications are unknown.

---

## 11. Final Report Checklist
When completing an API integration task, summarize:
1. **What was implemented:** Endpoints connected, models created, and features enabled.
2. **Files created / modified:** Clear file list with paths.
3. **Architectural decisions:** Client choices, state management integration, and error handling flow.
4. **Verification results:** Formatting status, static analysis (`flutter analyze`), and test outcomes.
5. **Remaining items or notes:** Any pending backend endpoints, missing documentation, or recommended follow-ups.
