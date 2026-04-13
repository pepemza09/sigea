from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('planes', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Equivalencia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('plan_destino', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='equivalencias_destino', to='planes.plandeestudio')),
                ('plan_origen', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='equivalencias_origen', to='planes.plandeestudio')),
            ],
            options={
                'verbose_name': 'Equivalencia',
                'verbose_name_plural': 'Equivalencias',
                'unique_together': {('plan_origen', 'plan_destino')},
            },
        ),
        migrations.CreateModel(
            name='EquivalenciaDetalle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(choices=[('1:1', 'Uno a uno'), ('1:N', 'Una origen a varias destino'), ('N:1', 'Varias origen a una destino')], max_length=10)),
                ('equivalencia', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='detalles', to='equivalencias.equivalencia')),
                ('materia_destino', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='equiv_destino', to='planes.materiaplan')),
                ('materia_origen', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='equiv_origen', to='planes.materiaplan')),
            ],
            options={
                'verbose_name': 'Detalle de Equivalencia',
                'verbose_name_plural': 'Detalles de Equivalencias',
            },
        ),
    ]