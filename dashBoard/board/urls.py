from django.urls import path

from . import views

urlpatterns = [
    path("", views.studentBoard, name="studentBoard"),
    path("class/", views.classBoard, name="classBoard"),
]