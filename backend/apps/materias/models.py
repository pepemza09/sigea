from django.db import models
from django.core.exceptions import ValidationError


class Materia(models.Model):
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    horas_interaccion_pedagogica = models.IntegerField()
    horas_trabajo_autonomo = models.IntegerField()
    horas_totales = models.IntegerField()
    creditos = models.DecimalField(max_digits=5, decimal_places=2)
    anio_cuatrimestre_default = models.IntegerField(default=1, help_text="Año por defecto en la malla curricular")
    cuatrimestre_default = models.IntegerField(default=1, help_text="Cuatrimestre por defecto en la malla curricular")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Materia'
        verbose_name_plural = 'Materias'
        ordering = ['codigo']

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

    def delete(self, *args, **kwargs):
        from apps.equivalencias.models import EquivalenciaDetalle

        if EquivalenciaDetalle.objects.filter(materia_origen__materia=self).exists() or \
           EquivalenciaDetalle.objects.filter(materia_destino__materia=self).exists():
            raise ValidationError(
                f"No se puede eliminar la materia '{self.nombre}' ({self.codigo}) porque está involucrada en una o más equivalencias."
            )
        
        super().delete(*args, **kwargs)
