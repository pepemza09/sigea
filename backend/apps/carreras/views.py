from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from .models import Carrera
from .serializers import CarreraSerializer


class CarreraViewSet(viewsets.ModelViewSet):
    queryset = Carrera.objects.all()
    serializer_class = CarreraSerializer
    filterset_fields = ['unidad_academica']

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except (ValidationError, IntegrityError) as e:
            error_msg = str(e)
            if 'planes' in error_msg.lower():
                return Response({'error': 'No se puede eliminar la carrera porque tiene planes de estudio asociados'}, status=status.HTTP_409_CONFLICT)
            return Response({'error': error_msg}, status=status.HTTP_409_CONFLICT)

    @action(detail=True, methods=['get'])
    def planes(self, request, pk=None):
        from apps.planes.serializers import PlanDeEstudioSerializer
        carrera = self.get_object()
        planes = carrera.planes.all()
        serializer = PlanDeEstudioSerializer(planes, many=True)
        return Response(serializer.data)
