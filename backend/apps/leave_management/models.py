from django.conf import settings
from django.db import models


class LeavePolicy(models.Model):
    name = models.CharField(max_length=128)
    code = models.CharField(max_length=32, unique=True)
    annual_quota = models.DecimalField(max_digits=5, decimal_places=2, default=0)


class LeaveRequest(models.Model):
    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="leave_requests")
    policy = models.ForeignKey(LeavePolicy, on_delete=models.PROTECT, related_name="requests")
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=32, default="pending")
    reason = models.TextField(blank=True)
