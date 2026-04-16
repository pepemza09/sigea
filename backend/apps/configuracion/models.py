from django.db import models


class ConfiguracionGeneral(models.Model):
    clave = models.CharField(max_length=100, unique=True)
    valor = models.TextField()
    descripcion = models.TextField(blank=True)
    es_sensible = models.BooleanField(default=False, help_text="Si el valor es sensible (contraseñas, claves, etc.)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Configuración General'
        verbose_name_plural = 'Configuraciones Generales'
        ordering = ['clave']

    def __str__(self):
        return self.clave

    def save(self, *args, **kwargs):
        if self.es_sensible and self.valor and not self.valor.startswith('***'):
            self.valor = '***' + self.valor
        super().save(*args, **kwargs)
