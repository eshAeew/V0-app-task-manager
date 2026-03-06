from rest_framework import authentication, exceptions

from .models import PortalSession


class SessionTokenAuthentication(authentication.BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).decode("utf-8")
        if not header:
            return None

        parts = header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            return None

        token = parts[1]
        if not token.startswith("session-"):
            raise exceptions.AuthenticationFailed("Invalid access token.")

        try:
            session_id = int(token.removeprefix("session-"))
        except ValueError as exc:
            raise exceptions.AuthenticationFailed("Invalid access token.") from exc

        session = PortalSession.objects.filter(pk=session_id, revoked_at__isnull=True).select_related("user").first()
        if not session:
            raise exceptions.AuthenticationFailed("Session is not active.")

        request.portal_session = session
        return session.user, session
