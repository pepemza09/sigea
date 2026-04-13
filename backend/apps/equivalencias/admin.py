from django.contrib import admin
from .models import Equivalencia, EquivalenciaDetalle


@admin.register(Equivalencia)
class EquivalenciaAdmin(admin.ModelAdmin):
    list_display = ['plan_origen', 'plan_destino', 'created_at']
    list_filter = ['plan_origen', 'plan_destino']
    readonly_fields = ['created_at']


@admin.register(EquivalenciaDetalle)
class EquivalenciaDetalleAdmin(admin.ModelAdmin):
    list_display = ['equivalencia', 'materia_origen', 'materia_destino', 'tipo']
    list_filter = ['tipo']
    search_fields = ['materia_origen__materia__nombre', 'materia_destino__materia__nombre']
