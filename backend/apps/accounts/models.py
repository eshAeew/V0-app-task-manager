import hashlib
import secrets
from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_email_verified = models.BooleanField(default=False)
    last_otp_verified_at = models.DateTimeField(null=True, blank=True)
    failed_login_attempts = models.PositiveIntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    @property
    def is_locked(self) -> bool:
        return bool(self.locked_until and self.locked_until > timezone.now())

    def register_failed_login(self, max_attempts: int = 5, lock_minutes: int = 15) -> None:
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= max_attempts:
            self.locked_until = timezone.now() + timedelta(minutes=lock_minutes)
            self.failed_login_attempts = 0
        self.save(update_fields=["failed_login_attempts", "locked_until"])

    def clear_login_lock(self) -> None:
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save(update_fields=["failed_login_attempts", "locked_until"])


class AccessRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    work_email = models.EmailField(unique=True)
    employee_code = models.CharField(max_length=64, blank=True)
    department_name = models.CharField(max_length=128, blank=True)
    designation_name = models.CharField(max_length=128, blank=True)
    justification = models.TextField(blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    setup_token_preview = models.CharField(max_length=255, blank=True)
    reviewed_by = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_access_requests")
    reviewed_at = models.DateTimeField(null=True, blank=True)
    approved_user = models.OneToOneField("accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="access_request")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class LoginOTP(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="otp_codes")
    code_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    consumed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def issue_for_user(cls, user: User, ttl_seconds: int = 300) -> tuple["LoginOTP", str]:
        code = f"{secrets.randbelow(1000000):06d}"
        code_hash = hashlib.sha256(code.encode("utf-8")).hexdigest()
        otp = cls.objects.create(
            user=user,
            code_hash=code_hash,
            expires_at=timezone.now() + timedelta(seconds=ttl_seconds),
        )
        return otp, code

    def matches(self, code: str) -> bool:
        return self.code_hash == hashlib.sha256(code.encode("utf-8")).hexdigest()


class PasswordSetupToken(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="password_setup_tokens")
    token_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    consumed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def issue_for_user(cls, user: User, ttl_hours: int = 24) -> tuple["PasswordSetupToken", str]:
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        setup_token = cls.objects.create(
            user=user,
            token_hash=token_hash,
            expires_at=timezone.now() + timedelta(hours=ttl_hours),
        )
        return setup_token, token

    def matches(self, token: str) -> bool:
        return self.token_hash == hashlib.sha256(token.encode("utf-8")).hexdigest()


class PortalSession(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="portal_sessions")
    refresh_token_hash = models.CharField(max_length=128)
    user_agent = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(auto_now=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    @classmethod
    def create_session(cls, user: User, user_agent: str = "", ip_address: str | None = None) -> tuple["PortalSession", str]:
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        session = cls.objects.create(
            user=user,
            refresh_token_hash=token_hash,
            user_agent=user_agent[:255],
            ip_address=ip_address,
        )
        return session, token
