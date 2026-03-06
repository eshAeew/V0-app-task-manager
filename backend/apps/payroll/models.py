from django.conf import settings
from django.db import models


class PayrollProfile(models.Model):
    employee = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payroll_profile")
    monthly_gross = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    pay_cycle = models.CharField(max_length=32, default="monthly")


class SalaryComponent(models.Model):
    profile = models.ForeignKey(PayrollProfile, on_delete=models.CASCADE, related_name="components")
    name = models.CharField(max_length=128)
    component_type = models.CharField(max_length=32, default="earning")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)


class Payslip(models.Model):
    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payslips")
    period_label = models.CharField(max_length=64)
    gross_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    published_at = models.DateTimeField(null=True, blank=True)
