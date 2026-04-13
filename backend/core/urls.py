from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import api_root, CurrentUserView, csrf_token_view, LoginView, LogoutView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root),
    path('api/csrf/', csrf_token_view, name='csrf-token'),
    path('api/unidades-academicas/', include('apps.unidades_academicas.urls')),
    path('api/carreras/', include('apps.carreras.urls')),
    path('api/planes/', include('apps.planes.urls')),
    path('api/materias/', include('apps.materias.urls')),
    path('api/equivalencias/', include('apps.equivalencias.urls')),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/me/', CurrentUserView.as_view(), name='current-user'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
