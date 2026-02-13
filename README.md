# Portal de Aplicaciones

Hub de conexiones para desarrolladores y analistas. Gestiona y monitorea tus entornos de desarrollo, QA y producción desde una única interfaz.

## Características

- 📝 Gestión centralizada de entornos (web services, bases de datos, servidores)
- 🏥 Health checks HTTP y TCP en tiempo real con estados mejorados
- 🔍 Búsqueda y filtros avanzados
- ⭐ Favoritos con persistencia en localStorage
- 🌓 Modo oscuro/claro
- 📊 Vistas alternativas (grid/lista)
- 🏷️ Categorización y etiquetas
- 📋 Copiar URLs al portapapeles
- 🔗 Accesos directos a aplicaciones
- 📨 Sin autenticación - acceso libre en la red
- ⚙️ Configuración avanzada de health checks (método HTTP, endpoint personalizado)

## Tecnologías

### Backend
- Node.js (última versión estable)
- Express.js
- CORS

### Frontend
- React 18
- Vite
- TailwindCSS
- Axios
- Lucide React (iconos)
- React Context API

### Docker
- Multi-stage build para optimización de imagen
- Un solo contenedor para simplificar el despliegue

## Docker

Para desplegar en producción usando Docker, consulta la guía completa en [README-DOCKER.md](./README-DOCKER.md).

**Comandos rápidos:**
```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```
- Lucide React (iconos)
- React Context API

## Instalación

### Requisitos previos
- Node.js 18+
- npm o yarn

### Pasos de instalación

1. Clonar o descargar el proyecto

2. Instalar dependencias del backend:
```bash
cd portal-aplicaciones/backend
npm install
```

3. Instalar dependencias del frontend:
```bash
cd ../frontend
npm install
```

## Uso

### Iniciar el backend
```bash
cd backend
npm run dev
```
El backend estará disponible en `http://localhost:3000`

### Iniciar el frontend (en otra terminal)
```bash
cd frontend
npm run dev
```
El frontend estará disponible en `http://localhost:5173`

### Build para producción

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

**Backend:**
```bash
cd backend
npm start
```

## Estructura del proyecto

```
portal-aplicaciones/
├── backend/
│   ├── config/
│   │   └── data.json           # Almacenamiento de entornos
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── environments.js # CRUD de entornos
│   │   │   └── health.js       # Verificaciones
│   │   ├── routes/
│   │   │   └── api.js
│   │   ├── middlewares/
│   │   │   └── fileHandler.js  # Manejo de JSON
│   │   └── app.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EnvironmentList/
│   │   │   ├── EnvironmentCard/
│   │   │   ├── EnvironmentForm/
│   │   │   ├── HealthCheck/
│   │   │   ├── SearchBar/
│   │   │   ├── FilterPanel/
│   │   │   └── ThemeToggle/
│   │   ├── context/
│   │   │   └── FavoritesContext.js
│   │   ├── hooks/
│   │   │   ├── useLocalStorage.js
│   │   │   └── useTheme.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── cn.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## API Endpoints

### Entornos

- `GET /api/environments` - Obtener todos los entornos
- `GET /api/environments/:id` - Obtener un entorno específico
- `POST /api/environments` - Crear un nuevo entorno
- `PUT /api/environments/:id` - Actualizar un entorno
- `DELETE /api/environments/:id` - Eliminar un entorno

### Health Checks

- `POST /api/health/check` - Verificar estado de un entorno
  - Body: `{ type: 'http' | 'tcp', url: string, port?: number, httpMethod?: 'HEAD' | 'GET' | 'POST' }`
  - Estados:
    - `healthy` (verde): Servidor respondiendo correctamente (200-399, incluye redirecciones)
    - `warning` (amarillo): Servidor responde pero con errores HTTP (400-599)
    - `unhealthy` (rojo): No hay conexión al servidor
    - `timeout` (naranja): Tiempo de espera agotado

## Campos de un entorno

- `name`: Nombre del entorno (obligatorio)
- `url`: URL del servicio (obligatorio)
- `type`: Tipo de verificación (`http` o `tcp`)
- `httpMethod`: Método HTTP para health check (`HEAD`, `GET`, `POST`) - defecto: HEAD
- `port`: Puerto del servicio
- `category`: Categoría (Desarrollo, QA, Producción, Staging)
- `database`: Nombre de la base de datos
- `gxVersion`: Versión de GeneXus
- `tomcatVersion`: Versión de Tomcat
- `dbVersion`: Versión de la base de datos
- `tags`: Array de etiquetas
- `notes`: Notas adicionales

## Características adicionales

### Favoritos
Los favoritos se guardan en el localStorage del navegador, lo que permite que cada usuario tenga su propia lista de entornos favoritos.

### Modo oscuro
El tema se guarda en el localStorage y persiste entre sesiones.

### Health checks
El sistema verifica el estado de los entornos de manera inteligente:

- **HTTP**: Realiza una petición usando el método configurado (HEAD por defecto) y verifica el código de respuesta
  - `healthy`: Códigos 200-399 (servicio operativo, incluye redirecciones)
  - `warning`: Códigos 400-599 (servidor responde pero con errores, ej: 405 Method Not Allowed)
  - `unhealthy`: Error de conexión
  - `timeout`: Tiempo de espera agotado

- **TCP**: Intenta establecer una conexión TCP con el puerto especificado
  - `healthy`: Puerto abierto y accesible
  - `unhealthy`: No se pudo conectar
  - `timeout`: Tiempo de espera agotado

**Configuración:**
- **Método HTTP**: Puedes elegir entre HEAD (recomendado, más ligero), GET o POST
- **Tiempo de espera**: 5 segundos por defecto

## Contribución

Este proyecto es de uso interno. Para sugerencias o mejoras, contactar al equipo de desarrollo.

## Licencia

Propiedad del equipo de desarrollo interno.
