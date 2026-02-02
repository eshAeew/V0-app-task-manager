"use client";

import { useMemo } from "react";
import type { Task, Category, Column } from "@/lib/types";
import { DEFAULT_CATEGORIES, DEFAULT_COLUMNS, PRIORITIES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Target,
  Flame,
  ListTodo,
  Timer,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Award,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

interface AnalyticsCardProps {
  tasks: Task[];
  categories?: Category[];
  columns?: Column[];
}

export function AnalyticsCard({
  tasks,
  categories = DEFAULT_CATEGORIES,
  columns = DEFAULT_COLUMNS,
}: AnalyticsCardProps) {
  const stats = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.isArchived && !t.isDeleted);
    const totalTasks = activeTasks.length;
    const completedTasks = activeTasks.filter((t) => t.status === "done").length;
    const inProgressTasks = activeTasks.filter((t) => t.status === "in-progress").length;
    const todoTasks = activeTasks.filter((t) => t.status === "todo").length;
    
    // Due date analysis
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueTasks = activeTasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    });
    
    const dueTodayTasks = activeTasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === today.getTime();
    });
    
    const dueThisWeekTasks = activeTasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return due > today && due <= weekFromNow;
    });

    // Priority breakdown
    const priorityBreakdown = PRIORITIES.map((p) => ({
      ...p,
      count: activeTasks.filter((t) => t.priority === p.value && t.status !== "done").length,
      total: activeTasks.filter((t) => t.priority === p.value).length,
      completed: activeTasks.filter((t) => t.priority === p.value && t.status === "done").length,
    }));

    // Category breakdown
    const categoryBreakdown = categories.map((c) => ({
      ...c,
      total: activeTasks.filter((t) => t.category === c.id).length,
      completed: activeTasks.filter((t) => t.category === c.id && t.status === "done").length,
      inProgress: activeTasks.filter((t) => t.category === c.id && t.status === "in-progress").length,
    }));

    // Status breakdown with percentages
    const statusBreakdown = columns.map((col) => {
      const count = activeTasks.filter((t) => t.status === col.id).length;
      return {
        ...col,
        count,
        percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0,
      };
    });

    // Streak (days with completed tasks)
    const completedDates = tasks
      .filter((t) => t.status === "done" && !t.isDeleted)
      .map((t) => t.createdAt.split("T")[0])
      .sort()
      .reverse();
    
    let streak = 0;
    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split("T")[0];
    
    if (completedDates.includes(todayStr)) {
      streak = 1;
      let checkDate = new Date(today.getTime() - 86400000);
      while (completedDates.includes(checkDate.toISOString().split("T")[0])) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      }
    } else if (completedDates.includes(yesterdayStr)) {
      streak = 1;
      let checkDate = new Date(today.getTime() - 2 * 86400000);
      while (completedDates.includes(checkDate.toISOString().split("T")[0])) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      }
    }

    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Time estimates
    const tasksWithEstimate = activeTasks.filter((t) => t.timeEstimate);
    const totalEstimatedTime = tasksWithEstimate.reduce((sum, t) => sum + (t.timeEstimate || 0), 0);
    const avgEstimate = tasksWithEstimate.length > 0
      ? Math.round(totalEstimatedTime / tasksWithEstimate.length)
      : 0;
    const remainingEstimatedTime = activeTasks
      .filter((t) => t.timeEstimate && t.status !== "done")
      .reduce((sum, t) => sum + (t.timeEstimate || 0), 0);

    // Favorites and pinned
    const favoriteTasks = activeTasks.filter((t) => t.isFavorite).length;
    const pinnedTasks = activeTasks.filter((t) => t.isPinned).length;

    // Tasks created today/this week
    const createdToday = activeTasks.filter((t) => {
      const created = new Date(t.createdAt);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === today.getTime();
    }).length;

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const createdThisWeek = activeTasks.filter((t) => {
      const created = new Date(t.createdAt);
      return created >= weekAgo;
    }).length;

    // Productivity score (0-100)
    let productivityScore = 0;
    if (totalTasks > 0) {
      const completionWeight = completionRate * 0.4;
      const overdueWeight = Math.max(0, 30 - (overdueTasks.length * 10));
      const streakWeight = Math.min(30, streak * 5);
      productivityScore = Math.round(completionWeight + overdueWeight + streakWeight);
    }

    // High priority incomplete
    const highPriorityIncomplete = activeTasks.filter(
      (t) => t.priority === "high" && t.status !== "done"
    ).length;

    // Weekly activity (last 7 days)
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split("T")[0];
      const dayTasks = tasks.filter((t) => {
        const created = t.createdAt.split("T")[0];
        return created === dateStr && !t.isDeleted;
      });
      const completed = dayTasks.filter((t) => t.status === "done").length;
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.getDate(),
        created: dayTasks.length,
        completed,
      };
    });

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks: overdueTasks.length,
      overdueTasksList: overdueTasks,
      dueTodayTasks: dueTodayTasks.length,
      dueTodayTasksList: dueTodayTasks,
      dueThisWeekTasks: dueThisWeekTasks.length,
      dueThisWeekTasksList: dueThisWeekTasks,
      priorityBreakdown,
      categoryBreakdown,
      statusBreakdown,
      streak,
      completionRate,
      avgEstimate,
      totalEstimatedTime,
      remainingEstimatedTime,
      favoriteTasks,
      pinnedTasks,
      createdToday,
      createdThisWeek,
      productivityScore,
      highPriorityIncomplete,
      weeklyActivity,
    };
  }, [tasks, categories, columns]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Focus";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Productivity Score */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Productivity Score Card */}
        <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20 rounded-3xl flex-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Productivity Score</p>
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-5xl font-bold", getScoreColor(stats.productivityScore))}>
                    {stats.productivityScore}
                  </span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <p className={cn("text-sm font-medium mt-1", getScoreColor(stats.productivityScore))}>
                  {getScoreLabel(stats.productivityScore)}
                </p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-primary/20"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${stats.productivityScore * 2.26} 226`}
                    className={getScoreColor(stats.productivityScore)}
                  />
                </svg>
                <Award className={cn("h-8 w-8", getScoreColor(stats.productivityScore))} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak Card */}
        <Card className="bg-gradient-to-br from-orange-500/5 via-orange-500/10 to-orange-500/5 border-orange-500/20 rounded-3xl md:w-64">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center">
                <Flame className="h-7 w-7 text-orange-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.streak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {stats.streak > 0 
                ? "Keep it up! Complete a task today." 
                : "Complete a task to start your streak!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-card border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ListTodo className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.completedTasks}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.inProgressTasks}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.todoTasks}</p>
                <p className="text-xs text-muted-foreground">To Do</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-card border-border/50 rounded-2xl",
          stats.overdueTasks > 0 && "border-red-500/50 bg-red-500/5"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.overdueTasks}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.favoriteTasks}</p>
                <p className="text-xs text-muted-foreground">Favorites</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview */}
          <Card className="bg-card border-border/50 rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Completion Rate */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Overall Completion</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{stats.completionRate}%</span>
                    {stats.completionRate >= 50 ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    ) : stats.completionRate > 0 ? (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{stats.completedTasks} completed</span>
                  <span>{stats.totalTasks - stats.completedTasks} remaining</span>
                </div>
              </div>

              {/* Status Distribution */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">Status Distribution</p>
                <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                  {stats.statusBreakdown.map((status, index) => (
                    <div
                      key={status.id}
                      className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                      style={{ 
                        width: `${status.percentage}%`,
                        backgroundColor: status.color,
                        marginLeft: index > 0 ? '2px' : '0',
                      }}
                      title={`${status.title}: ${status.count} (${status.percentage}%)`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  {stats.statusBreakdown.map((status) => (
                    <div key={status.id} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm">{status.title}</span>
                      <span className="text-sm font-medium">{status.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card className="bg-card border-border/50 rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-32">
                {stats.weeklyActivity.map((day, index) => {
                  const maxCreated = Math.max(...stats.weeklyActivity.map(d => d.created), 1);
                  const height = (day.created / maxCreated) * 100;
                  const completedHeight = day.created > 0 ? (day.completed / day.created) * height : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center relative h-24">
                        <div 
                          className="w-full max-w-[32px] rounded-t-lg bg-muted transition-all duration-300 absolute bottom-0"
                          style={{ height: `${height}%` }}
                        />
                        <div 
                          className="w-full max-w-[32px] rounded-t-lg bg-primary transition-all duration-300 absolute bottom-0"
                          style={{ height: `${completedHeight}%` }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium">{day.day}</p>
                        <p className="text-[10px] text-muted-foreground">{day.created}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-muted" />
                  <span className="text-xs text-muted-foreground">Created</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span className="text-xs text-muted-foreground">Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="bg-card border-border/50 rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                By Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.categoryBreakdown.map((category) => {
                  const percentage = category.total > 0 
                    ? Math.round((category.completed / category.total) * 100) 
                    : 0;
                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-lg"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {category.completed}/{category.total}
                          </span>
                          <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card className="bg-card border-border/50 rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Due Today</p>
                    <p className="text-xs text-muted-foreground">Urgent attention needed</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-orange-500">{stats.dueTodayTasks}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">This Week</p>
                    <p className="text-xs text-muted-foreground">Plan ahead</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-yellow-500">{stats.dueThisWeekTasks}</span>
              </div>

              {stats.overdueTasks > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Overdue</p>
                      <p className="text-xs text-muted-foreground">Needs immediate action</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-500">{stats.overdueTasks}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Estimates */}
          <Card className="bg-card border-border/50 rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                Time Estimates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xl font-bold">{formatTime(stats.totalEstimatedTime)}</p>
                  <p className="text-xs text-muted-foreground">Total Estimated</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xl font-bold">{formatTime(stats.remainingEstimatedTime)}</p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-center">
                <p className="text-xl font-bold">{formatTime(stats.avgEstimate)}</p>
                <p className="text-xs text-muted-foreground">Average per Task</p>
              </div>
            </CardContent>
          </Card>

          {/* Priority Breakdown */}
          <Card className="bg-card border-border/50 rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                By Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.priorityBreakdown.map((priority) => (
                  <div key={priority.value} className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", priority.color)} />
                    <span className="text-sm flex-1">{priority.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {priority.completed}/{priority.total}
                      </span>
                      <span className="text-sm font-bold w-6 text-right">{priority.count}</span>
                    </div>
                  </div>
                ))}
              </div>
              {stats.highPriorityIncomplete > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-500 font-medium">
                    {stats.highPriorityIncomplete} high priority {stats.highPriorityIncomplete === 1 ? 'task needs' : 'tasks need'} attention
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card border-border/50 rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-sm text-muted-foreground">Created today</span>
                  <span className="text-sm font-medium">{stats.createdToday}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-sm text-muted-foreground">Created this week</span>
                  <span className="text-sm font-medium">{stats.createdThisWeek}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-sm text-muted-foreground">Pinned tasks</span>
                  <span className="text-sm font-medium">{stats.pinnedTasks}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
