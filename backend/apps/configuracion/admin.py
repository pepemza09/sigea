from django.contrib import admin
from .models import ConfiguracionGeneral


@admin.register(ConfiguracionGeneral)
class ConfiguracionGeneralAdmin(admin.ModelAdmin):
    list_display = ['clave', 'valor', 'es_sensible', 'updated_at']
    list_filter = ['es_sensible']
    search_fields = ['clave', 'descripcion']
