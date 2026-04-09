from rest_framework import serializers
from .models import UnidadAcademica


class UnidadAcademicaSerializer(serializers.ModelSerializer):
    carreras_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UnidadAcademica
        fields = ['id', 'nombre', 'sigla', 'descripcion', 'created_at', 'updated_at', 'carreras_count']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_carreras_count(self, obj):
        return obj.carreras.count()
