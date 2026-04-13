from django.db import models
from apps.planes.models import PlanDeEstudio, MateriaPlan


class Equivalencia(models.Model):
    plan_origen = models.ForeignKey(
        PlanDeEstudio,
        on_delete=models.PROTECT,
        related_name='equivalencias_origen'
    )
    plan_destino = models.ForeignKey(
        PlanDeEstudio,
        on_delete=models.PROTECT,
        related_name='equivalencias_destino'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Equivalencia'
        verbose_name_plural = 'Equivalencias'
        unique_together = ['plan_origen', 'plan_destino']

    def __str__(self):
        return f"{self.plan_origen.nombre} → {self.plan_destino.nombre}"


class EquivalenciaDetalle(models.Model):
    TIPO_CHOICES = [
        ('1:1', 'Uno a uno'),
        ('1:N', 'Una origen a varias destino'),
        ('N:1', 'Varias origen a una destino'),
    ]

    equivalencia = models.ForeignKey(
        Equivalencia,
        on_delete=models.CASCADE,
        related_name='detalles'
    )
    materia_origen = models.ForeignKey(
        MateriaPlan,
        on_delete=models.PROTECT,
        related_name='equiv_origen'
    )
    materia_destino = models.ForeignKey(
        MateriaPlan,
        on_delete=models.PROTECT,
        related_name='equiv_destino'
    )
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)

    class Meta:
        verbose_name = 'Detalle de Equivalencia'
        verbose_name_plural = 'Detalles de Equivalencias'

    def __str__(self):
        return f"{self.materia_origen.materia.codigo} → {self.materia_destino.materia.codigo} ({self.tipo})"
