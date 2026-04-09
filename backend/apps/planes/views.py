from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from .models import PlanDeEstudio, MateriaPlan
from .serializers import PlanDeEstudioSerializer, MateriaPlanSerializer


class PlanDeEstudioViewSet(viewsets.ModelViewSet):
    queryset = PlanDeEstudio.objects.all()
    serializer_class = PlanDeEstudioSerializer
    filterset_fields = ['carrera', 'es_vigente']

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except (ValidationError, IntegrityError) as e:
            error_msg = str(e)
            if 'materias' in error_msg.lower():
                return Response({'error': 'No se puede eliminar el plan de estudio porque tiene materias asociadas'}, status=status.HTTP_409_CONFLICT)
            return Response({'error': error_msg}, status=status.HTTP_409_CONFLICT)

    @action(detail=True, methods=['get'])
    def materias(self, request, pk=None):
        plan = self.get_object()
        materias = plan.materias_plan.all()
        serializer = MateriaPlanSerializer(materias, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def malla(self, request, pk=None):
        plan = self.get_object()
        materias = plan.materias_plan.all().order_by('anio_cursado', 'cuatrimestre', 'orden')
        
        estructura = {}
        for materia in materias:
            anio = materia.anio_cursado
            cuatrimestre = materia.cuatrimestre
            if anio not in estructura:
                estructura[anio] = {1: [], 2: []}
            estructura[anio][cuatrimestre].append(MateriaPlanSerializer(materia).data)
        
        return Response({
            'plan': PlanDeEstudioSerializer(plan).data,
            'estructura': estructura
        })

    @action(detail=True, methods=['post'])
    def reordenar(self, request, pk=None):
        plan = self.get_object()
        reorder_data = request.data.get('materias', [])
        
        for item in reorder_data:
            MateriaPlan.objects.filter(
                id=item['id'],
                plan_de_estudio=plan
            ).update(orden=item.get('orden', 0))
        
        return Response({'status': 'Orden actualizado correctamente'})

    @action(detail=True, methods=['post'])
    def clonar(self, request, pk=None):
        plan_original = self.get_object()
        
        nuevo_plan = PlanDeEstudio.objects.create(
            nombre=request.data.get('nombre', f"{plan_original.nombre} (copia)"),
            anio_aprobacion=request.data.get('anio_aprobacion', plan_original.anio_aprobacion),
            carrera=plan_original.carrera,
            duracion_anios=plan_original.duracion_anios,
            carga_horaria_total=plan_original.carga_horaria_total,
            creditos_totales=plan_original.creditos_totales,
            es_vigente=False
        )
        
        for materia_plan in plan_original.materias_plan.all():
            MateriaPlan.objects.create(
                plan_de_estudio=nuevo_plan,
                materia=materia_plan.materia,
                anio_cursado=materia_plan.anio_cursado,
                cuatrimestre=materia_plan.cuatrimestre,
                area_disciplinar=materia_plan.area_disciplinar,
                formato=materia_plan.formato,
                es_optativa=materia_plan.es_optativa,
                es_electiva=materia_plan.es_electiva,
                orden=materia_plan.orden
            )
        
        return Response(PlanDeEstudioSerializer(nuevo_plan).data, status=status.HTTP_201_CREATED)
