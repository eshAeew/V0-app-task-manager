from django.conf import settings
from django.db import models


class MailboxThread(models.Model):
    subject = models.CharField(max_length=255)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="created_mail_threads")
    folder = models.CharField(max_length=32, default="inbox")


class MailboxMessage(models.Model):
    thread = models.ForeignKey(MailboxThread, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="sent_mail_messages")
    body = models.TextField()
    is_draft = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
