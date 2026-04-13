from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EquivalenciaViewSet

router = DefaultRouter()
router.register(r'', EquivalenciaViewSet, basename='equivalencia')

urlpatterns = [
    path('', include(router.urls)),
]
