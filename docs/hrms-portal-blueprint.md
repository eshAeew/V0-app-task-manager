# Northstar HRMS Portal Blueprint

## Product Direction

Northstar HRMS Portal is a native employee management and workplace operations platform. It combines HRMS workflows, attendance, leave, payroll, project delivery, approvals, internal mail, chat, calendar, documents, and analytics in one product. The system is explicitly designed without relying on Microsoft 365, external calendar APIs, WhatsApp, or third-party productivity SaaS integrations.

## Current Implementation Baseline

- Repository folder name: `Main Project`
- Frontend codebase: this repository's Next.js app
- Existing work hub reference: the original `Bento` task manager in [app/page.tsx](C:/All my things/Final year project/Main Project/app/page.tsx)
- Backend codebase: Django scaffold under [backend](C:/All my things/Final year project/Main Project/backend)
- Current implementation status:
  - Portal shell and route-based module scaffolding added
  - Root route now lands on the HRMS dashboard rather than the task workspace
  - First 10 requested auth and access features are now implemented in a working development slice
  - Auth flow UI is wired for request access, bootstrap admin, password setup, password sign-in, and OTP verification
  - Django project scaffold now exposes working auth endpoints, admin verification queue endpoints, session endpoints, and core domain app boundaries
  - initial Django migrations have been generated and applied to the local SQLite development database
  - Product memory rewritten to reflect the new architecture
  - repository references and Markdown paths updated from `Task-manager-UI-reference` to `Main Project`

## Module Map

- Authentication and access: access requests, admin verification, password setup, password login, email OTP, session management
- Organization and employees: branches, departments, designations, profiles, hierarchy, documents, onboarding, offboarding
- Attendance: clock-in, clock-out, breaks, shifts, regularization, anomalies
- Leave and travel: balances, requests, approvals, comp-off, travel, reimbursements
- Payroll: profiles, salary components, cycles, payslips, payroll review and locking
- Projects and tasks: projects, groups, milestones, task approvals, reminders, dependencies, analytics, calendar visibility
- Calendar: native event storage for personal, team, shift, leave, and project views
- Internal mail: inbox, sent, drafts, trash, threading, rules, approval-based notices
- Chat: direct chat, groups, project channels, presence, broadcasts
- Documents: rich text documents, templates, versions, comments, approvals, exports
- Announcements: targeted notices and acknowledgements
- Approvals: central maker-checker workflow engine
- Reports: dashboards, saved reports, scheduled exports, workforce analytics
- Admin: roles, permissions, settings, feature flags, retention, audit controls

## Auth and Security

- Source of truth flow:
  1. Employee submits access request
  2. Admin or HR verifies and approves
  3. Employee sets password
  4. Employee signs in with email and password
  5. Employee verifies email OTP
  6. Portal session is issued
- Current backend implementation already includes the first API scaffold for this flow.
- Current working feature set for the first requested auth block:
  - Access request creation
  - Admin verification queue
  - Approve request
  - Reject request
  - Password setup link generation
  - Password login
  - Email OTP verification
  - OTP resend
  - Session listing
  - Temporary account lockout after repeated failed login attempts
- Security direction:
  - Argon2 password hashing
  - Hashed OTP storage
  - Hashed password setup tokens
  - Session revocation support
  - Audit-ready domain boundaries
  - Role and permission modeling through `rbac`

## Backend Structure

- Django project package: `hrms_backend`
- Root API prefix: `/api/v1`
- Implemented endpoints:
  - `/health/`
  - `/auth/bootstrap-state`
  - `/auth/bootstrap-admin`
  - `/auth/access-request`
  - `/auth/access-requests`
  - `/auth/access-request/{id}/approve`
  - `/auth/access-request/{id}/reject`
  - `/auth/set-password`
  - `/auth/login`
  - `/auth/verify-otp`
  - `/auth/resend-otp`
  - `/auth/me`
  - `/auth/sessions`
  - `/auth/refresh`
  - `/auth/logout`
- Domain apps currently scaffolded:
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

## Frontend Structure

- Root landing route: [app/page.tsx](C:/All my things/Final year project/Main Project/app/page.tsx)
- Current portal route shell: [app/(portal)/layout.tsx](C:/All my things/Final year project/Main Project/app/(portal)/layout.tsx)
- Dashboard route: [app/(portal)/dashboard/page.tsx](C:/All my things/Final year project/Main Project/app/(portal)/dashboard/page.tsx)
- Shared dashboard content: [components/hrms/dashboard-overview.tsx](C:/All my things/Final year project/Main Project/components/hrms/dashboard-overview.tsx)
- Protected access enforcement: [components/hrms/protected-portal.tsx](C:/All my things/Final year project/Main Project/components/hrms/protected-portal.tsx)
- Auth state client: [components/hrms/auth-provider.tsx](C:/All my things/Final year project/Main Project/components/hrms/auth-provider.tsx)
- Auth API client: [lib/auth-client.ts](C:/All my things/Final year project/Main Project/lib/auth-client.ts)
- Dynamic module pages: [app/(portal)/[module]/page.tsx](C:/All my things/Final year project/Main Project/app/(portal)/[module]/page.tsx)
- Work hub route: [app/(portal)/tasks/workspace/page.tsx](C:/All my things/Final year project/Main Project/app/(portal)/tasks/workspace/page.tsx)
- Auth routes:
  - [app/auth/bootstrap-admin/page.tsx](C:/All my things/Final year project/Main Project/app/auth/bootstrap-admin/page.tsx)
  - [app/auth/request-access/page.tsx](C:/All my things/Final year project/Main Project/app/auth/request-access/page.tsx)
  - [app/auth/set-password/page.tsx](C:/All my things/Final year project/Main Project/app/auth/set-password/page.tsx)
  - [app/auth/sign-in/page.tsx](C:/All my things/Final year project/Main Project/app/auth/sign-in/page.tsx)
  - [app/auth/verify-otp/page.tsx](C:/All my things/Final year project/Main Project/app/auth/verify-otp/page.tsx)
- Admin support routes:
  - [app/(portal)/admin/access-requests/page.tsx](C:/All my things/Final year project/Main Project/app/(portal)/admin/access-requests/page.tsx)
  - [app/(portal)/admin/sessions/page.tsx](C:/All my things/Final year project/Main Project/app/(portal)/admin/sessions/page.tsx)
- Shared module metadata and navigation live in [lib/hrms-data.ts](C:/All my things/Final year project/Main Project/lib/hrms-data.ts).

## Delivery Sequence

1. Foundation
   - Portal shell
   - Documentation system
   - Django project
   - Access request auth flow
   - RBAC and organization modeling
2. HR operations
   - Employee records
   - Attendance
   - Leave
   - Reimbursements
   - Payroll base workflows
3. Work hub
   - Projects
   - Task approvals
   - Project groups
   - Task-calendar linkage
   - Analytics and notifications
4. Native collaboration
   - Internal mail
   - Chat and channels
   - Announcements
   - Unified native calendar
5. Knowledge and operations maturity
   - Documents
   - Helpdesk
   - Performance flows
   - Reporting
   - Admin hardening

## Documentation Rule

- `PROJECT_MEMORY.md` must always represent the actual current implementation and constraints.
- This blueprint file should stay as the structured product and architecture map.
- Neither file should become a chat log or chronological session dump.

