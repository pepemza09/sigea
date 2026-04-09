from rest_framework import viewsets, status
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
