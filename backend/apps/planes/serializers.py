from rest_framework import serializers
from apps.unidades_academicas.serializers import UnidadAcademicaSerializer
from .models import PlanDeEstudio, MateriaPlan


class MateriaPlanSerializer(serializers.ModelSerializer):
    materia_codigo = serializers.CharField(source='materia.codigo', read_only=True)
    materia_nombre = serializers.CharField(source='materia.nombre', read_only=True)
    materia_creditos = serializers.DecimalField(source='materia.creditos', max_digits=5, decimal_places=2, read_only=True)
    materia_horas_totales = serializers.IntegerField(source='materia.horas_totales', read_only=True)
    
    class Meta:
        model = MateriaPlan
        fields = ['id', 'materia', 'materia_codigo', 'materia_nombre', 'materia_creditos', 
                  'materia_horas_totales', 'anio_cursado', 'cuatrimestre', 'area_disciplinar',
                  'formato', 'es_optativa', 'es_electiva', 'orden']
        read_only_fields = ['materia_codigo', 'materia_nombre', 'materia_creditos', 'materia_horas_totales']


class PlanDeEstudioSerializer(serializers.ModelSerializer):
    carrera_nombre = serializers.CharField(source='carrera.nombre', read_only=True)
    unidad_academica = serializers.CharField(source='carrera.unidad_academica.sigla', read_only=True)
    materias_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PlanDeEstudio
        fields = ['id', 'nombre', 'anio_aprobacion', 'carrera', 'carrera_nombre', 'unidad_academica',
                  'duracion_anios', 'carga_horaria_total', 'creditos_totales', 'es_vigente',
                  'created_at', 'updated_at', 'materias_count']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_materias_count(self, obj):
        return obj.materias_plan.count()
