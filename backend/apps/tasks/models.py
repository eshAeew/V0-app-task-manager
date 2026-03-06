from django.conf import settings
from django.db import models


class TaskStatus(models.Model):
    name = models.CharField(max_length=128)
    code = models.CharField(max_length=64, unique=True)
    is_completion_status = models.BooleanField(default=False)


class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    project = models.ForeignKey("projects.Project", null=True, blank=True, on_delete=models.CASCADE, related_name="tasks")
    status = models.ForeignKey(TaskStatus, null=True, blank=True, on_delete=models.SET_NULL, related_name="tasks")
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_tasks")
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="created_tasks")
    due_date = models.DateField(null=True, blank=True)
    priority = models.CharField(max_length=16, default="medium")
    approval_required = models.BooleanField(default=False)


class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="task_comments")
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class TaskApproval(models.Model):
    task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name="approval")
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="task_approvals")
    status = models.CharField(max_length=32, default="pending")
