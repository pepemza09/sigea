import json
import csv
import sys
from io import StringIO
from django.http import HttpResponse
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db import connection
from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.core.management import call_command
from .models import ConfiguracionGeneral
from .serializers import (
    UserSerializer, UserCreateSerializer, GroupSerializer,
    PermissionSerializer, ConfiguracionGeneralSerializer,
    BackupSerializer, AppInfoSerializer
)
from apps.unidades_academicas.models import UnidadAcademica
from apps.carreras.models import Carrera
from apps.planes.models import PlanDeEstudio, Area, MateriaPlan
from apps.materias.models import Materia
from apps.equivalencias.models import Equivalencia, EquivalenciaDetalle


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related().prefetch_related('groups', 'groups__permissions')
    permission_classes = [IsAdminUser]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    filterset_fields = ['is_active', 'is_staff', 'is_superuser']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateSerializer
        return UserSerializer
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        if user.id == request.user.id:
            return Response({'error': 'No puedes desactivar tu propio usuario'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = not user.is_active
        user.save()
        return Response({'status': 'Usuario actualizado', 'is_active': user.is_active})
    
    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('password')
        if not new_password or len(new_password) < 8:
            return Response({'error': 'La contraseña debe tener al menos 8 caracteres'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'status': 'Contraseña actualizada'})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = User.objects.count()
        activos = User.objects.filter(is_active=True).count()
        staff = User.objects.filter(is_staff=True).count()
        return Response({
            'total': total,
            'activos': activos,
            'inactivos': total - activos,
            'staff': staff
        })


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.prefetch_related('permissions', 'user_set')
    serializer_class = GroupSerializer
    permission_classes = [IsAdminUser]
    
    @action(detail=True, methods=['post'])
    def set_permissions(self, request, pk=None):
        group = self.get_object()
        permission_ids = request.data.get('permissions', [])
        permissions = Permission.objects.filter(id__in=permission_ids)
        group.permissions.set(permissions)
        return Response({'status': 'Permisos actualizados'})


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.select_related('content_type').all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['content_type']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        content_type_id = self.request.query_params.get('content_type')
        if content_type_id:
            queryset = queryset.filter(content_type_id=content_type_id)
        return queryset
    
    @action(detail=False, methods=['get'])
    def by_content_type(self, request):
        content_types = ContentType.objects.all()
        result = {}
        for ct in content_types:
            result[ct.app_label + '.' + ct.model] = {
                'id': ct.id,
                'name': ct.name,
                'permissions': PermissionSerializer(
                    Permission.objects.filter(content_type=ct),
                    many=True
                ).data
            }
        return Response(result)


class ConfiguracionGeneralViewSet(viewsets.ModelViewSet):
    queryset = ConfiguracionGeneral.objects.all()
    serializer_class = ConfiguracionGeneralSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'clave'
    
    @action(detail=False, methods=['get'])
    def all_settings(self, request):
        settings = ConfiguracionGeneral.objects.all()
        return Response(ConfiguracionGeneralSerializer(settings, many=True).data)


class BackupView(views.APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        tipo = request.query_params.get('tipo', 'completo')
        formato = request.query_params.get('formato', 'json')
        
        if formato == 'csv':
            return self._export_csv(tipo)
        return self._export_json(tipo)
    
    def _export_json(self, tipo):
        data = {}
        
        if tipo in ['completo', 'unidades']:
            data['unidades_academicas'] = list(
                UnidadAcademica.objects.values(
                    'id', 'nombre', 'sigla', 'descripcion'
                )
            )
        
        if tipo in ['completo', 'carreras']:
            data['carreras'] = list(
                Carrera.objects.select_related('unidad_academica').values(
                    'id', 'codigo', 'nombre', 'duracion_anios',
                    'unidad_academica__nombre'
                )
            )
        
        if tipo in ['completo', 'planes']:
            data['planes'] = list(
                PlanDeEstudio.objects.select_related('carrera').values(
                    'id', 'nombre', 'anio_aprobacion', 'duracion_anios',
                    'carga_horaria_total', 'creditos_totales', 'es_vigente',
                    'carrera__nombre'
                )
            )
            data['areas'] = list(
                Area.objects.values('id', 'nombre', 'descripcion')
            )
        
        if tipo in ['completo', 'materias']:
            data['materias'] = list(
                Materia.objects.values(
                    'id', 'codigo', 'nombre', 'descripcion',
                    'horas_interaccion_pedagogica', 'horas_trabajo_autonomo',
                    'horas_totales', 'creditos', 'anio_cuatrimestre_default',
                    'cuatrimestre_default'
                )
            )
            data['materias_plan'] = list(
                MateriaPlan.objects.select_related('plan_de_estudio', 'materia').values(
                    'id', 'plan_de_estudio__nombre', 'materia__codigo',
                    'anio_cursado', 'cuatrimestre', 'area_disciplinar',
                    'formato', 'es_optativa', 'es_electiva', 'orden'
                )
            )
        
        if tipo in ['completo', 'equivalencias']:
            data['equivalencias'] = list(
                Equivalencia.objects.select_related('plan_origen', 'plan_destino').values(
                    'id', 'plan_origen__nombre', 'plan_destino__nombre', 'created_at'
                )
            )
        
        response = HttpResponse(
            json.dumps(data, indent=2, default=str),
            content_type='application/json'
        )
        response['Content-Disposition'] = f'attachment; filename="backup_{tipo}_{self._get_timestamp()}.json"'
        return response
    
    def _export_csv(self, tipo):
        output = StringIO()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="backup_{tipo}_{self._get_timestamp()}.csv"'
        
        if tipo in ['completo', 'unidades']:
            writer = csv.writer(response)
            writer.writerow(['# Unidades Académicas'])
            writer.writerow(['ID', 'Nombre', 'Sigla', 'Descripción'])
            for u in UnidadAcademica.objects.all():
                writer.writerow([u.id, u.nombre, u.sigla, u.descripcion])
            writer.writerow([])
        
        if tipo in ['completo', 'materias']:
            writer = csv.writer(response)
            writer.writerow(['# Materias'])
            writer.writerow(['ID', 'Código', 'Nombre', 'Horas Totales', 'Créditos'])
            for m in Materia.objects.all():
                writer.writerow([m.id, m.codigo, m.nombre, m.horas_totales, m.creditos])
        
        return response
    
    def _get_timestamp(self):
        from datetime import datetime
        return datetime.now().strftime('%Y%m%d_%H%M%S')
    
    def post(self, request):
        action = request.data.get('action')
        
        if action == 'import':
            file = request.FILES.get('file')
            if not file:
                return Response({'error': 'Se requiere un archivo'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                data = json.load(file)
                
                imported = {'unidades': 0, 'carreras': 0, 'planes': 0, 'materias': 0}
                
                if 'unidades_academicas' in data:
                    for item in data['unidades_academicas']:
                        UnidadAcademica.objects.get_or_create(
                            nombre=item['nombre'],
                            defaults={'sigla': item.get('sigla', ''), 'descripcion': item.get('descripcion', '')}
                        )
                        imported['unidades'] += 1
                
                return Response({
                    'status': 'Importación completada',
                    'imported': imported
                })
            except json.JSONDecodeError:
                return Response({'error': 'Archivo JSON inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'Acción no válida'}, status=status.HTTP_400_BAD_REQUEST)


class AppInfoView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        info = {
            'nombre': 'SIGeA - Sistema Integral de Gestión Académica',
            'version': '1.0.0',
            'entorno': 'production' if not getattr(settings, 'DEBUG', False) else 'development',
            'python_version': sys.version.split()[0],
            'django_version': '5.0',
            'base_datos': connection.vendor,
        }
        return Response(info)


class HealthCheckView(views.APIView):
    permission_classes = []
    
    def get(self, request):
        return Response({
            'status': 'healthy',
            'database': connection.is_usable(),
        })
