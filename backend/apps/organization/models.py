from django.db import models


class Branch(models.Model):
    name = models.CharField(max_length=128)
    code = models.CharField(max_length=32, unique=True)
    timezone = models.CharField(max_length=64, default="Asia/Calcutta")


class Department(models.Model):
    name = models.CharField(max_length=128)
    code = models.CharField(max_length=32, unique=True)
    branch = models.ForeignKey(Branch, null=True, blank=True, on_delete=models.SET_NULL, related_name="departments")


class Designation(models.Model):
    title = models.CharField(max_length=128)
    code = models.CharField(max_length=32, unique=True)
