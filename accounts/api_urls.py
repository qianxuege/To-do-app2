from django.urls import path

from .api_views import LoginAPIView, RegisterAPIView

urlpatterns = [
    path("auth/register/", RegisterAPIView.as_view()),
    path("auth/login/", LoginAPIView.as_view()),
]

