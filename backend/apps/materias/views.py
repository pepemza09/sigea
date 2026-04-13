from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from .models import Materia
from .serializers import MateriaSerializer


class MateriaViewSet(viewsets.ModelViewSet):
    queryset = Materia.objects.all()
    serializer_class = MateriaSerializer
    search_fields = ['codigo', 'nombre']
    filterset_fields = ['codigo']

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except (ValidationError, IntegrityError) as e:
            error_msg = str(e)
            if 'materias_plan' in error_msg.lower() or 'planes de estudio' in error_msg.lower():
                return Response({'error': 'No se puede eliminar la materia porque está asignada a uno o más planes de estudio'}, status=status.HTTP_409_CONFLICT)
            if 'equiv' in error_msg.lower() or 'equivalencia' in error_msg.lower():
                return Response({'error': 'No se puede eliminar la materia porque está involucrada en una o más equivalencias'}, status=status.HTTP_409_CONFLICT)
            return Response({'error': error_msg}, status=status.HTTP_409_CONFLICT)

    @action(detail=True, methods=['post'])
    def associate_plan(self, request, pk=None):
        materia = self.get_object()
        plan_id = request.data.get('plan_id')
        
        if not plan_id:
            return Response({'error': 'Se requiere el ID del plan'}, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.planes.models import PlanDeEstudio, MateriaPlan
        try:
            plan = PlanDeEstudio.objects.get(id=plan_id)
        except PlanDeEstudio.DoesNotExist:
            return Response({'error': 'Plan no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        if plan.materias_plan.filter(materia=materia).exists():
            return Response({'error': 'La materia ya está asociada a este plan'}, status=status.HTTP_400_BAD_REQUEST)
        
        mp = plan.materias_plan.create(
            materia=materia,
            anio_cursado=1,
            cuatrimestre=1,
            area_disciplinar='Derecho',
            formato='Teórico aplicado',
            orden=plan.materias_plan.count() + 1
        )
        
        return Response({
            'id': mp.id,
            'plan_de_estudio': plan_id,
            'plan_nombre': plan.nombre
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def dissociate_plan(self, request, pk=None):
        materia = self.get_object()
        plan_id = request.data.get('plan_id')
        
        if not plan_id:
            return Response({'error': 'Se requiere el ID del plan'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            mp = materia.planes_materia.get(plan_de_estudio_id=plan_id)
            mp.delete()
            return Response({'status': 'Materia desasociada del plan'})
        except Exception as e:
            return Response({'error': 'No se pudo desasociar: ' + str(e)}, status=status.HTTP_400_BAD_REQUEST)
