from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import Equivalencia, EquivalenciaDetalle
from .serializers import EquivalenciaSerializer, EquivalenciaDetalleSerializer


class EquivalenciaViewSet(viewsets.ModelViewSet):
    queryset = Equivalencia.objects.all()
    serializer_class = EquivalenciaSerializer
    filterset_fields = ['plan_origen', 'plan_destino']

    @action(detail=False, methods=['get'])
    def check_materia(self, request):
        materia_id = request.query_params.get('materia_id')
        if not materia_id:
            return Response({'error': 'materia_id es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.materias.models import Materia
        from apps.planes.models import MateriaPlan
        
        try:
            materia = Materia.objects.get(id=materia_id)
        except Materia.DoesNotExist:
            return Response({'error': 'Materia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        
        tiene_equiv_origen = EquivalenciaDetalle.objects.filter(materia_origen__materia=materia).exists()
        tiene_equiv_destino = EquivalenciaDetalle.objects.filter(materia_destino__materia=materia).exists()
        
        return Response({
            'materia_id': materia_id,
            'materia_codigo': materia.codigo,
            'materia_nombre': materia.nombre,
            'tiene_equivalencias': tiene_equiv_origen or tiene_equiv_destino,
            'equiv_origen': tiene_equiv_origen,
            'equiv_destino': tiene_equiv_destino
        })

    @action(detail=True, methods=['post'])
    def agregar_detalle(self, request, pk=None):
        equivalencia = self.get_object()
        serializer = EquivalenciaDetalleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(equivalencia=equivalencia)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='eliminar_detalle/(?P<detalle_id>[^/.]+)')
    def eliminar_detalle(self, request, pk=None, detalle_id=None):
        equivalencia = self.get_object()
        try:
            detalle = equivalencia.detalles.get(id=detalle_id)
            detalle.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except EquivalenciaDetalle.DoesNotExist:
            return Response({'error': 'Detalle no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['patch'], url_path='editar_detalle/(?P<detalle_id>[^/.]+)')
    def editar_detalle(self, request, pk=None, detalle_id=None):
        equivalencia = self.get_object()
        try:
            detalle = equivalencia.detalles.get(id=detalle_id)
            serializer = EquivalenciaDetalleSerializer(detalle, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except EquivalenciaDetalle.DoesNotExist:
            return Response({'error': 'Detalle no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def comparativa(self, request):
        plan_origen_id = request.query_params.get('plan_origen_id')
        plan_destino_id = request.query_params.get('plan_destino_id')
        
        if not plan_origen_id or not plan_destino_id:
            return Response({'error': 'plan_origen_id y plan_destino_id son requeridos'}, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.planes.models import MateriaPlan
        
        materias_origen = MateriaPlan.objects.filter(
            plan_de_estudio_id=plan_origen_id
        ).select_related('materia').order_by('anio_cursado', 'orden')
        
        materias_destino = MateriaPlan.objects.filter(
            plan_de_estudio_id=plan_destino_id
        ).select_related('materia').order_by('anio_cursado', 'orden')
        
        from apps.planes.serializers import MateriaPlanSerializer
        
        return Response({
            'plan_origen': MateriaPlanSerializer(materias_origen, many=True).data,
            'plan_destino': MateriaPlanSerializer(materias_destino, many=True).data
        })
