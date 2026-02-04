export type BentoWidgetType =
  | "task-overview"
  | "total-tasks"
  | "priority-tower"
  | "completed"
  | "upcoming"
  | "new-task"
  | "streak"
  | "in-progress"
  | "categories"
  | "recent-tasks"
  // Knowledge & Curiosity
  | "random-wiki-fact"
  | "on-this-day"
  | "word-of-day"
  | "did-you-know"
  | "mini-trivia"
  // Motivation & Mind
  | "random-quote"
  | "daily-intention"
  | "mood-check"
  | "breathing-box"
  // Utilities & Live Data
  | "weather"
  | "clock"
  | "location"
  // Productivity Boosters
  | "todays-tasks"
  | "upcoming-deadlines"
  | "pomodoro"
  | "quick-notes"
  | "recently-completed"
  // Fun & Personal
  | "random-emoji"
  | "mini-poll"
  | "surprise-me";

export interface BentoWidget {
  id: string;
  type: BentoWidgetType;
  name: string;
  description: string;
  category: "productivity" | "knowledge" | "motivation" | "utilities" | "fun";
  icon: string;
  defaultSize: "small" | "medium" | "large";
}

export const AVAILABLE_WIDGETS: BentoWidget[] = [
  // Productivity
  {
    id: "task-overview",
    type: "task-overview",
    name: "Task Overview",
    description: "Completion rate and task summary",
    category: "productivity",
    icon: "LayoutDashboard",
    defaultSize: "large",
  },
  {
    id: "total-tasks",
    type: "total-tasks",
    name: "Total Tasks",
    description: "Total tasks count with top category",
    category: "productivity",
    icon: "ListTodo",
    defaultSize: "medium",
  },
  {
    id: "priority-tower",
    type: "priority-tower",
    name: "Priority Tower",
    description: "Tasks grouped by priority level",
    category: "productivity",
    icon: "Flag",
    defaultSize: "medium",
  },
  {
    id: "completed",
    type: "completed",
    name: "Completed",
    description: "Completed tasks count",
    category: "productivity",
    icon: "CheckCircle2",
    defaultSize: "small",
  },
  {
    id: "upcoming",
    type: "upcoming",
    name: "Upcoming",
    description: "Upcoming tasks list",
    category: "productivity",
    icon: "Calendar",
    defaultSize: "medium",
  },
  {
    id: "new-task",
    type: "new-task",
    name: "New Task",
    description: "Quick add new task button",
    category: "productivity",
    icon: "Plus",
    defaultSize: "small",
  },
  {
    id: "streak",
    type: "streak",
    name: "Streak",
    description: "Your productivity streak",
    category: "productivity",
    icon: "Zap",
    defaultSize: "small",
  },
  {
    id: "in-progress",
    type: "in-progress",
    name: "In Progress",
    description: "Tasks currently in progress",
    category: "productivity",
    icon: "Clock",
    defaultSize: "small",
  },
  {
    id: "categories",
    type: "categories",
    name: "Categories",
    description: "Task categories breakdown",
    category: "productivity",
    icon: "FolderOpen",
    defaultSize: "medium",
  },
  {
    id: "recent-tasks",
    type: "recent-tasks",
    name: "Recent Tasks",
    description: "Recently created tasks",
    category: "productivity",
    icon: "Clock",
    defaultSize: "large",
  },
  {
    id: "todays-tasks",
    type: "todays-tasks",
    name: "Today's Tasks",
    description: "Tasks due today",
    category: "productivity",
    icon: "Sun",
    defaultSize: "medium",
  },
  {
    id: "upcoming-deadlines",
    type: "upcoming-deadlines",
    name: "Upcoming Deadlines",
    description: "Next 3 urgent tasks",
    category: "productivity",
    icon: "AlertCircle",
    defaultSize: "medium",
  },
  {
    id: "pomodoro",
    type: "pomodoro",
    name: "Pomodoro Timer",
    description: "Focus session timer",
    category: "productivity",
    icon: "Timer",
    defaultSize: "medium",
  },
  {
    id: "quick-notes",
    type: "quick-notes",
    name: "Quick Notes",
    description: "Sticky-note style scratchpad",
    category: "productivity",
    icon: "StickyNote",
    defaultSize: "medium",
  },
  {
    id: "recently-completed",
    type: "recently-completed",
    name: "Recently Completed",
    description: "Small win recap",
    category: "productivity",
    icon: "Trophy",
    defaultSize: "medium",
  },
  // Knowledge & Curiosity
  {
    id: "random-wiki-fact",
    type: "random-wiki-fact",
    name: "Random Wiki Fact",
    description: "One surprising fact, refreshes daily",
    category: "knowledge",
    icon: "BookOpen",
    defaultSize: "medium",
  },
  {
    id: "on-this-day",
    type: "on-this-day",
    name: "On This Day",
    description: "Historical events that happened today",
    category: "knowledge",
    icon: "History",
    defaultSize: "medium",
  },
  {
    id: "word-of-day",
    type: "word-of-day",
    name: "Word of the Day",
    description: "Meaning, usage, pronunciation",
    category: "knowledge",
    icon: "Type",
    defaultSize: "medium",
  },
  {
    id: "did-you-know",
    type: "did-you-know",
    name: "Did You Know?",
    description: "Science, tech, space, or math nuggets",
    category: "knowledge",
    icon: "Lightbulb",
    defaultSize: "small",
  },
  {
    id: "mini-trivia",
    type: "mini-trivia",
    name: "Mini Trivia",
    description: "One question, tap to reveal answer",
    category: "knowledge",
    icon: "HelpCircle",
    defaultSize: "medium",
  },
  // Motivation & Mind
  {
    id: "random-quote",
    type: "random-quote",
    name: "Random Quote",
    description: "Motivation, philosophy, or humor",
    category: "motivation",
    icon: "Quote",
    defaultSize: "medium",
  },
  {
    id: "daily-intention",
    type: "daily-intention",
    name: "Daily Intention",
    description: "One short focus for the day",
    category: "motivation",
    icon: "Target",
    defaultSize: "small",
  },
  {
    id: "mood-check",
    type: "mood-check",
    name: "Mood Check",
    description: "Select mood, track over time",
    category: "motivation",
    icon: "Smile",
    defaultSize: "small",
  },
  {
    id: "breathing-box",
    type: "breathing-box",
    name: "Breathing Box",
    description: "30-second guided breathing",
    category: "motivation",
    icon: "Wind",
    defaultSize: "medium",
  },
  // Utilities & Live Data
  {
    id: "weather",
    type: "weather",
    name: "Weather",
    description: "Full weather with hourly chart, 7-day forecast, humidity, wind",
    category: "utilities",
    icon: "Cloud",
    defaultSize: "large",
  },
  {
    id: "clock",
    type: "clock",
    name: "Clock",
    description: "Local time or chosen city",
    category: "utilities",
    icon: "Clock",
    defaultSize: "small",
  },
  {
    id: "location",
    type: "location",
    name: "Location",
    description: "City, country, sunrise/sunset",
    category: "utilities",
    icon: "MapPin",
    defaultSize: "small",
  },
  // Fun & Personal
  {
    id: "random-emoji",
    type: "random-emoji",
    name: "Random Emoji",
    description: "Changes every refresh",
    category: "fun",
    icon: "Smile",
    defaultSize: "small",
  },
  {
    id: "mini-poll",
    type: "mini-poll",
    name: "Mini Poll",
    description: "Simple this or that",
    category: "fun",
    icon: "Vote",
    defaultSize: "small",
  },
  {
    id: "surprise-me",
    type: "surprise-me",
    name: "Surprise Me",
    description: "Randomly swaps between tiles",
    category: "fun",
    icon: "Shuffle",
    defaultSize: "small",
  },
];

export interface ActiveBentoWidget {
  id: string;
  widgetId: string;
  position: number;
}

export const DEFAULT_ACTIVE_WIDGETS: ActiveBentoWidget[] = [
  { id: "1", widgetId: "task-overview", position: 0 },
  { id: "2", widgetId: "total-tasks", position: 1 },
  { id: "3", widgetId: "priority-tower", position: 2 },
  { id: "4", widgetId: "completed", position: 3 },
  { id: "5", widgetId: "upcoming", position: 4 },
  { id: "6", widgetId: "new-task", position: 5 },
  { id: "7", widgetId: "streak", position: 6 },
  { id: "8", widgetId: "in-progress", position: 7 },
  { id: "9", widgetId: "categories", position: 8 },
  { id: "10", widgetId: "recent-tasks", position: 9 },
];
