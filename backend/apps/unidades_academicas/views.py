from rest_framework import viewsets, status
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from .models import UnidadAcademica
from .serializers import UnidadAcademicaSerializer


class UnidadAcademicaViewSet(viewsets.ModelViewSet):
    queryset = UnidadAcademica.objects.all()
    serializer_class = UnidadAcademicaSerializer
    search_fields = ['nombre', 'sigla']
    filterset_fields = ['nombre', 'sigla']

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
