import hashlib

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AccessRequest, LoginOTP, PasswordSetupToken, PortalSession
from .serializers import (
    AccessRequestReviewSerializer,
    AccessRequestSerializer,
    BootstrapAdminSerializer,
    LoginSerializer,
    PasswordSetupSerializer,
    RefreshSerializer,
    SessionSerializer,
    UserSummarySerializer,
    VerifyOTPSerializer,
)

User = get_user_model()


def _get_request_session(request) -> PortalSession | None:
    auth = getattr(request, "auth", None)
    return auth if isinstance(auth, PortalSession) else getattr(request, "portal_session", None)


class AccessRequestCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = AccessRequestSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        access_request = serializer.save()
        return Response(AccessRequestSerializer(access_request, context={"request": request}).data, status=status.HTTP_201_CREATED)


class AccessRequestListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        queryset = AccessRequest.objects.order_by("-created_at").select_related("approved_user", "reviewed_by")
        serializer = AccessRequestSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)


class BaseAccessRequestDecisionView(APIView):
    permission_classes = [permissions.IsAdminUser]
    decision: str = ""

    def post(self, request, request_id: int):
        serializer = AccessRequestReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        access_request = AccessRequest.objects.get(pk=request_id)
        reviewer = request.user
        access_request.reviewed_by = reviewer
        access_request.reviewed_at = timezone.now()

        if self.decision == "approve":
            access_request.status = AccessRequest.Status.APPROVED
            approved_user, _ = User.objects.get_or_create(
                email=access_request.work_email,
                defaults={"username": access_request.work_email},
            )
            access_request.approved_user = approved_user
            setup_token, raw_token = PasswordSetupToken.issue_for_user(approved_user)
            setattr(setup_token, "_raw_token", raw_token)
            access_request.setup_token_preview = raw_token
        else:
            access_request.status = AccessRequest.Status.REJECTED
            access_request.setup_token_preview = ""

        access_request.save()
        return Response(AccessRequestSerializer(access_request, context={"request": request}).data)


class AccessRequestApproveView(BaseAccessRequestDecisionView):
    decision = "approve"


class AccessRequestRejectView(BaseAccessRequestDecisionView):
    decision = "reject"


class PasswordSetupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordSetupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"email": user.email, "password_set": True})


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = User.objects.filter(email=email).first()
        if not user or not user.has_usable_password():
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_locked:
            return Response(
                {
                    "detail": "Account is temporarily locked.",
                    "locked_until": user.locked_until,
                },
                status=status.HTTP_423_LOCKED,
            )

        if not user.check_password(password):
            user.register_failed_login()
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

        user.clear_login_lock()
        otp, code = LoginOTP.issue_for_user(user)
        return Response(
            {
                "email": user.email,
                "otp_required": True,
                "otp_expires_at": otp.expires_at,
                "debug_otp_code": code if settings.DEBUG else None,
            }
        )


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.get(email=serializer.validated_data["email"])
        otp = user.otp_codes.filter(consumed_at__isnull=True).order_by("-created_at").first()
        if not otp or otp.expires_at <= timezone.now() or not otp.matches(serializer.validated_data["otp"]):
            return Response({"detail": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        otp.consumed_at = timezone.now()
        otp.save(update_fields=["consumed_at"])
        user.is_email_verified = True
        user.last_otp_verified_at = timezone.now()
        user.save(update_fields=["is_email_verified", "last_otp_verified_at"])

        session, refresh_token = PortalSession.create_session(
            user,
            user_agent=request.headers.get("User-Agent", ""),
            ip_address=request.META.get("REMOTE_ADDR"),
        )
        return Response(
            {
                "access_token": f"session-{session.pk}",
                "refresh_token": refresh_token,
                "user": UserSummarySerializer(user).data,
            }
        )


class ResendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        user = User.objects.get(email=email)
        otp, code = LoginOTP.issue_for_user(user)
        return Response(
            {
                "email": user.email,
                "otp_expires_at": otp.expires_at,
                "debug_otp_code": code if settings.DEBUG else None,
            }
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSummarySerializer(request.user).data)


class SessionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        current_session = _get_request_session(request)
        queryset = request.user.portal_sessions.order_by("-created_at")
        serializer = SessionSerializer(queryset, many=True, context={"current_session": current_session})
        return Response(serializer.data)


class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_hash = hashlib.sha256(serializer.validated_data["refresh_token"].encode("utf-8")).hexdigest()
        session = PortalSession.objects.filter(refresh_token_hash=token_hash, revoked_at__isnull=True).select_related("user").first()
        if not session:
            return Response({"detail": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST)
        session.last_seen_at = timezone.now()
        session.save(update_fields=["last_seen_at"])
        return Response({"access_token": f"session-{session.pk}", "user": UserSummarySerializer(session.user).data})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = request.data.get("refresh_token", "")
        session = None
        if token:
            token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
            session = PortalSession.objects.filter(refresh_token_hash=token_hash, revoked_at__isnull=True).first()
        else:
            session = _get_request_session(request)
        if session:
            session.revoked_at = timezone.now()
            session.save(update_fields=["revoked_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class BootstrapStateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"needs_bootstrap": not User.objects.filter(is_staff=True).exists()})


class BootstrapAdminView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if User.objects.filter(is_staff=True).exists():
            return Response({"detail": "Bootstrap is already complete."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = BootstrapAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        full_name = serializer.validated_data["full_name"].strip().split(maxsplit=1)
        user = User.objects.create_user(
            username=serializer.validated_data["email"],
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
            first_name=full_name[0] if full_name else "",
            last_name=full_name[1] if len(full_name) > 1 else "",
            is_staff=True,
            is_superuser=True,
        )
        return Response(UserSummarySerializer(user).data, status=status.HTTP_201_CREATED)
