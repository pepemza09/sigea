from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanDeEstudioViewSet

router = DefaultRouter()
router.register(r'', PlanDeEstudioViewSet, basename='plan-de-estudio')

urlpatterns = [
    path('', include(router.urls)),
]
