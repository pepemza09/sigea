from django.db import models
from django.core.exceptions import ValidationError
from apps.carreras.models import Carrera


class Area(models.Model):
    nombre = models.CharField(max_length=200)
    plan_de_estudio = models.ForeignKey(
        PlanDeEstudio,
        on_delete=models.CASCADE,
        related_name='areas'
    )
    descripcion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Área'
        verbose_name_plural = 'Áreas'
        ordering = ['nombre']
        unique_together = ['nombre', 'plan_de_estudio']

    def __str__(self):
        return f"{self.nombre} - {self.plan_de_estudio.nombre}"


class PlanDeEstudio(models.Model):
    AREA_DISCIPLINAR_CHOICES = [
        ('Matemáticas', 'Matemáticas'),
        ('Derecho', 'Derecho'),
        ('Gestión y Estrategia', 'Gestión y Estrategia'),
        ('Finanzas y Economía', 'Finanzas y Economía'),
        ('Marketing', 'Marketing'),
        ('Administración de Personas', 'Administración de Personas'),
        ('Administración de Operaciones y Tecnología', 'Administración de Operaciones y Tecnología'),
        ('Profesional', 'Profesional'),
    ]

    FORMATO_CHOICES = [
        ('Teórico aplicado', 'Teórico aplicado'),
        ('Taller', 'Taller'),
        ('Aplicación práctica de la Teoría', 'Aplicación práctica de la Teoría'),
    ]

    nombre = models.CharField(max_length=200, default='Plan 2026')
    anio_aprobacion = models.IntegerField()
    carrera = models.ForeignKey(
        Carrera,
        on_delete=models.CASCADE,
        related_name='planes'
    )
    duracion_anios = models.IntegerField()
    carga_horaria_total = models.IntegerField(help_text='Horas totales del plan')
    creditos_totales = models.IntegerField()
    es_vigente = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Plan de Estudio'
        verbose_name_plural = 'Planes de Estudio'
        ordering = ['-anio_aprobacion', 'nombre']

    def __str__(self):
        return f"{self.nombre} - {self.carrera.nombre}"

    def delete(self, *args, **kwargs):
        if self.materias_plan.exists():
            raise ValidationError(
                f"No se puede eliminar el plan de estudio '{self.nombre}' porque tiene materias associadas."
            )
        if self.equivalencias_origen.exists() or self.equivalencias_destino.exists():
            raise ValidationError(
                f"No se puede eliminar el plan de estudio '{self.nombre}' porque está involucrado en una o más equivalências."
            )
        super().delete(*args, **kwargs)


class MateriaPlan(models.Model):
    plan_de_estudio = models.ForeignKey(
        PlanDeEstudio,
        on_delete=models.CASCADE,
        related_name='materias_plan'
    )
    materia = models.ForeignKey(
        'materias.Materia',
        on_delete=models.CASCADE,
        related_name='planes_materia'
    )
    anio_cursado = models.IntegerField(help_text='1°, 2°, 3°, 4° año')
    cuatrimestre = models.IntegerField(help_text='1 o 2')
    area_disciplinar = models.CharField(max_length=100, choices=PlanDeEstudio.AREA_DISCIPLINAR_CHOICES)
    formato = models.CharField(max_length=50, choices=PlanDeEstudio.FORMATO_CHOICES)
    es_optativa = models.BooleanField(default=False)
    es_electiva = models.BooleanField(default=False)
    orden = models.IntegerField(help_text='Orden de visualización en la malla')

    class Meta:
        verbose_name = 'Materia del Plan'
        verbose_name_plural = 'Materias del Plan'
        unique_together = ['plan_de_estudio', 'materia']
        ordering = ['anio_cursado', 'cuatrimestre', 'orden']

    def __str__(self):
        return f"{self.materia.codigo} - {self.materia.nombre} ({self.anio_cursado}° año, {self.cuatrimestre}° cuatrimestre)"
