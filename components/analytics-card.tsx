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
    
    // Due date analysis
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueTasks = activeTasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    }).length;
    
    const dueTodayTasks = activeTasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === today.getTime();
    }).length;
    
    const dueThisWeekTasks = activeTasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      const due = new Date(t.dueDate);
      due.setHours(0, 0, 0, 0);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return due > today && due <= weekFromNow;
    }).length;

    // Priority breakdown
    const priorityBreakdown = PRIORITIES.map((p) => ({
      ...p,
      count: activeTasks.filter((t) => t.priority === p.value && t.status !== "done").length,
    }));

    // Category breakdown
    const categoryBreakdown = categories.map((c) => ({
      ...c,
      total: activeTasks.filter((t) => t.category === c.id).length,
      completed: activeTasks.filter((t) => t.category === c.id && t.status === "done").length,
    }));

    // Status breakdown
    const statusBreakdown = columns.map((col) => ({
      ...col,
      count: activeTasks.filter((t) => t.status === col.id).length,
    }));

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

    // Average time estimate
    const tasksWithEstimate = activeTasks.filter((t) => t.timeEstimate);
    const avgEstimate = tasksWithEstimate.length > 0
      ? Math.round(tasksWithEstimate.reduce((sum, t) => sum + (t.timeEstimate || 0), 0) / tasksWithEstimate.length)
      : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      dueTodayTasks,
      dueThisWeekTasks,
      priorityBreakdown,
      categoryBreakdown,
      statusBreakdown,
      streak,
      completionRate,
      avgEstimate,
    };
  }, [tasks, categories, columns]);

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-card border-border/50 rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="text-sm font-medium">{stats.completionRate}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>

            {/* Upcoming */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-2 rounded-xl bg-orange-500/10">
                <Calendar className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{stats.dueTodayTasks}</p>
                <p className="text-xs text-muted-foreground">Due Today</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-yellow-500/10">
                <Calendar className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{stats.dueThisWeekTasks}</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{stats.avgEstimate}m</p>
                <p className="text-xs text-muted-foreground">Avg. Estimate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* By Priority */}
      <Card className="bg-card border-border/50 rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">By Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.priorityBreakdown.map((p) => (
              <div key={p.value} className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full", p.color)} />
                <span className="text-sm flex-1">{p.label}</span>
                <span className="text-sm font-medium">{p.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Category */}
      <Card className="bg-card border-border/50 rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">By Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.categoryBreakdown.map((c) => (
              <div key={c.id}>
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-sm flex-1">{c.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.completed}/{c.total}
                  </span>
                </div>
                <Progress
                  value={c.total > 0 ? (c.completed / c.total) * 100 : 0}
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Status */}
      <Card className="bg-card border-border/50 rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">By Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stats.statusBreakdown.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-sm">{s.title}</span>
                <span className="text-sm font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
