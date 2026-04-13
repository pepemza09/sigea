from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('materias', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='materia',
            name='anio_cuatrimestre_default',
            field=models.IntegerField(default=1, help_text='Año por defecto en la malla curricular'),
        ),
        migrations.AddField(
            model_name='materia',
            name='cuatrimestre_default',
            field=models.IntegerField(default=1, help_text='Cuatrimestre por defecto en la malla curricular'),
        ),
    ]