from django.urls import path

from .api_views import TodayDueAPIView, TodoDetailAPIView, TodoListCreateAPIView

urlpatterns = [
    path("", TodoListCreateAPIView.as_view()),
    path("today/", TodayDueAPIView.as_view()),
    path("<int:pk>/", TodoDetailAPIView.as_view()),
]

