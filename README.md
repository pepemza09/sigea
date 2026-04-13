# SIGeA - Sistema Integral de Gestión Académica

Sistema de gestión académica desarrollado con Django (backend), React + Tailwind (frontend) y Docker.

## Requisitos Previos

- **Docker** versión 20.10 o superior
- **Docker Compose** versión 1.29 o superior
- **Git** (para clonar el repositorio)
- Puerto 80 disponible (o configurar puerto diferente)

## Estructura del Proyecto

```
sigea/
├── backend/           # API REST Django
│   ├── apps/          # Aplicaciones (materias, planes, carreras, etc.)
│   ├── core/          # Configuración central
│   └── requirements.txt
├── frontend/         # Aplicación React + Vite + Tailwind
│   ├── src/           # Código fuente
│   └── nginx.conf     # Configuración Nginx
├── docker-compose.yml # Orquestación de contenedores
└── README.md          # Este archivo
```

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <repositorio> sigea
cd sigea
```

### 2. Configurar Variables de Entorno (Opcional)

El sistema está configurado con valores por defecto. Si necesitás personalizar, podés crear un archivo `.env`:

```bash
# Backend
echo "DEBUG=True" > .env
echo "SECRET_KEY=tu-clave-secreta-aqui" >> .env

# Base de datos (valores por defecto)
echo "DB_NAME=sigea" >> .env
echo "DB_USER=sigea" >> .env
echo "DB_PASSWORD=sigea123" >> .env
echo "DB_HOST=db" >> .env
echo "DB_PORT=5432" >> .env
```

### 3. Levantar el Sistema

```bash
# Opción 1: Construir y levantar todo
docker compose up -d --build

# Opción 2: Solo levantar (si ya está construido)
docker compose up -d
```

### 4. Verificar que Todo Funcione

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs del backend
docker compose logs -f backend

# Ver logs del frontend
docker compose logs -f frontend
```

## Acceso a la Aplicación

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost | Aplicación web |
| Backend API | http://localhost/api | Endpoints REST |
| Admin Django | http://localhost/admin | Panel de administración |

### Credenciales por Defecto

- **Usuario admin**: `admin`
- **Contraseña admin**: `admin123`

> ⚠️ **IMPORTANTE**: Cambiar la contraseña antes de poner en producción.

## Primeros Pasos

1. **Iniciar sesión** con las credenciales de admin
2. **Crear Unidad Académica**: Ir a "Unidades Académicas" → Nueva Unidad
3. **Crear Carrera**: Ir a "Carreras" → Nueva Carrera
4. **Crear Plan de Estudio**: Ir a "Planes de Estudio" → Nuevo Plan
5. **Crear Materias**: Ir a "Materias" → Nueva Materia
6. **Agregar Materias al Plan**: Ir a "Planes" → Ver Malla → Agregar Materia
7. **Crear Equivalencias**: Ir a "Equivalencias" → Nueva Equivalencia

## Comandos Útiles

### Reiniciar servicios específicos

```bash
# Reiniciar solo el backend
docker compose restart backend

# Reiniciar solo el frontend
docker compose restart frontend
```

### Ver logs en tiempo real

```bash
docker compose logs -f
```

### Eliminar contenedores y volúmenes

```bash
docker compose down -v
```

### Regenerar la base de datos

```bash
# Detener contenedores
docker compose down

# Eliminar volumen de la base de datos
docker volume rm sigea_sigea_db

# Volver a levantar (se creará DB vacía)
docker compose up -d
```

## Solución de Problemas

### Error: "Connection refused" al backend

```bash
# Verificar que el contenedor esté corriendo
docker compose ps

# Ver logs del backend
docker compose logs backend
```

### Error: "Database is ready, but connection refused"

El backend puede demorar unos segundos en estar disponible después de que la DB esté lista. Esperá unos segundos e intentá de nuevo.

### Frontend no carga estilos

```bash
# Reconstruir el frontend
docker compose build frontend_nginx
docker compose up -d
```

### Problemas con la sesión

```bash
# Eliminar datos de sesión y reconstruir
docker compose down
docker volume rm sigea_sigea_db
docker compose up -d --build
```

## Tecnologías Utilizadas

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Backend | Django | 5.0 |
| API | Django REST Framework | 3.14 |
| Base de datos | PostgreSQL | 16 |
| Frontend | React | 18 |
| Build | Vite | 5 |
| Estilos | Tailwind CSS | 3.4 |
| Contenedores | Docker | - |

## Producción

Para desplegar en producción:

1. **Configurar variables de entorno** con valores seguros
2. **Habilitar HTTPS** (usar Nginx o proxy reverso)
3. **Configurar SMTP** para emails (opcional)
4. **Cambiar credenciales** por defecto
5. **Configurar backups** de la base de datos

---

Para soporte o consultas, revisar la documentación del proyecto o contactar al equipo de desarrollo.