from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from django.conf import settings
import json

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        email = user.email
        
        is_admin = email.lower() == settings.GOOGLE_ADMIN_EMAIL.lower() if hasattr(settings, 'GOOGLE_ADMIN_EMAIL') and settings.GOOGLE_ADMIN_EMAIL else False
        
        is_google_user = hasattr(user, 'socialaccount_set') and user.socialaccount_set.exists()
        
        pending_approval = is_google_user and not is_admin and not user.is_staff and not user.is_superuser
        
        return Response({
            'username': user.username,
            'email': email,
            'is_authenticated': True,
            'is_admin': is_admin,
            'pending_approval': pending_approval,
        })


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            is_admin = user.email == settings.GOOGLE_ADMIN_EMAIL
            return Response({
                'success': True, 
                'username': user.username,
                'is_admin': is_admin,
            })
        else:
            return Response({'error': 'Usuario o clave incorrectos. Por favor, contacte al administrador del sistema.'}, status=401)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from django.contrib.auth import logout
        logout(request)
        return Response({'success': True})

def csrf_token_view(request):
    return JsonResponse({'csrf_token': get_token(request)})

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'message': 'SIGeA API',
        'version': '1.0',
        'endpoints': {
            'unidades-academicas': '/api/unidades-academicas/',
            'carreras': '/api/carreras/',
            'planes': '/api/planes/',
            'materias': '/api/materias/',
            'equivalencias': '/api/equivalencias/',
        }
    })