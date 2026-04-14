from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanDeEstudioViewSet, AreaViewSet

router = DefaultRouter()
router.register(r'areas', AreaViewSet, basename='area')
router.register(r'', PlanDeEstudioViewSet, basename='plan-de-estudio')

urlpatterns = [
    path('', include(router.urls)),
]
