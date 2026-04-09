from rest_framework import serializers
from .models import Carrera


class CarreraSerializer(serializers.ModelSerializer):
    unidad_academica_nombre = serializers.CharField(source='unidad_academica.nombre', read_only=True)
    unidad_academica_sigla = serializers.CharField(source='unidad_academica.sigla', read_only=True)
    planes_count = serializers.SerializerMethodField()
    plan_vigente = serializers.SerializerMethodField()
    
    class Meta:
        model = Carrera
        fields = ['id', 'nombre', 'unidad_academica', 'unidad_academica_nombre', 'unidad_academica_sigla', 
                  'duracion_anios', 'created_at', 'updated_at', 'planes_count', 'plan_vigente']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_planes_count(self, obj):
        return obj.planes.count()
    
    def get_plan_vigente(self, obj):
        plan = obj.planes.filter(es_vigente=True).first()
        if plan:
            return {'id': plan.id, 'nombre': plan.nombre}
        return None
