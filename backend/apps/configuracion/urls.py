from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, GroupViewSet, PermissionViewSet,
    ConfiguracionGeneralViewSet, BackupView, AppInfoView, HealthCheckView
)
from django.urls import path

router = DefaultRouter()
router.register(r'configuracion/usuarios', UserViewSet, basename='usuarios')
router.register(r'configuracion/grupos', GroupViewSet, basename='grupos')
router.register(r'configuracion/permisos', PermissionViewSet, basename='permisos')
router.register(r'configuracion/settings', ConfiguracionGeneralViewSet, basename='settings')

urlpatterns = router.urls + [
    path('configuracion/backup/', BackupView.as_view(), name='backup'),
    path('configuracion/app-info/', AppInfoView.as_view(), name='app-info'),
    path('health/', HealthCheckView.as_view(), name='health'),
]
