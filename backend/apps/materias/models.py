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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Materia'
        verbose_name_plural = 'Materias'
        ordering = ['codigo']

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

    def delete(self, *args, **kwargs):
        from apps.planes.models import MateriaPlan
        from apps.equivalencias.models import EquivalenciaDetalle

        if MateriaPlan.objects.filter(materia=self).exists():
            raise ValidationError(
                f"No se puede eliminar la Materia '{self.nombre}' ({self.codigo}) porque está asignada a uno o más Planes de Estudio."
            )
        
        super().delete(*args, **kwargs)
