from django.contrib import admin
from .models import Materia


@admin.register(Materia)
class MateriaAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'creditos', 'horas_totales', 'created_at']
    search_fields = ['codigo', 'nombre']
    readonly_fields = ['created_at', 'updated_at']
