from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import PeriodoLectivo
from .serializers import PeriodoLectivoSerializer


class PeriodoLectivoViewSet(viewsets.ModelViewSet):
    queryset = PeriodoLectivo.objects.all()
    serializer_class = PeriodoLectivoSerializer
    filterset_fields = ['anio', 'tipo', 'estado', 'es_actual']
    search_fields = ['nombre']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        anio = self.request.query_params.get('anio')
        if anio:
            queryset = queryset.filter(anio=int(anio))
        return queryset
