from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('carreras', '__first__'),
        ('materias', '__first__'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlanDeEstudio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(default='Plan 2026', max_length=200)),
                ('anio_aprobacion', models.IntegerField()),
                ('duracion_anios', models.IntegerField()),
                ('carga_horaria_total', models.IntegerField(help_text='Horas totales del plan')),
                ('creditos_totales', models.IntegerField()),
                ('es_vigente', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('carrera', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='planes', to='carreras.carrera')),
            ],
            options={
                'verbose_name': 'Plan de Estudio',
                'verbose_name_plural': 'Planes de Estudio',
                'ordering': ['-anio_aprobacion', 'nombre'],
            },
        ),
        migrations.CreateModel(
            name='MateriaPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('anio_cursado', models.IntegerField(help_text='1°, 2°, 3°, 4° año')),
                ('cuatrimestre', models.IntegerField(help_text='1 o 2')),
                ('area_disciplinar', models.CharField(choices=[('Matemáticas', 'Matemáticas'), ('Derecho', 'Derecho'), ('Gestión y Estrategia', 'Gestión y Estrategia'), ('Finanzas y Economía', 'Finanzas y Economía'), ('Marketing', 'Marketing'), ('Administración de Personas', 'Administración de Personas'), ('Administración de Operaciones y Tecnología', 'Administración de Operaciones y Tecnología'), ('Profesional', 'Profesional')], max_length=100)),
                ('formato', models.CharField(choices=[('Teórico aplicado', 'Teórico aplicado'), ('Taller', 'Taller'), ('Aplicación práctica de la Teoría', 'Aplicación práctica de la Teoría')], max_length=50)),
                ('es_optativa', models.BooleanField(default=False)),
                ('es_electiva', models.BooleanField(default=False)),
                ('orden', models.IntegerField(help_text='Orden de visualización en la malla')),
                ('materia', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='planes_materia', to='materias.materia')),
                ('plan_de_estudio', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='materias_plan', to='planes.plandeestudio')),
            ],
            options={
                'verbose_name': 'Materia del Plan',
                'verbose_name_plural': 'Materias del Plan',
                'ordering': ['anio_cursado', 'cuatrimestre', 'orden'],
                'unique_together': {('plan_de_estudio', 'materia')},
            },
        ),
    ]