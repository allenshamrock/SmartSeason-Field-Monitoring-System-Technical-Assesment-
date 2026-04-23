from django.urls import path 
from .views import FieldListCreateView,FieldDetailView,FieldUpdateListCreateView,DashboardView

urlpatterns=[
    path('dashboard/',DashboardView.as_view(),name='dashboard'),
    path('fields/',FieldListCreateView.as_view(),name='field-list'),
    path('fields/<int:pk>/',FieldDetailView.as_view(), name='field-detail'),
    path('fields/<int:field_id>/updates/',FieldUpdateListCreateView.as_view(),name='field-updates')
]