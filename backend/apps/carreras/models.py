from django.db import models
from django.core.exceptions import ValidationError
from apps.unidades_academicas.models import UnidadAcademica


class Carrera(models.Model):
    nombre = models.CharField(max_length=200)
    unidad_academica = models.ForeignKey(
        UnidadAcademica,
        on_delete=models.CASCADE,
        related_name='carreras'
    )
    duracion_anios = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Carrera'
        verbose_name_plural = 'Carreras'
        ordering = ['nombre']

    def __str__(self):
        return f"{self.nombre} ({self.unidad_academica.sigla})"

    def delete(self, *args, **kwargs):
        if self.planes.exists():
            raise ValidationError(
                f"No se puede eliminar la carrera '{self.nombre}' porque tiene planes de estudio associados."
            )
        super().delete(*args, **kwargs)
