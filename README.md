# SIGeA - Sistema Integral de Gestión Académica

Sistema para gestionar unidades académicas, carreras, planes de estudio, materias y equivalencias entre planes. Basado en el plan de estudios 2026 de Lic. en Administración de la UNCuyo.

## Tecnologías

### Backend
- Django 5.0+
- Django REST Framework
- PostgreSQL
- Gunicorn
- Nginx

### Frontend
- React 18
- Tailwind CSS
- Vite
- Axios
- React Router DOM
- React Hot Toast
- Lucide React (iconos)

## Estructura del Proyecto

```
sigea/
├── backend/               # Proyecto Django
│   ├── core/              # Configuración Django
│   ├── apps/              # Aplicaciones
│   │   ├── unidades_academicas/
│   │   ├── carreras/
│   │   ├── planes/
│   │   ├── materias/
│   │   └── equivalencias/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── manage.py
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── services/
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── nginx/
│   └── backend/           # Configuración Nginx para Django
├── docker-compose.yml
└── README.md
```

## Requisitos Previos

- Docker
- Docker Compose

## Instrucciones de Instalación

### 1. Clonar el proyecto
```bash
git clone <repositorio> sigea
cd sigea
```

### 2. Iniciar los servicios
```bash
docker-compose up --build
```

Esto construirá las imágenes y levantará los servicios:
- **postgres_db**: Base de datos PostgreSQL (puerto 5432)
- **backend_django**: API Django (puerto interno 8000)
- **nginx_backend**: Proxy Nginx para Django (puerto 8001)
- **frontend_nginx**: Aplicación React (puerto 80)

### 3. Acceder a la aplicación

- **Frontend**: http://localhost:80
- **API Django**: http://localhost:8001
- **Admin Django**: http://localhost:8001/admin/

## Credenciales

### Admin Django
- **Usuario**: admin
- **Contraseña**: admin123

### Base de datos
- **Base de datos**: sigea
- **Usuario**: sigea_user
- **Contraseña**: sigea_pass_2026

## Datos Iniciales

Al iniciar el sistema se cargan automáticamente:
1. **Unidad Académica**: Facultad de Ciencias Económicas (FCE)
2. **Carrera**: Licenciatura en Administración
3. **Plan 2026**: Plan de Estudios 2026 (vigente) con 28 materias
4. **Plan 2019**: Plan de Estudios 2019 (no vigente) - para equivalencias
5. **Equivalencias**: Correspondencias básicas entre planes

## Características

### Gestión de Unidades Académicas
- CRUD completo
- Ver carreras asociadas
- Eliminación bloqueada si tiene carreras

### Gestión de Carreras
- CRUD con filtro por Unidad Académica
- Ver planes de estudio asociados
- Eliminación bloqueada si tiene planes

### Gestión de Planes de Estudio
- CRUD con filtro por Carrera
- Clonar planes
- Ver malla curricular interactiva

### Malla Curricular
- Visualización por años y cuatrimestres
- Tarjetas de materias con código, nombre, créditos
- Colores por área disciplinar
- Editar materia del plan

### Gestión de Materias
- Catálogo global de materias
- Ver en qué planes está utilizada
- Eliminación bloqueada si está en uso

### Gestión de Equivalencias
- Crear equivalencias entre planes
- Vista comparativa de materias
- Editar equivalencias materia por materia
- Agregar/eliminar detalles

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET/POST | `/api/unidades-academicas/` | Listado y creación |
| GET/PUT/DELETE | `/api/unidades-academicas/{id}/` | Detalle, actualización, eliminación |
| GET/POST | `/api/carreras/` | Listado y creación |
| GET/PUT/DELETE | `/api/carreras/{id}/` | Detalle, actualización, eliminación |
| GET/POST | `/api/planes/` | Listado y creación |
| GET/PUT/DELETE | `/api/planes/{id}/` | Detalle, actualización, eliminación |
| GET | `/api/planes/{id}/malla/` | Estructura de años/cuatrimestres |
| POST | `/api/planes/{id}/reordenar/` | Actualizar orden de materias |
| POST | `/api/planes/{id}/clonar/` | Clonar plan |
| GET/POST | `/api/materias/` | Listado y creación |
| GET/PUT/DELETE | `/api/materias/{id}/` | Detalle, actualización, eliminación |
| GET/POST | `/api/equivalencias/` | Listado y creación |
| GET/PUT/DELETE | `/api/equivalencias/{id}/` | Detalle, actualización, eliminación |
| GET | `/api/equivalencias/comparativa/` | Comparar planes |
| POST | `/api/equivalencias/{id}/agregar_detalle/` | Agregar detalle |
| PUT | `/api/equivalencias/{id}/detalle/{detalle_id}/` | Editar detalle |
| DELETE | `/api/equivalencias/{id}/detalle/{detalle_id}/` | Eliminar detalle |

## Desarrollo

### Backend
```bash
cd backend
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm run dev
```

## Theme

La aplicación soporta modo claro y oscuro. El cambio se realiza desde el sidebar y se guarda en localStorage.

## Licencia

MIT
