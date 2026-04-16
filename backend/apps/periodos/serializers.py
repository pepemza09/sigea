from rest_framework import serializers
from .models import PeriodoLectivo


class PeriodoLectivoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = PeriodoLectivo
        fields = [
            'id', 'nombre', 'anio', 'numero', 'tipo', 'tipo_display',
            'fecha_inicio', 'fecha_fin', 'fecha_inicio_inscripcion',
            'fecha_fin_inscripcion', 'estado', 'estado_display',
            'es_actual', 'observaciones', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
