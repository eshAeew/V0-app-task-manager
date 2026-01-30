import type { Task, Category, Status, CustomList } from "./types";
import { DEFAULT_CATEGORIES } from "./types";

// Re-export for convenience
export const CATEGORIES = DEFAULT_CATEGORIES;

export const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Design new dashboard layout",
    description: "Create wireframes and mockups for the new admin dashboard with modern bento-style layout",
    status: "in-progress",
    priority: "high",
    category: "design",
    dueDate: "2026-01-30",
    tags: ["ui", "dashboard", "priority"],
    createdAt: "2026-01-20",
    isFavorite: true,
    subtasks: [
      { id: "1-1", title: "Create wireframes", completed: true },
      { id: "1-2", title: "Design mockups", completed: false },
      { id: "1-3", title: "Get feedback", completed: false },
    ],
  },
  {
    id: "2",
    title: "Implement authentication flow",
    description: "Set up OAuth integration with Google and GitHub providers. Include proper error handling and session management.",
    status: "todo",
    priority: "urgent",
    category: "development",
    dueDate: "2026-01-28",
    tags: ["backend", "security"],
    createdAt: "2026-01-21",
    reminder: "2026-01-27T09:00:00",
    isFavorite: true,
  },
  {
    id: "3",
    title: "Review Q4 reports",
    description: "Analyze quarterly performance metrics and prepare summary for stakeholders",
    status: "review",
    priority: "medium",
    category: "work",
    dueDate: "2026-01-29",
    tags: ["reports", "analysis"],
    createdAt: "2026-01-19",
  },
  {
    id: "4",
    title: "Update user documentation",
    description: "Refresh the getting started guide and API documentation with latest features",
    status: "done",
    priority: "low",
    category: "development",
    dueDate: "2026-01-25",
    tags: ["docs", "maintenance"],
    createdAt: "2026-01-15",
  },
  {
    id: "5",
    title: "Plan team offsite",
    description: "Organize the annual team building event, including venue booking and activities planning",
    status: "todo",
    priority: "medium",
    category: "personal",
    dueDate: "2026-02-15",
    tags: ["team", "planning"],
    createdAt: "2026-01-22",
  },
  {
    id: "6",
    title: "Optimize database queries",
    description: "Profile and improve slow queries identified in the performance audit",
    status: "in-progress",
    priority: "high",
    category: "development",
    dueDate: "2026-01-31",
    tags: ["performance", "backend"],
    createdAt: "2026-01-18",
    subtasks: [
      { id: "6-1", title: "Identify slow queries", completed: true },
      { id: "6-2", title: "Add indexes", completed: true },
      { id: "6-3", title: "Test improvements", completed: false },
    ],
  },
  {
    id: "7",
    title: "Create marketing assets",
    description: "Design social media graphics and email templates for product launch",
    status: "review",
    priority: "high",
    category: "design",
    dueDate: "2026-01-28",
    tags: ["marketing", "design"],
    createdAt: "2026-01-17",
  },
  {
    id: "8",
    title: "Fix mobile navigation bug",
    description: "Resolve the hamburger menu issue reported on iOS devices",
    status: "done",
    priority: "urgent",
    category: "development",
    dueDate: "2026-01-24",
    tags: ["bug", "mobile"],
    createdAt: "2026-01-20",
  },
];

export const INITIAL_LISTS: CustomList[] = [
  { id: "default", name: "My Tasks", color: "#6366f1", createdAt: "2026-01-01" },
];

export function getTasksByStatus(tasks: Task[], status: Status): Task[] {
  return tasks.filter((task) => task.status === status && !task.isArchived);
}

export function getCategories(): Category[] {
  return DEFAULT_CATEGORIES;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
