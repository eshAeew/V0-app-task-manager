from django.utils import timezone
from rest_framework import serializers

from .models import AccessRequest, PasswordSetupToken, PortalSession, User


class AccessRequestSerializer(serializers.ModelSerializer):
    debug_setup_token = serializers.SerializerMethodField()
    debug_setup_url = serializers.SerializerMethodField()

    class Meta:
        model = AccessRequest
        fields = [
            "id",
            "work_email",
            "employee_code",
            "department_name",
            "designation_name",
            "justification",
            "status",
            "created_at",
            "debug_setup_token",
            "debug_setup_url",
        ]
        read_only_fields = ["id", "status", "created_at", "debug_setup_token", "debug_setup_url"]

    def get_debug_setup_token(self, obj: AccessRequest):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated or not request.user.is_staff or not obj.approved_user:
            return None
        if obj.setup_token_preview:
            return obj.setup_token_preview
        token = obj.approved_user.password_setup_tokens.filter(consumed_at__isnull=True, expires_at__gt=timezone.now()).order_by("-created_at").first()
        return getattr(token, "_raw_token", None) if token else None

    def get_debug_setup_url(self, obj: AccessRequest):
        token = self.get_debug_setup_token(obj)
        return f"/auth/set-password?token={token}" if token else None


class AccessRequestReviewSerializer(serializers.Serializer):
    reviewer_email = serializers.EmailField(required=False)


class PasswordSetupSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(min_length=8, write_only=True)

    def save(self) -> User:
        raw_token = self.validated_data["token"]
        password = self.validated_data["password"]

        matching_token = next(
            (
                candidate
                for candidate in PasswordSetupToken.objects.filter(consumed_at__isnull=True).select_related("user")
                if candidate.matches(raw_token)
            ),
            None,
        )
        if not matching_token or matching_token.expires_at <= timezone.now():
            raise serializers.ValidationError("Password setup link is invalid or expired.")

        access_request = AccessRequest.objects.filter(
            work_email=matching_token.user.email,
            status=AccessRequest.Status.APPROVED,
        ).first()
        if not access_request or not access_request.approved_user:
            raise serializers.ValidationError("Access request is not approved for this email.")

        user = matching_token.user
        user.set_password(password)
        user.clear_login_lock()
        user.save(update_fields=["password"])

        matching_token.consumed_at = timezone.now()
        matching_token.save(update_fields=["consumed_at"])
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)


class RefreshSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()


class SessionSerializer(serializers.ModelSerializer):
    is_current = serializers.SerializerMethodField()

    class Meta:
        model = PortalSession
        fields = ["id", "user_agent", "ip_address", "created_at", "last_seen_at", "revoked_at", "is_current"]

    def get_is_current(self, obj: PortalSession) -> bool:
        current_session = self.context.get("current_session")
        return bool(current_session and obj.pk == current_session.pk)


class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "is_staff", "is_superuser", "is_email_verified"]


class BootstrapAdminSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    full_name = serializers.CharField(max_length=150)
