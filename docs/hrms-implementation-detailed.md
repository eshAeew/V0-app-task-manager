# Northstar HRMS Portal Implementation Detail

## Purpose Of This Document

This document is a detailed implementation walkthrough of what has been built in this repository so far, from the original state of the project through the current HRMS portal foundation. Unlike `PROJECT_MEMORY.md`, which is intended to stay as a clean current-state summary for other AI agents, this file explains the transformation in detail and captures the reasoning, architecture changes, route structure, backend setup, auth feature implementation, branding changes, verification steps, and current limitations.

## 1. Initial Repository State

The repository started as a frontend-heavy Next.js task-management UI reference app branded as `Bento`.

Initial characteristics:

- Framework: Next.js 16 App Router
- Frontend language: TypeScript with React 19
- Styling: Tailwind CSS 4 with Radix and shadcn-style components
- Persistence: browser `localStorage`
- Architecture: mostly a single large client component in `app/page.tsx`
- Main behavior: task board, task calendar, bento widgets, analytics, notifications, templates, custom lists, custom categories, custom columns, archive, trash, reminders, dependencies, and board interactions
- No real backend
- No database
- No server-side authentication
- No real employee or HRMS domain

The repository was therefore a strong UI reference for task management, but not an HRMS product.

## 2. Product Direction Change

The repo was then repurposed into a new product direction:

- Product name: `Northstar HRMS Portal`
- Primary goal: build a native HRMS and employee management portal
- Core requirement: no dependence on Microsoft 365, WhatsApp APIs, calendar APIs, or third-party productivity SaaS
- Stack direction:
  - Frontend remains React + TypeScript using this Next.js repo
  - Backend becomes Django
- Task manager requirement:
  - Use the existing task manager for inspiration and as a future work-hub feature
  - Do not make the entire application appear to be centered around the old task manager

This changed the repo from “task app first” to “HRMS portal first”.

## 3. Documentation Foundation Added

Two documentation tracks were established:

- `PROJECT_MEMORY.md`
  - Canonical AI-facing current-state summary
  - Clean, structured, not a running log
- `docs/hrms-portal-blueprint.md`
  - Product blueprint and architecture summary
  - Module map, backend structure, auth flow, route design, implementation baseline

Later, this file was added:

- `docs/hrms-implementation-detailed.md`
  - Detailed beginning-to-end implementation explanation
  - Intended for human or AI review when the full evolution matters

## 3.1 Repository Rename

The repository folder itself has now been renamed in the workspace:

- Previous folder name: `Task-manager-UI-reference`
- Current folder name: `Main Project`

This matters because the project documentation uses absolute workspace paths for fast navigation. After the rename, the Markdown documents were updated so their file references now point to:

- `C:/All my things/Final year project/Main Project/...`

This keeps the AI-facing memory file, the product blueprint, and the repository instructions aligned with the real folder structure.

## 4. Frontend Portal Restructure

### 4.1 Root App Identity Change

Originally, the root route `/` rendered the task manager directly.

That was changed so the app now presents as an HRMS portal first:

- `/` now renders the HRMS dashboard experience
- `/dashboard` also renders the dashboard
- the old task manager is no longer the first thing users see

This was done by:

- keeping `TaskManagerPage` exported from `app/page.tsx`
- changing the default export of `app/page.tsx` to render the HRMS dashboard

### 4.2 Portal Shell

A shared portal shell was added in:

- `components/hrms/portal-shell.tsx`

This shell provides:

- left sidebar navigation
- top portal header
- portal identity and portal framing
- links to core modules
- sign-out action
- links to admin queue and session management when appropriate

This made the application feel like one integrated business portal rather than a standalone task app.

### 4.3 Route-Based Module Scaffolding

The HRMS portal was broken into route-based module surfaces under:

- `app/(portal)`

This introduced module routes such as:

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

The dynamic module surface is driven by:

- `lib/hrms-data.ts`
- `components/hrms/module-page.tsx`

Those files define:

- navigation groups
- module metadata
- focus areas
- workflows
- entities
- roles
- quick actions

This means the portal now has a coherent navigation map even before every business module is fully implemented.

### 4.4 Shared Dashboard Content

A reusable dashboard summary component was created:

- `components/hrms/dashboard-overview.tsx`

This component is used by:

- `/`
- `/dashboard`

It centralizes the dashboard content instead of duplicating the same UI in multiple places.

## 5. Task Manager Repositioning

The original task manager was not removed. Instead, it was repositioned as a feature module called the Work Hub.

### 5.1 Reuse Strategy

The old task workspace remains in:

- `app/page.tsx` as `TaskManagerPage`

It is reused through:

- `app/(portal)/tasks/workspace/page.tsx`

This means the task workspace is still available, but now under an HRMS module route instead of being the core identity of the application.

### 5.2 Branding Cleanup

Visible old branding was removed from the task workspace.

Changed areas:

- `components/header.tsx`
  - `Bento` -> `Northstar`
  - `Task Manager` -> `Work Hub`
- bento toggle label changed to `Hub`
- `app/page.tsx`
  - bento view heading changed to `Work Hub`
- `components/resizable-bento-grid.tsx`
  - `Bento` labels changed to `Work Hub`
  - `Add Bento` changed to `Add Widget`
  - `Add Bento Widgets` changed to `Add Workspace Widgets`
- `components/bento-widgets.tsx`
  - hero branding changed from `Bento` to `Work Hub`

Important note:

- internal symbol names such as `ResizableBentoGrid`, `BentoWidgetType`, storage keys, and comments were largely preserved for implementation continuity
- the visible user-facing identity was changed

## 6. Full Portal Access Gating

One major requirement was added:

- nobody should be able to access anything in the app, including the task manager, without logging in

### 6.1 Auth Provider

A client auth state layer was added in:

- `components/hrms/auth-provider.tsx`

It is mounted globally from:

- `app/layout.tsx`

The auth provider handles:

- restoring local session state
- storing access token and refresh token
- refreshing sessions when possible
- exposing login, logout, access-request, OTP, password-setup, and admin queue actions

### 6.2 Auth API Client

The API client abstraction was added in:

- `lib/auth-client.ts`

This file centralizes frontend calls to the Django backend for:

- bootstrap admin
- bootstrap state
- request access
- set password
- login
- verify OTP
- resend OTP
- me
- refresh
- logout
- list sessions
- list access requests
- approve request
- reject request

### 6.3 Protected Portal Wrapper

Portal access is enforced by:

- `components/hrms/protected-portal.tsx`

This wrapper:

- checks auth state
- blocks rendering when the user is anonymous
- redirects anonymous users to sign-in

It now protects:

- root landing `/`
- `/dashboard`
- all portal module routes through `app/(portal)/layout.tsx`
- `/tasks/workspace`

As a result, the app is no longer browsable anonymously.

## 7. Auth Flow UI Added And Then Wired

At first, the auth pages were added only as UI scaffolds. They were later wired to the real backend.

### 7.1 Implemented Auth Routes

The following routes now exist:

- `/auth/bootstrap-admin`
- `/auth/request-access`
- `/auth/set-password`
- `/auth/sign-in`
- `/auth/verify-otp`

### 7.2 Bootstrap Admin

Route:

- `app/auth/bootstrap-admin/page.tsx`

Purpose:

- create the first staff/admin account from the web
- avoid needing external systems or manual Django admin setup for the first login

Behavior:

- checks whether bootstrap is still needed
- allows first admin creation if no staff user exists
- redirects normal operation to sign-in once bootstrap is complete

### 7.3 Access Request Form

Route:

- `app/auth/request-access/page.tsx`

Purpose:

- public entry point for employees
- creates access requests for approval

Fields implemented:

- company email
- employee ID
- department
- designation
- access justification

Behavior:

- submits to backend
- shows success or failure states

### 7.4 Password Sign-In

Route:

- `app/auth/sign-in/page.tsx`

Purpose:

- collect approved user credentials
- start the OTP flow

Behavior:

- submits email and password to backend
- handles invalid credentials
- handles temporary lockout
- stores pending email and debug OTP code for the OTP step
- redirects to `/auth/verify-otp`

### 7.5 OTP Verification

Route:

- `app/auth/verify-otp/page.tsx`

Purpose:

- complete authentication

Behavior:

- reads the pending email from session storage
- verifies the 6-digit OTP
- supports OTP resend
- stores session tokens on success
- redirects to the intended destination or dashboard

### 7.6 Password Setup

Route:

- `app/auth/set-password/page.tsx`

Purpose:

- allow approved users to set a password using a generated setup link

Behavior:

- accepts token from query string
- submits token plus password
- marks setup token as consumed on success

### 7.7 Static Export Compatibility

Because the repo uses:

- `output: 'export'`

Next.js required care around `useSearchParams`.

To resolve that:

- `sign-in`, `verify-otp`, and `set-password` were wrapped in `Suspense`

This prevents static export failures while still allowing query-string based flows.

## 8. Backend Foundation Added

A full Django scaffold was added under:

- `backend`

### 8.1 Infrastructure Files

Added:

- `backend/manage.py`
- `backend/requirements.txt`
- `backend/.env.example`
- `backend/hrms_backend/settings.py`
- `backend/hrms_backend/urls.py`
- `backend/hrms_backend/asgi.py`
- `backend/hrms_backend/wsgi.py`
- `backend/hrms_backend/celery.py`
- `backend/hrms_backend/__init__.py`

### 8.2 Backend App Boundaries

Scaffolded Django apps:

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

These define the domain boundaries for the future HRMS platform even though most of them are still only model scaffolds.

## 9. First 10 Features Implemented In Backend

The first 10 requested features now exist in a development-ready form through the Django backend.

### 9.1 Feature 1: Access Request Form

Implemented through:

- `POST /api/v1/auth/access-request`

Model:

- `AccessRequest`

### 9.2 Feature 2: Admin Verification Queue

Implemented through:

- `GET /api/v1/auth/access-requests`

Frontend route:

- `/admin/access-requests`

### 9.3 Feature 3: Request Approval

Implemented through:

- `POST /api/v1/auth/access-request/{id}/approve`

Behavior:

- marks request as approved
- creates approved user if needed
- issues password setup token
- stores development preview of setup link on the request

### 9.4 Feature 4: Request Rejection

Implemented through:

- `POST /api/v1/auth/access-request/{id}/reject`

### 9.5 Feature 5: Password Setup Link

Implemented through:

- `PasswordSetupToken` model
- `POST /api/v1/auth/set-password`

Behavior:

- hashed token storage
- expiry support
- consumed token tracking

### 9.6 Feature 6: Password Login

Implemented through:

- `POST /api/v1/auth/login`

Behavior:

- validates password
- refuses login if account is locked
- issues OTP if credentials are valid

### 9.7 Feature 7: Email OTP Verification

Implemented through:

- `POST /api/v1/auth/verify-otp`

Behavior:

- validates OTP
- marks OTP consumed
- marks email verified
- creates session

### 9.8 Feature 8: OTP Resend

Implemented through:

- `POST /api/v1/auth/resend-otp`

### 9.9 Feature 9: Session Management

Implemented through:

- `GET /api/v1/auth/sessions`

Frontend route:

- `/admin/sessions`

### 9.10 Feature 10: Account Lockout

Implemented on `User` through:

- `failed_login_attempts`
- `locked_until`
- lock logic after repeated password failures

## 10. Additional Backend Support For Auth

Additional auth endpoints:

- `GET /api/v1/auth/bootstrap-state`
- `POST /api/v1/auth/bootstrap-admin`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

Additional auth implementation files:

- `backend/apps/accounts/models.py`
- `backend/apps/accounts/serializers.py`
- `backend/apps/accounts/views.py`
- `backend/apps/accounts/urls.py`
- `backend/apps/accounts/authentication.py`

Custom authentication:

- bearer-style session token auth was added through `SessionTokenAuthentication`
- the access token format is currently `session-{id}`
- refresh token is hashed and stored in `PortalSession`

This is acceptable for a development slice, but still needs future production hardening.

## 11. Admin Access Queue And Sessions UI

Two authenticated support pages were added:

- `app/(portal)/admin/access-requests/page.tsx`
- `app/(portal)/admin/sessions/page.tsx`

### 11.1 Access Requests Page

Capabilities:

- list requests
- approve request
- reject request
- copy generated setup link after approval

This page is currently restricted to staff users.

### 11.2 Sessions Page

Capabilities:

- list active and historical sessions for the authenticated user
- identify current session
- show user agent and IP address if available

## 12. Backend Models Added Across HRMS Domains

The following models were scaffolded as future domain foundations:

- `Permission`
- `Role`
- `Branch`
- `Department`
- `Designation`
- `EmployeeProfile`
- `EmployeeDocument`
- `Shift`
- `AttendanceSession`
- `LeavePolicy`
- `LeaveRequest`
- `PayrollProfile`
- `SalaryComponent`
- `Payslip`
- `Project`
- `ProjectMembership`
- `ProjectGroup`
- `Milestone`
- `TaskStatus`
- `Task`
- `TaskComment`
- `TaskApproval`
- `CalendarInstance`
- `CalendarEvent`
- `MailboxThread`
- `MailboxMessage`
- `ChatChannel`
- `ChatMembership`
- `ChatMessage`
- `Document`
- `DocumentVersion`
- `ApprovalRule`
- `ApprovalRequest`
- `Notification`
- `AuditEvent`
- `ReportDefinition`

These are not fully wired into the frontend yet, but the structural groundwork exists.

## 13. Dependency Installation And Backend Startup Issues

Initially, Django management commands failed because the backend imported Celery at startup but the required backend packages were not installed in the local Python environment.

Observed blocker:

- `ModuleNotFoundError: No module named 'celery'`

Resolution:

- installed backend requirements from `backend/requirements.txt`

Installed backend support now includes:

- `djangorestframework`
- `django-cors-headers`
- `channels`
- `celery`
- `redis`
- `psycopg`
- `python-dotenv`
- `argon2-cffi`
- `cryptography`

After dependency installation:

- `python manage.py check` passed

## 14. Migration Generation And Application

Initially:

- `python manage.py makemigrations` returned `No changes detected`

This happened because the new apps had no migration packages yet and explicit app targeting was needed.

Resolution:

- ran `python manage.py makemigrations accounts rbac organization employees attendance leave_management payroll projects tasks calendar mailbox chat documents approvals notifications audit reports`

This created initial migrations for all scaffolded apps.

After that:

- `python manage.py migrate` was run successfully

Result:

- local SQLite development database `backend/db.sqlite3` now contains the scaffolded tables
- auth and admin-queue features now have actual database persistence in the dev environment

## 15. Verification Performed

Verified repeatedly during implementation:

- `npm run build`
  - frontend build passes
- `python -m compileall backend`
  - backend Python compilation passes
- `python manage.py check`
  - Django system check passes after dependencies were installed
- `python manage.py migrate`
  - migrations applied successfully
- `python manage.py showmigrations ...`
  - scaffolded app migrations are applied

Known non-blocking warning seen during frontend build:

- `baseline-browser-mapping` data is older than two months

This did not block the build.

## 16. What Works Right Now

Fully usable in development:

- first admin bootstrap
- access request submission
- protected portal redirect behavior
- admin access-request queue
- approve request
- reject request
- development password setup link creation and copy
- password setup page
- password login
- invalid credential handling
- temporary lockout after repeated invalid password attempts
- OTP verification
- OTP resend
- session creation
- session listing
- sign-out
- HRMS dashboard-first landing
- task workspace available only as a protected module

## 17. What Does Not Fully Work Yet

Still mostly scaffolded:

- employee CRUD
- attendance clock-in and clock-out persistence through portal UI
- leave management workflows
- payroll workflows
- project CRUD
- task backend synchronization
- task approval backend linkage
- calendar persistence through HRMS backend
- chat system
- internal mail system
- document editor workflows
- reports module
- deep RBAC enforcement across all modules
- production mail delivery for OTP or setup links

## 18. Current Recommended Local Test Flow

To test the implemented auth slice:

1. Start Django backend from `backend`
2. Start Next.js frontend from repo root
3. Open `/auth/bootstrap-admin`
4. Create the first admin
5. Sign in as admin at `/auth/sign-in`
6. Open `/admin/access-requests`
7. In another browser or private window, submit `/auth/request-access`
8. Approve the request as admin
9. Copy the generated setup link
10. Open `/auth/set-password?token=...`
11. Set the user password
12. Sign in as that user
13. Enter OTP
14. Confirm redirect to dashboard
15. Confirm `/tasks/workspace` is accessible only after login
16. Sign out and confirm protected routes redirect back to sign-in

## 19. Current Architectural Position

The repository is now in an important transition state:

- it is no longer a task-manager-only reference app
- it is not yet a fully complete HRMS platform
- it is now a working HRMS portal foundation with:
  - a real protected app shell
  - a backend
  - a migrated dev database
  - a real auth and access pipeline
  - a retained work-hub feature built from the original task manager

That means the next development slices should build on top of a genuine product foundation rather than continue as disconnected UI mockups.
