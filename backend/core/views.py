from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
import json

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username,
            'is_authenticated': True,
        })

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return Response({'success': True, 'username': user.username})
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