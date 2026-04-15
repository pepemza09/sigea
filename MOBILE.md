# SIGeA Mobile App - Guía de Instalación

## Requisitos Previos

1. **Node.js 18+** - [Descargar](https://nodejs.org/)
2. **Java Development Kit (JDK) 17+** - [Descargar](https://adoptium.net/)
3. **Android Studio** (para emulador) - [Descargar](https://developer.android.com/studio)

## Paso 1: Instalar dependencias

```bash
cd mobile
npm install
```

## Paso 2: Obtener tu IP de WSL

En tu terminal WSL:
```bash
hostname -I | awk '{print $1}'
```

Ejemplo: `172.18.32.128`

## Paso 3: Configurar la URL de la API

Edita `mobile/src/services/api.ts` y cambia la IP:
```typescript
const BASE_URL = 'http://TU_IP_DE_WSL:80/api';
```

## Paso 4: Configurar ADB para conectar emulador a WSL

**En Windows (PowerShell como Administrador):**
```powershell
# Conectar emulador al hostname de WSL
adb kill-server
adb -H TU_IP_DE_WSL:5555 start-server
```

O más fácil, usa la IP de Windows en lugar de WSL.

**En WSL - Permitir conexiones:**
```bash
sudo ufw allow from 192.168.1.0/24
sudo ufw allow 5555/tcp
```

## Paso 5: Iniciar Expo

```bash
cd mobile
npx expo start
```

Presiona:
- **a** - para abrir en Android (si el emulador está corriendo)
- **w** - para abrir en navegador web
- **i** - para URL de instalación manual

## Solución de Problemas

### El emulador no conecta al backend

1. **Verifica el firewall de Windows:**
   ```powershell
   # En Windows como Administrador
   netsh advfirewall firewall add rule name="WSL" dir=in action=allow enable=yes interface=any
   ```

2. **Usa la IP de Windows:**
   En Windows CMD: `ipconfig`
   Busca "IPv4 Address" del adapter "Ethernet" o "vEthernet (WSL)"
   
3. **Configura docker-compose para exponer puertos:**
   El backend ya está expuesto en puerto 80 del host.

### Error ERR_CONNECTION_REFUSED

El backend no está corriendo o el firewall lo bloquea.

**Verificar que el backend responde:**
En Windows navegador: `http://localhost/api/`

### Configurar variables de entorno

Crea un archivo `.env`:
```bash
EXPO_PUBLIC_API_URL=http://192.168.x.x:80/api
```

## Estructura de la App

```
mobile/
├── App.tsx              # Main app con navegación
├── src/
│   └── services/
│       └── api.ts       # API client
└── package.json
```

## Funcionalidades

- Login con usuario/contraseña
- Dashboard con tabs:
  - Carreras
  - Planes de Estudio
  - Materias
  - Áreas
- Ver detalles de cada entidad
- Indicador de estado (vigente/no vigente)