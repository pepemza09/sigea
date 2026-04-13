from rest_framework import serializers
from django.db.models import F
from .models import Materia


class MateriaSerializer(serializers.ModelSerializer):
    planes_count = serializers.SerializerMethodField()
    planes_nombres = serializers.SerializerMethodField()
    planes = serializers.SerializerMethodField()
    
    class Meta:
        model = Materia
        fields = ['id', 'codigo', 'nombre', 'descripcion', 'horas_interaccion_pedagogica',
                  'horas_trabajo_autonomo', 'horas_totales', 'creditos', 
                  'created_at', 'updated_at', 'planes_count', 'planes_nombres', 'planes']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_planes_count(self, obj):
        return obj.planes_materia.count()
    
    def get_planes_nombres(self, obj):
        planes = obj.planes_materia.select_related('plan_de_estudio').values_list('plan_de_estudio__nombre', flat=True)
        return list(set(planes))
    
    def get_planes(self, obj):
        planes = []
        for mp in obj.planes_materia.select_related('plan_de_estudio'):
            planes.append({
                'id': mp.id,
                'plan_de_estudio': mp.plan_de_estudio_id,
                'plan_nombre': mp.plan_de_estudio.nombre
            })
        return planes
