# Project Memory

## Purpose

This repository, now stored in the workspace as `Main Project`, is the active codebase for a native HRMS and employee management portal named `Northstar HRMS Portal`. It is no longer just a standalone task-manager reference. The repo now contains:

- A Next.js 16 frontend that keeps the original task-manager UI as the future Work Hub workspace.
- A Django backend scaffold for native authentication, RBAC, organization data, HR modules, work management, approvals, and auditability.
- Product and architecture documentation that must stay current as the codebase evolves.

The product goal is a self-owned internal business platform without relying on Microsoft 365, WhatsApp, external calendar providers, or third-party productivity SaaS features.

## Repository Identity

- Workspace path: `C:/All my things/Final year project/Main Project`
- Previous folder name: `Task-manager-UI-reference`
- Current folder name: `Main Project`
- All Markdown documentation in the workspace has been updated to use the `Main Project` path and repository name.

## Stack

- Frontend: Next.js 16 App Router, React 19, TypeScript
- Styling/UI: Tailwind CSS 4, Radix UI primitives, shadcn-style UI components
- Existing workspace UI: rich client-side task manager with board, calendar, analytics, templates, notifications, and local persistence
- Backend: Django 5 scaffold with Django REST Framework, Channels, Celery, PostgreSQL-ready configuration, Redis-ready configuration, and local dev SQLite fallback
- Auth/security direction: Django auth, Argon2 password hashing, request-first onboarding, password login, email OTP verification, role-based access

## Frontend Architecture

- The root route in [app/page.tsx](C:/All my things/Final year project/Main Project/app/page.tsx) now lands on the HRMS dashboard experience inside the portal shell so the application presents itself as an HRMS first, not as a standalone task tool.
- The same file still exports `TaskManagerPage`, which preserves the original large client-side task manager implementation for reuse as a feature module.
- Frontend authentication state is now managed by [components/hrms/auth-provider.tsx](C:/All my things/Final year project/Main Project/components/hrms/auth-provider.tsx) and [lib/auth-client.ts](C:/All my things/Final year project/Main Project/lib/auth-client.ts).
- Protected portal access is enforced by [components/hrms/protected-portal.tsx](C:/All my things/Final year project/Main Project/components/hrms/protected-portal.tsx). Unauthenticated users are redirected to sign-in and do not get access to the dashboard, modules, or task workspace.
- Portal routes now live under [app/(portal)](C:/All my things/Final year project/Main Project/app/(portal)). This route group introduces a shared portal shell and module surfaces for the HRMS experience.
- The shared portal shell is implemented in [components/hrms/portal-shell.tsx](C:/All my things/Final year project/Main Project/components/hrms/portal-shell.tsx). It provides sidebar navigation and top-level portal framing.
- The shared dashboard content is implemented in [components/hrms/dashboard-overview.tsx](C:/All my things/Final year project/Main Project/components/hrms/dashboard-overview.tsx) and is used both by `/` and `/dashboard`.
- The route-based module content is driven by [lib/hrms-data.ts](C:/All my things/Final year project/Main Project/lib/hrms-data.ts) and rendered by [components/hrms/module-page.tsx](C:/All my things/Final year project/Main Project/components/hrms/module-page.tsx).
- Current portal routes include:
  - `/`
  - `/dashboard`
  - `/employees`
  - `/attendance`
  - `/leave`
  - `/payroll`
  - `/projects`
  - `/tasks`
  - `/tasks/workspace`
  - `/calendar`
  - `/mail`
  - `/chat`
  - `/documents`
  - `/announcements`
  - `/approvals`
  - `/reports`
  - `/admin`
- Auth UI routes now exist under:
  - `/auth/request-access`
  - `/auth/bootstrap-admin`
  - `/auth/set-password`
  - `/auth/sign-in`
  - `/auth/verify-otp`
- Admin utility routes now exist under:
  - `/admin/access-requests`
  - `/admin/sessions`

## Task Workspace Role

- The original task manager should now be treated as the implementation base for the future HRMS Work Hub rather than the primary application landing experience.
- Its existing behaviors remain important reference material: kanban board, calendar view, analytics view, templates, task reminders, custom lists, custom statuses, archive and trash flows, dependencies, subtasks, notifications, activity logs, and local persistence patterns.
- The portal route [app/(portal)/tasks/workspace/page.tsx](C:/All my things/Final year project/Main Project/app/(portal)/tasks/workspace/page.tsx) reuses the existing task manager directly by rendering `TaskManagerPage`.
- Visible `Bento` branding has been removed from the task workspace header and widget headings so it now reads as `Northstar` and `Work Hub` inside the HRMS experience.

## Backend Architecture

- A Django backend scaffold now exists under [backend](C:/All my things/Final year project/Main Project/backend).
- The Django project package is [backend/hrms_backend](C:/All my things/Final year project/Main Project/backend/hrms_backend).
- Backend configuration currently includes:
  - `manage.py`
  - `requirements.txt`
  - `.env.example`
  - Django settings, ASGI, WSGI, Celery bootstrap, and root URLs
  - generated initial migrations for all scaffolded domain apps
  - a migrated local SQLite development database at `backend/db.sqlite3`
- Installed app boundaries currently include:
  - `accounts`
  - `rbac`
  - `organization`
  - `employees`
  - `attendance`
  - `leave_management`
  - `payroll`
  - `projects`
  - `tasks`
  - `calendar`
  - `mailbox`
  - `chat`
  - `documents`
  - `approvals`
  - `notifications`
  - `audit`
  - `reports`

## Current Backend Domain Model

- `accounts`
  - `User` extends Django `AbstractUser` with unique email and OTP verification fields.
  - `User` now also tracks failed login attempts and temporary lockout state.
  - `AccessRequest` supports request-first onboarding with approval or rejection and stores a development password-setup token preview for approved accounts.
  - `LoginOTP` stores hashed one-time passwords with expiry and consumption tracking.
  - `PasswordSetupToken` stores hashed password-setup links with expiry and consumption tracking.
  - `PortalSession` stores refresh-session state and revocation.
- `rbac`
  - `Permission`
  - `Role`
- `organization`
  - `Branch`
  - `Department`
  - `Designation`
- `employees`
  - `EmployeeProfile`
  - `EmployeeDocument`
- `attendance`
  - `Shift`
  - `AttendanceSession`
- `leave_management`
  - `LeavePolicy`
  - `LeaveRequest`
- `payroll`
  - `PayrollProfile`
  - `SalaryComponent`
  - `Payslip`
- `projects`
  - `Project`
  - `ProjectMembership`
  - `ProjectGroup`
  - `Milestone`
- `tasks`
  - `TaskStatus`
  - `Task`
  - `TaskComment`
  - `TaskApproval`
- `calendar`
  - `CalendarInstance`
  - `CalendarEvent`
- `mailbox`
  - `MailboxThread`
  - `MailboxMessage`
- `chat`
  - `ChatChannel`
  - `ChatMembership`
  - `ChatMessage`
- `documents`
  - `Document`
  - `DocumentVersion`
- `approvals`
  - `ApprovalRule`
  - `ApprovalRequest`
- `notifications`
  - `Notification`
- `audit`
  - `AuditEvent`
- `reports`
  - `ReportDefinition`

## Current Backend API Surface

- The root API currently exposes a health endpoint at `/api/v1/health/`.
- Auth routes currently exist under `/api/v1/auth/`.
- Implemented auth endpoints:
  - `GET /api/v1/auth/bootstrap-state`
  - `POST /api/v1/auth/bootstrap-admin`
  - `POST /api/v1/auth/access-request`
  - `GET /api/v1/auth/access-requests`
  - `POST /api/v1/auth/access-request/{id}/approve`
  - `POST /api/v1/auth/access-request/{id}/reject`
  - `POST /api/v1/auth/set-password`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/verify-otp`
  - `POST /api/v1/auth/resend-otp`
  - `GET /api/v1/auth/me`
  - `GET /api/v1/auth/sessions`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
- Current auth implementation now covers the first ten requested access features in a working development form:
  - access request form
  - admin verification queue
  - request approval
  - request rejection
  - password setup link
  - password login
  - email OTP verification
  - OTP resend
  - session management view
  - account lockout on repeated failed password attempts
- The auth implementation still needs production-hardening for token design, mail delivery, rate limiting, stronger audit hooks, and role-permission enforcement beyond staff checks.

## Documentation Rules

- [PROJECT_MEMORY.md](C:/All my things/Final year project/Main Project/PROJECT_MEMORY.md) is the canonical AI-facing current-state document for this repository.
- [docs/hrms-portal-blueprint.md](C:/All my things/Final year project/Main Project/docs/hrms-portal-blueprint.md) is the master product and architecture blueprint.
- [docs/hrms-implementation-detailed.md](C:/All my things/Final year project/Main Project/docs/hrms-implementation-detailed.md) is the detailed implementation narrative that explains how the repo evolved from the original task-manager reference into the current HRMS portal foundation.
- After every crucial change, rewrite affected sections in this file so they reflect the current implementation rather than append chronological logs.
- This file should remain concise, clean, and understandable to another AI agent reading the repo for the first time.

## Important Constraints And Assumptions

- No external productivity provider APIs should be assumed for core collaboration behavior.
- Internal mail is currently planned as a company-only mailbox product, not external internet email.
- Voice or video calling is not implemented and is not part of the current scaffold.
- SQLite is currently used as the default local development database in Django settings, while the architecture remains PostgreSQL-ready through environment-driven configuration.
- The first web-admin path for local setup is `/auth/bootstrap-admin`, which exists so the initial admin can be created without using external providers or Django admin UI.
- Existing user changes outside the new HRMS scaffold, including unrelated modifications in tracked files, should not be reverted unless explicitly requested.

