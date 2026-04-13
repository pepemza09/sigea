from django.core.management.base import BaseCommand
from django.core.management import execute_from_command_line
import sys
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.unidades_academicas.models import UnidadAcademica
from apps.carreras.models import Carrera
from apps.planes.models import PlanDeEstudio, MateriaPlan
from apps.materias.models import Materia
from apps.equivalencias.models import Equivalencia, EquivalenciaDetalle


class Command(BaseCommand):
    help = 'Carga datos iniciales para SIGeA'

    def handle(self, *args, **options):
        self.stdout.write('Iniciando carga de datos...')
        
        unidad, created = UnidadAcademica.objects.get_or_create(
            nombre='Facultad de Ciencias Económicas',
            defaults={
                'sigla': 'FCE',
                'descripcion': 'Facultad de la Universidad Nacional de Cuyo'
            }
        )
        self.stdout.write(self.style.SUCCESS(f'Unidad Académica: {"Creada" if created else "Ya existía"} - {unidad.nombre}'))
        
        carrera, created = Carrera.objects.get_or_create(
            nombre='Licenciatura en Administración',
            defaults={
                'unidad_academica': unidad,
                'duracion_anios': 4
            }
        )
        self.stdout.write(self.style.SUCCESS(f'Carrera: {"Creada" if created else "Ya existía"} - {carrera.nombre}'))
        
        plan_2026, created = PlanDeEstudio.objects.get_or_create(
            nombre='Plan de Estudios 2026',
            defaults={
                'anio_aprobacion': 2026,
                'carrera': carrera,
                'duracion_anios': 4,
                'carga_horaria_total': 6006,
                'creditos_totales': 240,
                'es_vigente': True
            }
        )
        self.stdout.write(self.style.SUCCESS(f'Plan 2026: {"Creado" if created else "Ya existía"}'))
        
        plan_2019, created = PlanDeEstudio.objects.get_or_create(
            nombre='Plan de Estudios 2019',
            defaults={
                'anio_aprobacion': 2019,
                'carrera': carrera,
                'duracion_anios': 4,
                'carga_horaria_total': 5500,
                'creditos_totales': 220,
                'es_vigente': False
            }
        )
        self.stdout.write(self.style.SUCCESS(f'Plan 2019: {"Creado" if created else "Ya existía"}'))
        
        materias_data = [
            {"codigo": "570101", "nombre": "Sistemas Integrados de Información", "horas_ip": 75, "horas_tae": 175, "horas_totales": 250, "creditos": 10},
            {"codigo": "570102", "nombre": "Principios y Aplicaciones de Administración", "horas_ip": 75, "horas_tae": 175, "horas_totales": 250, "creditos": 10},
            {"codigo": "570103", "nombre": "Principios de Micro y Macroeconomía", "horas_ip": 75, "horas_tae": 150, "horas_totales": 225, "creditos": 9},
            {"codigo": "570104", "nombre": "Matemática aplicada a la Administración", "horas_ip": 75, "horas_tae": 175, "horas_totales": 250, "creditos": 10},
            {"codigo": "570105", "nombre": "Derecho Privado", "horas_ip": 60, "horas_tae": 115, "horas_totales": 175, "creditos": 7},
            {"codigo": "570106", "nombre": "Fundamentos de Marketing", "horas_ip": 60, "horas_tae": 115, "horas_totales": 175, "creditos": 7},
            {"codigo": "570107", "nombre": "Administración de Personas", "horas_ip": 60, "horas_tae": 115, "horas_totales": 175, "creditos": 7},
            {"codigo": "570201", "nombre": "Administración: Estructuras y Estrategias", "horas_ip": 75, "horas_tae": 100, "horas_totales": 175, "creditos": 7},
            {"codigo": "570202", "nombre": "Costos para Decisiones", "horas_ip": 60, "horas_tae": 90, "horas_totales": 150, "creditos": 6},
            {"codigo": "570203", "nombre": "Estadística Aplicada a la Administración", "horas_ip": 75, "horas_tae": 125, "horas_totales": 200, "creditos": 8},
            {"codigo": "570204", "nombre": "Derecho Constitucional y Administrativo", "horas_ip": 60, "horas_tae": 90, "horas_totales": 150, "creditos": 6},
            {"codigo": "570205", "nombre": "Administración Financiera I", "horas_ip": 60, "horas_tae": 115, "horas_totales": 175, "creditos": 7},
            {"codigo": "570206", "nombre": "Administración de Operaciones", "horas_ip": 60, "horas_tae": 115, "horas_totales": 175, "creditos": 7},
            {"codigo": "570207", "nombre": "Régimen Impositivo", "horas_ip": 60, "horas_tae": 115, "horas_totales": 175, "creditos": 7},
            {"codigo": "570208", "nombre": "Matemática Financiera", "horas_ip": 90, "horas_tae": 110, "horas_totales": 200, "creditos": 8},
            {"codigo": "570209", "nombre": "Práctica Laboral", "horas_ip": 80, "horas_tae": 20, "horas_totales": 100, "creditos": 4},
            {"codigo": "570301", "nombre": "Investigación de Mercados", "horas_ip": 60, "horas_tae": 115, "horas_totales": 175, "creditos": 7},
            {"codigo": "570302", "nombre": "Macroeconomía", "horas_ip": 60, "horas_tae": 115, "horas_totales": 175, "creditos": 7},
            {"codigo": "570303", "nombre": "Derecho Laboral para Administración de Personas", "horas_ip": 60, "horas_tae": 140, "horas_totales": 200, "creditos": 8},
            {"codigo": "570304", "nombre": "Administración del Sector Público", "horas_ip": 75, "horas_tae": 150, "horas_totales": 225, "creditos": 9},
            {"codigo": "570305", "nombre": "Diseño y gestión de Organizaciones", "horas_ip": 75, "horas_tae": 150, "horas_totales": 225, "creditos": 9},
            {"codigo": "570306", "nombre": "Marketing Estratégico", "horas_ip": 60, "horas_tae": 115, "horas_totales": 175, "creditos": 7},
            {"codigo": "570307", "nombre": "Comportamiento Humano en las Organizaciones", "horas_ip": 60, "horas_tae": 115, "horas_totales": 175, "creditos": 7},
            {"codigo": "570401", "nombre": "Administración Financiera II", "horas_ip": 75, "horas_tae": 175, "horas_totales": 250, "creditos": 10},
            {"codigo": "570402", "nombre": "Trabajo Final Integrador", "horas_ip": 60, "horas_tae": 190, "horas_totales": 250, "creditos": 10},
            {"codigo": "570403", "nombre": "Inteligencia Estratégica y Creación de Valor", "horas_ip": 75, "horas_tae": 150, "horas_totales": 225, "creditos": 9},
            {"codigo": "570404", "nombre": "Administración Estratégica", "horas_ip": 75, "horas_tae": 175, "horas_totales": 250, "creditos": 10},
            {"codigo": "570405", "nombre": "Práctica Profesional", "horas_ip": 85, "horas_tae": 140, "horas_totales": 225, "creditos": 9},
        ]
        
        materias_creadas = {}
        for m in materias_data:
            materia, created = Materia.objects.get_or_create(
                codigo=m['codigo'],
                defaults={
                    'nombre': m['nombre'],
                    'horas_interaccion_pedagogica': m['horas_ip'],
                    'horas_trabajo_autonomo': m['horas_tae'],
                    'horas_totales': m['horas_totales'],
                    'creditos': m['creditos']
                }
            )
            materias_creadas[m['codigo']] = materia
        
        self.stdout.write(self.style.SUCCESS(f'{len(materias_creadas)} materias creadas/verificadas'))
        
        materias_plan_data = [
            {"codigo": "570101", "anio": 1, "cuatri": 1, "area": "Finanzas y Economía", "formato": "Teórico aplicado", "orden": 1},
            {"codigo": "570102", "anio": 1, "cuatri": 1, "area": "Gestión y Estrategia", "formato": "Teórico aplicado", "orden": 2},
            {"codigo": "570103", "anio": 1, "cuatri": 1, "area": "Finanzas y Economía", "formato": "Teórico aplicado", "orden": 3},
            {"codigo": "570104", "anio": 1, "cuatri": 2, "area": "Matemáticas", "formato": "Teórico aplicado", "orden": 1},
            {"codigo": "570105", "anio": 1, "cuatri": 2, "area": "Derecho", "formato": "Teórico aplicado", "orden": 2},
            {"codigo": "570106", "anio": 1, "cuatri": 2, "area": "Marketing", "formato": "Teórico aplicado", "orden": 3},
            {"codigo": "570107", "anio": 1, "cuatri": 2, "area": "Administración de Personas", "formato": "Teórico aplicado", "orden": 4},
            {"codigo": "570201", "anio": 2, "cuatri": 1, "area": "Gestión y Estrategia", "formato": "Taller", "orden": 1},
            {"codigo": "570202", "anio": 2, "cuatri": 1, "area": "Finanzas y Economía", "formato": "Teórico aplicado", "orden": 2},
            {"codigo": "570203", "anio": 2, "cuatri": 1, "area": "Matemáticas", "formato": "Teórico aplicado", "orden": 3},
            {"codigo": "570204", "anio": 2, "cuatri": 1, "area": "Derecho", "formato": "Taller", "orden": 4},
            {"codigo": "570205", "anio": 2, "cuatri": 2, "area": "Finanzas y Economía", "formato": "Teórico aplicado", "orden": 1},
            {"codigo": "570206", "anio": 2, "cuatri": 2, "area": "Administración de Operaciones y Tecnología", "formato": "Teórico aplicado", "orden": 2},
            {"codigo": "570207", "anio": 2, "cuatri": 2, "area": "Finanzas y Economía", "formato": "Teórico aplicado", "orden": 3},
            {"codigo": "570208", "anio": 2, "cuatri": 2, "area": "Matemáticas", "formato": "Teórico aplicado", "orden": 4},
            {"codigo": "570209", "anio": 2, "cuatri": 2, "area": "Profesional", "formato": "Aplicación práctica de la Teoría", "orden": 5},
            {"codigo": "570301", "anio": 3, "cuatri": 1, "area": "Marketing", "formato": "Teórico aplicado", "orden": 1},
            {"codigo": "570302", "anio": 3, "cuatri": 1, "area": "Finanzas y Economía", "formato": "Teórico aplicado", "orden": 2},
            {"codigo": "570303", "anio": 3, "cuatri": 1, "area": "Administración de Personas", "formato": "Teórico aplicado", "orden": 3},
            {"codigo": "570304", "anio": 3, "cuatri": 1, "area": "Gestión y Estrategia", "formato": "Teórico aplicado", "orden": 4},
            {"codigo": "570305", "anio": 3, "cuatri": 2, "area": "Gestión y Estrategia", "formato": "Taller", "orden": 1},
            {"codigo": "570306", "anio": 3, "cuatri": 2, "area": "Marketing", "formato": "Teórico aplicado", "orden": 2},
            {"codigo": "570307", "anio": 3, "cuatri": 2, "area": "Administración de Personas", "formato": "Teórico aplicado", "orden": 3},
            {"codigo": "570401", "anio": 4, "cuatri": 1, "area": "Finanzas y Economía", "formato": "Teórico aplicado", "orden": 1},
            {"codigo": "570402", "anio": 4, "cuatri": 1, "area": "Profesional", "formato": "Teórico aplicado", "orden": 2},
            {"codigo": "570403", "anio": 4, "cuatri": 1, "area": "Gestión y Estrategia", "formato": "Taller", "orden": 3},
            {"codigo": "570404", "anio": 4, "cuatri": 2, "area": "Gestión y Estrategia", "formato": "Teórico aplicado", "orden": 1},
            {"codigo": "570405", "anio": 4, "cuatri": 2, "area": "Profesional", "formato": "Aplicación práctica de la teoría", "orden": 2},
        ]
        
        for mp in materias_plan_data:
            materia = materias_creadas[mp['codigo']]
            mp_obj, created = MateriaPlan.objects.get_or_create(
                plan_de_estudio=plan_2026,
                materia=materia,
                defaults={
                    'anio_cursado': mp['anio'],
                    'cuatrimestre': mp['cuatri'],
                    'area_disciplinar': mp['area'],
                    'formato': mp['formato'],
                    'orden': mp['orden']
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'{len(materias_plan_data)} materias del plan 2026 creadas/verificadas'))
        
        self.stdout.write(self.style.SUCCESS('¡Carga de datos completada exitosamente!'))
