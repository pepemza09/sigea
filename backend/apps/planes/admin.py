from django.contrib import admin
from .models import PlanDeEstudio, MateriaPlan, Area


@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'plan_de_estudio', 'created_at']
    list_filter = ['plan_de_estudio']
    search_fields = ['nombre', 'plan_de_estudio__nombre']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PlanDeEstudio)
class PlanDeEstudioAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'carrera', 'anio_aprobacion', 'es_vigente', 'created_at']
    list_filter = ['carrera', 'es_vigente']
    search_fields = ['nombre']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(MateriaPlan)
class MateriaPlanAdmin(admin.ModelAdmin):
    list_display = ['materia', 'plan_de_estudio', 'anio_cursado', 'cuatrimestre']
    list_filter = ['plan_de_estudio', 'anio_cursado', 'cuatrimestre']
    search_fields = ['materia__nombre', 'materia__codigo']
