from django.conf import settings
from django.db import models


class CalendarInstance(models.Model):
    name = models.CharField(max_length=128)
    scope = models.CharField(max_length=32, default="personal")
    project = models.ForeignKey("projects.Project", null=True, blank=True, on_delete=models.CASCADE, related_name="calendar_instances")


class CalendarEvent(models.Model):
    calendar = models.ForeignKey(CalendarInstance, on_delete=models.CASCADE, related_name="events")
    title = models.CharField(max_length=255)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="calendar_events")
    linked_task = models.ForeignKey("tasks.Task", null=True, blank=True, on_delete=models.SET_NULL, related_name="calendar_events")
