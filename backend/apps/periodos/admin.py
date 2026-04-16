from django.contrib import admin
from .models import PeriodoLectivo


@admin.register(PeriodoLectivo)
class PeriodoLectivoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'anio', 'numero', 'tipo', 'estado', 'es_actual', 'fecha_inicio', 'fecha_fin']
    list_filter = ['anio', 'tipo', 'estado', 'es_actual']
    search_fields = ['nombre']
    ordering = ['-anio', '-numero']
