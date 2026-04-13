from django.contrib import admin
from .models import Carrera


@admin.register(Carrera)
class CarreraAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'unidad_academica', 'duracion_anios', 'created_at']
    list_filter = ['unidad_academica']
    search_fields = ['nombre']
    readonly_fields = ['created_at', 'updated_at']
