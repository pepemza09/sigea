from rest_framework.routers import DefaultRouter
from .views import PeriodoLectivoViewSet

router = DefaultRouter()
router.register(r'periodos', PeriodoLectivoViewSet, basename='periodos')

urlpatterns = router.urls
