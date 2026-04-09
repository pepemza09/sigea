from django.contrib import admin
from .models import UnidadAcademica


@admin.register(UnidadAcademica)
class UnidadAcademicaAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'sigla', 'created_at', 'updated_at']
    search_fields = ['nombre', 'sigla']
    readonly_fields = ['created_at', 'updated_at']
