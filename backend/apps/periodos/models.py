from django.db import models


class PeriodoLectivo(models.Model):
    TIPO_CHOICES = [
        ('anual', 'Anual'),
        ('cuatrimestral', 'Cuatrimestral'),
        ('semestral', 'Semestral'),
        ('trimestral', 'Trimestral'),
    ]
    
    ESTADO_CHOICES = [
        ('borrador', 'Borrador'),
        ('inscripcion', 'Inscripción'),
        ('activo', 'Activo'),
        ('cerrado', 'Cerrado'),
    ]

    nombre = models.CharField(max_length=200)
    anio = models.IntegerField()
    numero = models.IntegerField(help_text="Número del período dentro del año (1, 2, 3, 4)", default=1)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='cuatrimestral')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    fecha_inicio_inscripcion = models.DateField(null=True, blank=True)
    fecha_fin_inscripcion = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='borrador')
    es_actual = models.BooleanField(default=False, help_text="Marca este período como el actual")
    observaciones = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Período Lectivo'
        verbose_name_plural = 'Períodos Lectivos'
        ordering = ['-anio', '-numero']
        unique_together = ['anio', 'numero', 'tipo']

    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_display()})"

    def save(self, *args, **kwargs):
        if self.es_actual:
            PeriodoLectivo.objects.filter(es_actual=True).update(es_actual=False)
        super().save(*args, **kwargs)
