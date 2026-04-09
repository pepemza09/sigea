from django.db import models
from django.core.exceptions import ValidationError


class UnidadAcademica(models.Model):
    nombre = models.CharField(max_length=200)
    sigla = models.CharField(max_length=20)
    descripcion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Unidad Académica'
        verbose_name_plural = 'Unidades Académicas'
        ordering = ['nombre']

    def __str__(self):
        return f"{self.sigla} - {self.nombre}"

    def delete(self, *args, **kwargs):
        if self.carreras.exists():
            raise ValidationError(
                f"No se puede eliminar la Unidad Académica '{self.nombre}' porque tiene Carreras asociadas."
            )
        super().delete(*args, **kwargs)
