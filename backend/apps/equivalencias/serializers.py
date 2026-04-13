from rest_framework import serializers
from apps.planes.serializers import MateriaPlanSerializer
from .models import Equivalencia, EquivalenciaDetalle


class EquivalenciaDetalleSerializer(serializers.ModelSerializer):
    materia_origen_codigo = serializers.CharField(source='materia_origen.materia.codigo', read_only=True)
    materia_origen_nombre = serializers.CharField(source='materia_origen.materia.nombre', read_only=True)
    materia_destino_codigo = serializers.CharField(source='materia_destino.materia.codigo', read_only=True)
    materia_destino_nombre = serializers.CharField(source='materia_destino.materia.nombre', read_only=True)
    
    class Meta:
        model = EquivalenciaDetalle
        fields = ['id', 'materia_origen', 'materia_origen_codigo', 'materia_origen_nombre',
                  'materia_destino', 'materia_destino_codigo', 'materia_destino_nombre', 'tipo']
    
    def validate(self, data):
        if data['materia_origen'].plan_de_estudio != data['equivalencia'].plan_origen:
            raise serializers.ValidationError({
                'materia_origen': 'La materia origen debe pertenecer al plan de origen.'
            })
        if data['materia_destino'].plan_de_estudio != data['equivalencia'].plan_destino:
            raise serializers.ValidationError({
                'materia_destino': 'La materia destino debe pertenecer al plan de destino.'
            })
        return data


class EquivalenciaSerializer(serializers.ModelSerializer):
    plan_origen_nombre = serializers.CharField(source='plan_origen.nombre', read_only=True)
    plan_destino_nombre = serializers.CharField(source='plan_destino.nombre', read_only=True)
    detalles = EquivalenciaDetalleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Equivalencia
        fields = ['id', 'plan_origen', 'plan_origen_nombre', 'plan_destino', 'plan_destino_nombre',
                  'created_at', 'detalles']
        read_only_fields = ['created_at']
