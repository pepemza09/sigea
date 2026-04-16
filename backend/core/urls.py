from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import api_root, CurrentUserView, csrf_token_view, LoginView, LogoutView
from django.http import HttpResponseRedirect, HttpResponse
import urllib.parse
import os
import requests

def google_oauth_redirect(request):
    client_id = os.getenv('GOOGLE_CLIENT_ID', '')
    redirect_uri = request.build_absolute_uri('/accounts/google/login/callback/')
    scope = 'email profile'
    state = request.GET.get('next', '/')
    
    params = urllib.parse.urlencode({
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': scope,
        'access_type': 'online',
        'state': state
    })
    
    google_oauth_url = f'https://accounts.google.com/o/oauth2/v2/auth?{params}'
    return HttpResponseRedirect(google_oauth_url)

def google_callback(request):
    code = request.GET.get('code')
    state = request.GET.get('state', '/')
    
    if not code:
        return HttpResponse('Error: No authorization code received', status=400)
    
    client_id = os.getenv('GOOGLE_CLIENT_ID', '')
    client_secret = os.getenv('GOOGLE_CLIENT_SECRET', '')
    redirect_uri = request.build_absolute_uri('/accounts/google/login/callback/')
    
    token_url = 'https://oauth2.googleapis.com/token'
    token_data = {
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
    }
    
    try:
        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()
        
        if 'access_token' in token_json:
            access_token = token_json['access_token']
            
            userinfo_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
            headers = {'Authorization': f'Bearer {access_token}'}
            userinfo_response = requests.get(userinfo_url, headers=headers)
            userinfo = userinfo_response.json()
            
            email = userinfo.get('email')
            name = userinfo.get('name', '')
            
            from django.contrib.auth.models import User
            from django.contrib.auth import authenticate, login
            
            user, created = User.objects.get_or_create(
                username=email.split('@')[0],
                defaults={
                    'email': email,
                    'first_name': name.split()[0] if name else '',
                    'last_name': ' '.join(name.split()[1:]) if name else ''
                }
            )
            
            # Use ModelBackend for authentication
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            
            return HttpResponseRedirect(state if state != '%2F' else '/')
        else:
            return HttpResponse(f'Error exchanging code: {token_json}', status=400)
            
    except Exception as e:
        return HttpResponse(f'Error: {str(e)}', status=500)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root),
    path('api/csrf/', csrf_token_view, name='csrf-token'),
    path('api/unidades-academicas/', include('apps.unidades_academicas.urls')),
    path('api/carreras/', include('apps.carreras.urls')),
    path('api/planes/', include('apps.planes.urls')),
    path('api/materias/', include('apps.materias.urls')),
    path('api/equivalencias/', include('apps.equivalencias.urls')),
    path('api/periodos/', include('apps.periodos.urls')),
    path('api/', include('apps.configuracion.urls')),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('google/oauth/', google_oauth_redirect, name='google_oauth'),
    path('accounts/google/login/callback/', google_callback),
    path('accounts/', include('allauth.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
