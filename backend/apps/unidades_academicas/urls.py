from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UnidadAcademicaViewSet

router = DefaultRouter()
router.register(r'', UnidadAcademicaViewSet, basename='unidad-academica')

urlpatterns = [
    path('', include(router.urls)),
]
