from django.conf import settings
from django.db import models


class Shift(models.Model):
    name = models.CharField(max_length=128)
    start_time = models.TimeField()
    end_time = models.TimeField()


class AttendanceSession(models.Model):
    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="attendance_sessions")
    shift = models.ForeignKey(Shift, null=True, blank=True, on_delete=models.SET_NULL, related_name="sessions")
    clock_in_at = models.DateTimeField()
    clock_out_at = models.DateTimeField(null=True, blank=True)
    break_minutes = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=32, default="open")
