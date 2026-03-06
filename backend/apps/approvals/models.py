from django.conf import settings
from django.db import models


class ApprovalRule(models.Model):
    name = models.CharField(max_length=128)
    module = models.CharField(max_length=64)
    scope = models.CharField(max_length=32, default="company")


class ApprovalRequest(models.Model):
    rule = models.ForeignKey(ApprovalRule, null=True, blank=True, on_delete=models.SET_NULL, related_name="requests")
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="approval_requests")
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="approval_actions")
    status = models.CharField(max_length=32, default="pending")
    reference_type = models.CharField(max_length=64)
    reference_id = models.CharField(max_length=64)
