from django.conf import settings
from django.db import models


class ReportDefinition(models.Model):
    name = models.CharField(max_length=128)
    module = models.CharField(max_length=64)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="report_definitions")
    config = models.JSONField(default=dict, blank=True)
