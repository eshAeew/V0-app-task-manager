from django.db import models


class Permission(models.Model):
    code = models.CharField(max_length=128, unique=True)
    name = models.CharField(max_length=128)
    scope = models.CharField(max_length=32, default="company")


class Role(models.Model):
    name = models.CharField(max_length=128, unique=True)
    description = models.TextField(blank=True)
    permissions = models.ManyToManyField(Permission, blank=True, related_name="roles")
