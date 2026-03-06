export type PortalModuleKey =
  | "employees"
  | "attendance"
  | "leave"
  | "payroll"
  | "projects"
  | "tasks"
  | "calendar"
  | "mail"
  | "chat"
  | "documents"
  | "announcements"
  | "approvals"
  | "reports"
  | "admin";

export type PortalIcon =
  | "badge-check"
  | "briefcase-business"
  | "calendar-days"
  | "calendar-range"
  | "chart-column"
  | "clock-3"
  | "file-text"
  | "layout-dashboard"
  | "list-todo"
  | "mail"
  | "megaphone"
  | "messages-square"
  | "shield-check"
  | "users"
  | "wallet";

export interface PortalNavItem {
  label: string;
  href: string;
  icon: PortalIcon;
  description: string;
}

export interface ModuleDefinition {
  key: PortalModuleKey;
  title: string;
  subtitle: string;
  phase: string;
  summary: string;
  focusAreas: string[];
  workflows: string[];
  entities: string[];
  roles: string[];
  quickActions: { label: string; href: string }[];
}

export const portalNavSections: { title: string; items: PortalNavItem[] }[] = [
  {
    title: "Core HR",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "layout-dashboard", description: "Overview, KPIs, approvals, and daily activity." },
      { label: "Employees", href: "/employees", icon: "users", description: "Profiles, hierarchy, documents, and onboarding." },
      { label: "Attendance", href: "/attendance", icon: "clock-3", description: "Clock-in, shifts, break tracking, and anomalies." },
      { label: "Leave", href: "/leave", icon: "calendar-days", description: "Leave policies, requests, balances, and approvals." },
      { label: "Payroll", href: "/payroll", icon: "wallet", description: "Salary structures, payslips, deductions, and payroll cycles." },
    ],
  },
  {
    title: "Work Hub",
    items: [
      { label: "Projects", href: "/projects", icon: "briefcase-business", description: "Projects, groups, milestones, and team delivery." },
      { label: "Tasks", href: "/tasks", icon: "list-todo", description: "Board, calendar, templates, approvals, and workspace." },
      { label: "Calendar", href: "/calendar", icon: "calendar-range", description: "Native personal, team, leave, shift, and project calendars." },
      { label: "Mail", href: "/mail", icon: "mail", description: "Internal inbox, drafts, rules, and approval-based notices." },
      { label: "Chat", href: "/chat", icon: "messages-square", description: "Direct messages, channels, presence, and broadcasts." },
      { label: "Documents", href: "/documents", icon: "file-text", description: "Rich documents, templates, approvals, and version history." },
    ],
  },
  {
    title: "Governance",
    items: [
      { label: "Announcements", href: "/announcements", icon: "megaphone", description: "Broadcast updates, policy notices, and targeting." },
      { label: "Approvals", href: "/approvals", icon: "badge-check", description: "Maker-checker queues, escalations, and approvals inbox." },
      { label: "Reports", href: "/reports", icon: "chart-column", description: "Workforce, payroll, project, and attendance analytics." },
      { label: "Admin", href: "/admin", icon: "shield-check", description: "Roles, settings, feature flags, retention, and audit controls." },
    ],
  },
];

export const moduleDefinitions: Record<PortalModuleKey, ModuleDefinition> = {
  employees: {
    key: "employees",
    title: "Employee Management",
    subtitle: "Profiles, hierarchy, and records",
    phase: "Phase 1",
    summary: "Central employee records for profiles, departments, reporting lines, onboarding, offboarding, and secured documents.",
    focusAreas: ["Employee directory and profile detail", "Organization hierarchy and reporting structure", "Document vault, contacts, skills, and certifications"],
    workflows: ["Onboard a new employee after access approval", "Update reporting manager and department assignments", "Track onboarding, assets, and offboarding clearance"],
    entities: ["EmployeeProfile", "Department", "Branch", "Designation", "EmployeeDocument"],
    roles: ["HR Admin", "HR Ops", "Department Head", "Employee"],
    quickActions: [{ label: "Open Dashboard", href: "/dashboard" }, { label: "Review Approvals", href: "/approvals" }],
  },
  attendance: {
    key: "attendance",
    title: "Attendance and Time",
    subtitle: "Clock-in, shifts, and exceptions",
    phase: "Phase 2",
    summary: "Attendance foundation covering login clock-in, clock-out, shift assignment, regularization, overtime, and anomaly review.",
    focusAreas: ["Clock-in and clock-out sessions", "Shift rosters and break tracking", "Attendance anomaly queue and regularization"],
    workflows: ["Start and close attendance sessions", "Approve missing punch and correction requests", "Review late marks and overtime summaries"],
    entities: ["Shift", "AttendanceSession", "AttendancePolicy"],
    roles: ["HR Ops", "Department Head", "Employee"],
    quickActions: [{ label: "View Calendar", href: "/calendar" }, { label: "Open Reports", href: "/reports" }],
  },
  leave: {
    key: "leave",
    title: "Leave and Travel",
    subtitle: "Policies, balances, and approvals",
    phase: "Phase 2",
    summary: "Manage leave balances, leave requests, comp-off, travel requests, and approval routing tied to attendance and payroll.",
    focusAreas: ["Leave policy and balance setup", "Approval chains and holiday logic", "Travel request and reimbursement linkage"],
    workflows: ["Submit leave and manager approval", "Track comp-off accrual and use", "Review travel approval and settlement"],
    entities: ["LeavePolicy", "LeaveBalance", "LeaveRequest", "TravelRequest"],
    roles: ["HR Admin", "Department Head", "Employee", "Finance Admin"],
    quickActions: [{ label: "View Calendar", href: "/calendar" }, { label: "Approval Inbox", href: "/approvals" }],
  },
  payroll: {
    key: "payroll",
    title: "Payroll",
    subtitle: "Cycles, payslips, and compliance-ready foundation",
    phase: "Phase 2",
    summary: "Payroll foundation for salary structures, earnings, deductions, attendance-linked processing, advances, and payslip generation.",
    focusAreas: ["Salary components and payroll cycles", "Attendance-linked calculations", "Payslip publishing and audit-ready locking"],
    workflows: ["Set payroll profiles and salary structures", "Run monthly payroll draft and review", "Lock payroll cycle and publish payslips"],
    entities: ["PayrollProfile", "SalaryComponent", "PayrollCycle", "Payslip"],
    roles: ["Finance Admin", "HR Admin", "Auditor"],
    quickActions: [{ label: "Open Reports", href: "/reports" }, { label: "Admin Controls", href: "/admin" }],
  },
  projects: {
    key: "projects",
    title: "Projects",
    subtitle: "Project groups, milestones, and delivery",
    phase: "Phase 3",
    summary: "Project management area for project creation, manager ownership, team membership, groups, milestones, and delivery tracking.",
    focusAreas: ["Projects, groups, and memberships", "Milestones and sprint delivery", "Project calendars and project-specific permissions"],
    workflows: ["Create a project and assign a manager", "Open a project group and add members", "Track milestones, blockers, and health"],
    entities: ["Project", "ProjectMembership", "ProjectGroup", "Milestone"],
    roles: ["Org Admin", "Project Manager", "Team Lead", "Employee"],
    quickActions: [{ label: "Open Task Workspace", href: "/tasks/workspace" }, { label: "Project Calendar", href: "/calendar" }],
  },
  tasks: {
    key: "tasks",
    title: "Task Management",
    subtitle: "Boards, approvals, and the work hub",
    phase: "Phase 3",
    summary: "Work hub built from the reference task manager with multi-user projects, approvals, templates, reminders, dependencies, and analytics.",
    focusAreas: ["Reusable board, calendar, and analytics views", "Task approval by higher authority", "Project-linked statuses, lists, reminders, and templates"],
    workflows: ["Create tasks requiring approval before activation", "Move tasks across custom statuses and lists", "Sync due dates and reminders into the native calendar"],
    entities: ["Task", "TaskStatus", "TaskTemplate", "TaskApproval", "TaskComment"],
    roles: ["Project Manager", "Team Lead", "Employee", "Admin"],
    quickActions: [{ label: "Launch Workspace", href: "/tasks/workspace" }, { label: "View Project Hub", href: "/projects" }],
  },
  calendar: {
    key: "calendar",
    title: "Native Calendar",
    subtitle: "Personal, team, project, and HR calendars",
    phase: "Phase 4",
    summary: "Self-owned calendar system for meetings, shifts, leaves, due dates, project events, and approval-linked scheduling.",
    focusAreas: ["Personal, team, leave, shift, and project overlays", "Task-to-calendar visibility and reminders", "Role-aware event visibility and scheduling"],
    workflows: ["See upcoming tasks and leave events in one place", "Create project-specific calendar instances", "Surface attendance and shift events to managers"],
    entities: ["CalendarEvent", "CalendarInstance", "ReminderRule"],
    roles: ["Employee", "Project Manager", "Department Head", "HR Ops"],
    quickActions: [{ label: "Open Tasks", href: "/tasks" }, { label: "Open Attendance", href: "/attendance" }],
  },
  mail: {
    key: "mail",
    title: "Internal Mail",
    subtitle: "Company inbox, drafts, rules, and notices",
    phase: "Phase 4",
    summary: "Internal-only mailbox system with folders, threaded conversations, drafts, rules, search, and approval-based outgoing notices.",
    focusAreas: ["Inbox, sent, drafts, and trash", "Threading, search, labels, and rules", "Approval-based outbound notices inside the company"],
    workflows: ["Compose internal notices and save drafts", "Run mail rules against incoming messages", "Approve sensitive organization-wide notices before delivery"],
    entities: ["MailboxThread", "MailboxMessage", "MailboxRule"],
    roles: ["Employee", "Department Head", "HR Admin", "Admin"],
    quickActions: [{ label: "Open Announcements", href: "/announcements" }, { label: "Review Approvals", href: "/approvals" }],
  },
  chat: {
    key: "chat",
    title: "Chat and Channels",
    subtitle: "Direct chat, groups, channels, and presence",
    phase: "Phase 4",
    summary: "Teams-like native chat for direct conversations, group rooms, project channels, presence, and task-linked discussion.",
    focusAreas: ["Direct and group chat", "Project channels and broadcasts", "Presence, mentions, pinned messages, and search"],
    workflows: ["Open a project room when a project starts", "Discuss task updates inside task-linked channels", "Target department or company broadcasts"],
    entities: ["ChatChannel", "ChatMembership", "ChatMessage", "PresenceState"],
    roles: ["Employee", "Project Manager", "Department Head", "Admin"],
    quickActions: [{ label: "Open Projects", href: "/projects" }, { label: "Open Tasks", href: "/tasks" }],
  },
  documents: {
    key: "documents",
    title: "Documents",
    subtitle: "Rich text, templates, versions, and approvals",
    phase: "Phase 5",
    summary: "Native Word-like document system for rich text, templates, comments, approvals, policy documents, and version history.",
    focusAreas: ["Rich text editor and reusable templates", "Versioning and inline comments", "Approval workflows, policy docs, and exports"],
    workflows: ["Draft policy or meeting note documents", "Review and approve document versions", "Export approved content to PDF or DOCX"],
    entities: ["Document", "DocumentVersion", "DocumentComment", "DocumentTemplate"],
    roles: ["HR Admin", "Department Head", "Employee", "Admin"],
    quickActions: [{ label: "Open Announcements", href: "/announcements" }, { label: "Open Admin", href: "/admin" }],
  },
  announcements: {
    key: "announcements",
    title: "Announcements",
    subtitle: "Broadcasts, notices, and acknowledgements",
    phase: "Phase 4",
    summary: "Organization-wide and targeted announcements with audience filters, approvals, acknowledgements, and delivery tracking inside the portal.",
    focusAreas: ["Broadcasts by company, branch, department, or project", "Approval gates for sensitive notices", "Acknowledgements for policy or compliance updates"],
    workflows: ["Publish targeted announcements", "Require employee acknowledgement", "Escalate overdue acknowledgements"],
    entities: ["Announcement", "AnnouncementAudience", "Acknowledgement"],
    roles: ["HR Admin", "Org Admin", "Department Head"],
    quickActions: [{ label: "Open Mail", href: "/mail" }, { label: "Approval Inbox", href: "/approvals" }],
  },
  approvals: {
    key: "approvals",
    title: "Approvals",
    subtitle: "Central inbox for maker-checker workflows",
    phase: "Phase 2",
    summary: "Shared approvals engine for access requests, leaves, reimbursements, tasks, documents, payroll actions, and administrative changes.",
    focusAreas: ["Central approvals inbox", "Rule-based routing and escalations", "Maker-checker governance and auditability"],
    workflows: ["Approve access requests and account activation", "Approve task creation and sensitive changes", "Route payroll and document approvals"],
    entities: ["ApprovalRule", "ApprovalStep", "ApprovalRequest"],
    roles: ["HR Admin", "Finance Admin", "Department Head", "Auditor"],
    quickActions: [{ label: "Open Dashboard", href: "/dashboard" }, { label: "Admin Settings", href: "/admin" }],
  },
  reports: {
    key: "reports",
    title: "Reports and Analytics",
    subtitle: "Workforce, attendance, payroll, and project insight",
    phase: "Phase 5",
    summary: "Reporting workspace for saved reports, scheduled exports, attendance summaries, payroll analytics, and project health dashboards.",
    focusAreas: ["Role-based dashboards and saved reports", "Scheduled exports and analytics snapshots", "Cross-module visibility into workforce and delivery"],
    workflows: ["Review attendance exceptions by department", "Run payroll and headcount analytics", "Monitor project health and overdue tasks"],
    entities: ["ReportDefinition", "ReportRun", "DashboardWidget"],
    roles: ["Org Admin", "HR Admin", "Finance Admin", "Auditor"],
    quickActions: [{ label: "Open Payroll", href: "/payroll" }, { label: "Open Attendance", href: "/attendance" }],
  },
  admin: {
    key: "admin",
    title: "Administration",
    subtitle: "Roles, settings, retention, and platform controls",
    phase: "Phase 1-5",
    summary: "Control center for roles, permissions, branding, retention policies, imports, exports, feature flags, and operational monitoring.",
    focusAreas: ["RBAC and scoped permissions", "Branding, feature flags, and master data", "Retention, access review, and system health"],
    workflows: ["Define roles and permission scopes", "Configure module-level settings and defaults", "Review audit and monitoring events"],
    entities: ["Role", "Permission", "FeatureFlag", "RetentionPolicy", "AuditEvent"],
    roles: ["Super Admin", "Org Admin", "Auditor"],
    quickActions: [{ label: "Access Queue", href: "/admin/access-requests" }, { label: "Session Management", href: "/admin/sessions" }],
  },
};

export const dashboardStats = [
  { label: "Pending Access Requests", value: "14", note: "Awaiting HR or admin verification" },
  { label: "Today Clocked In", value: "182", note: "Employees with active attendance sessions" },
  { label: "Tasks Awaiting Approval", value: "37", note: "Maker-checker rules currently blocking release" },
  { label: "Projects in Motion", value: "23", note: "Active groups with task or calendar activity" },
];

export const dashboardHighlights = [
  "Use the existing task-manager UI as the Phase 3 work hub foundation rather than rewriting it.",
  "Keep authentication native: access request, admin approval, password setup, password login, and email OTP verification.",
  "Treat mail, calendar, chat, and documents as self-owned product modules with no external provider APIs.",
];

export const authFlowSteps = [
  "Submit a company email access request.",
  "Wait for admin or HR verification.",
  "Set your password from the activation link.",
  "Sign in with email and password.",
  "Enter the one-time password sent to your email.",
];

export const validPortalModules = Object.keys(moduleDefinitions) as PortalModuleKey[];
