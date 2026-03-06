from django.urls import path

from .views import (
    AccessRequestApproveView,
    AccessRequestCreateView,
    AccessRequestListView,
    AccessRequestRejectView,
    BootstrapAdminView,
    BootstrapStateView,
    LoginView,
    LogoutView,
    MeView,
    PasswordSetupView,
    RefreshTokenView,
    ResendOTPView,
    SessionListView,
    VerifyOTPView,
)

urlpatterns = [
    path("bootstrap-state", BootstrapStateView.as_view(), name="bootstrap-state"),
    path("bootstrap-admin", BootstrapAdminView.as_view(), name="bootstrap-admin"),
    path("access-request", AccessRequestCreateView.as_view(), name="access-request"),
    path("access-requests", AccessRequestListView.as_view(), name="access-request-list"),
    path("access-request/<int:request_id>/approve", AccessRequestApproveView.as_view(), name="access-request-approve"),
    path("access-request/<int:request_id>/reject", AccessRequestRejectView.as_view(), name="access-request-reject"),
    path("set-password", PasswordSetupView.as_view(), name="set-password"),
    path("login", LoginView.as_view(), name="login"),
    path("verify-otp", VerifyOTPView.as_view(), name="verify-otp"),
    path("resend-otp", ResendOTPView.as_view(), name="resend-otp"),
    path("me", MeView.as_view(), name="me"),
    path("sessions", SessionListView.as_view(), name="sessions"),
    path("refresh", RefreshTokenView.as_view(), name="refresh"),
    path("logout", LogoutView.as_view(), name="logout"),
]
