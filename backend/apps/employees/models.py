from django.conf import settings
from django.db import models


class EmployeeProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="employee_profile")
    employee_code = models.CharField(max_length=64, unique=True)
    department = models.ForeignKey("organization.Department", null=True, blank=True, on_delete=models.SET_NULL, related_name="employees")
    designation = models.ForeignKey("organization.Designation", null=True, blank=True, on_delete=models.SET_NULL, related_name="employees")
    branch = models.ForeignKey("organization.Branch", null=True, blank=True, on_delete=models.SET_NULL, related_name="employees")
    reporting_manager = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="direct_reports")
    date_of_joining = models.DateField(null=True, blank=True)
    employment_status = models.CharField(max_length=32, default="active")


class EmployeeDocument(models.Model):
    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE, related_name="documents")
    title = models.CharField(max_length=255)
    file_path = models.CharField(max_length=255)
    document_type = models.CharField(max_length=64, default="general")
    uploaded_at = models.DateTimeField(auto_now_add=True)
