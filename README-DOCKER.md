# Docker - Portal de Aplicaciones

Guía completa para contenedorizar el Portal de Aplicaciones usando un solo contenedor.

## ¿Por qué un solo contenedor?

Esta aplicación es pequeña y controlada, por lo que un solo contenedor es más simple y eficiente que usar múltiples contenedores con Docker Compose.

### Ventajas
- ✅ Configuración simple (un solo Dockerfile)
- ✅ Comandos fáciles (docker build, docker run)
- ✅ Menor complejidad para mantenimiento
- ✅ Ideal para aplicaciones pequeñas y bien controladas

## Arquitectura del Contenedor

### Multi-stage build
```
Stage 1: Frontend (Build)         Stage 2: Backend + Estáticos
├── Node.js 18 alpine              ├── Node.js 18 alpine
├── npm ci                         ├── npm ci --production
├── npm run build                 ├── Copy código backend
└── Genera: dist/                  ├── Copy dist/ → public/
                                    └── Expone puerto 3000
```

### Flujo de la aplicación
```
Usuario → Docker (Puerto 3000) → Express
                                   ├─ /api/* → API handlers
                                   └─ /*      → Archivos estáticos (index.html)
```

## Requisitos Previos

### Para ejecutar el contenedor
- Docker instalado en el servidor (Linux/Windows/Mac)
- Acceso a la red interna
- Puerto disponible (por defecto 3000, configurable)

### Para instalar Docker en Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Verificar instalación
docker --version
docker-compose --version
```

## Archivos Necesarios

### Estructura de archivos
```
portal-aplicaciones/
├── Dockerfile              ← Configuración del contenedor
├── docker-compose.yml       ← Ejecución simplificada (opcional)
├── .dockerignore           ← Archivos a ignorar en build
├── backend/
│   ├── config/data.json    ← Persistente (volumen)
│   └── src/app.js          ← Modificado para servir estáticos
├── frontend/
│   └── (código React)
└── README-DOCKER.md        ← Este documento
```

## Paso 1: Crear Dockerfile

El Dockerfile define cómo construir el contenedor con multi-stage build.

```dockerfile
# Stage 1: Build del frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend + archivos estáticos
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist ./public
EXPOSE 3000
CMD ["node", "src/app.js"]
```

**Explicación:**
1. **Stage 1**: Compila React/Vite → genera archivos estáticos en `dist/`
2. **Stage 2**: Crea imagen de producción
   - Instala solo dependencias de producción del backend
   - Copia código del backend
   - Copia archivos estáticos del stage 1 a `public/`
   - Expone puerto 3000
   - Inicia servidor Express

## Paso 2: Crear .dockerignore

Archivos a ignorar durante el build (reduce tamaño y tiempo).

```
node_modules
npm-debug.log
.git
.gitignore
README.md
README-DOCKER.md
.env
.env.local
.env.*.local
frontend/node_modules
backend/node_modules
```

## Paso 3: Modificar backend para servir estáticos

El backend debe servir los archivos estáticos del frontend.

**Modificar `backend/src/app.js`:**

```javascript
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del build del frontend
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', apiRoutes);

// SPA routing - redirigir todas las rutas a index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
```

**Cambios importantes:**
1. Agregar `express.static` para servir archivos estáticos
2. Agregar wildcard route `*` para SPA routing
3. Cambiar `localhost` por `0.0.0.0` para aceptar conexiones externas

## Paso 4: Crear docker-compose.yml

Opcional pero recomendado para facilitar la ejecución.

```yaml
version: '3.8'

services:
  app:
    image: portal-aplicaciones:latest
    build: .
    container_name: portal-aplicaciones
    ports:
      - "${PORT:-3000}:3000"
    volumes:
      - ./backend/config:/app/config
    restart: unless-stopped
    environment:
      - PORT=${PORT:-3000}
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Variables de entorno (crear archivo `.env`):**
```
PORT=3000
```

## Construcción y Ejecución

### Opción A: Usando Docker Compose (Recomendado)

**1. Construir la imagen:**
```bash
docker-compose build
```

**2. Iniciar el contenedor:**
```bash
docker-compose up -d
```

**3. Verificar estado:**
```bash
docker-compose ps
```

**4. Ver logs:**
```bash
docker-compose logs -f app
```

**5. Detener contenedor:**
```bash
docker-compose down
```

### Opción B: Usando comandos Docker directamente

**1. Construir la imagen:**
```bash
docker build -t portal-aplicaciones .
```

**2. Ejecutar contenedor:**
```bash
docker run -d \
  --name portal-aplicaciones \
  -p 3000:3000 \
  -v $(pwd)/backend/config:/app/config \
  --restart unless-stopped \
  portal-aplicaciones
```

**O con puerto diferente:**
```bash
docker run -d \
  --name portal-aplicaciones \
  -p 8080:3000 \
  -v $(pwd)/backend/config:/app/config \
  --restart unless-stopped \
  portal-aplicaciones
```

**3. Ver logs:**
```bash
docker logs -f portal-aplicaciones
```

**4. Detener contenedor:**
```bash
docker stop portal-aplicaciones
docker rm portal-aplicaciones
```

## Configuración del Puerto

El puerto se puede modificar según las necesidades del servidor.

### Usando docker-compose
**1. Crear archivo `.env`:**
```
PORT=8080
```

**2. O especificarlo en el comando:**
```bash
PORT=8080 docker-compose up -d
```

### Usando Docker directamente
**1. Modificar el mapeo de puertos:**
```bash
docker run -d -p 8080:3000 portal-aplicaciones
```

**2. O usar variable de entorno:**
```bash
docker run -d -p 8080:8080 -e PORT=8080 portal-aplicaciones
```

### Verificar puertos disponibles
```bash
# Linux
netstat -tuln | grep LISTEN
# o
ss -tuln | grep LISTEN

# Ver puerto específico
netstat -tuln | grep 3000
```

## Persistencia de Datos

### data.json

El archivo `data.json` se encuentra en `backend/config/data.json` y debe persistir entre reinicios del contenedor.

**Solución: Volume Docker**

```bash
docker run -d \
  -v $(pwd)/backend/config:/app/config \
  portal-aplicaciones
```

Esto mapea la carpeta local `./backend/config` a `/app/config` dentro del contenedor.

### Verificar persistencia

```bash
# Crear entorno desde la aplicación
# Detener contenedor
docker stop portal-aplicaciones

# Verificar archivo en host
cat backend/config/data.json

# Reiniciar contenedor
docker start portal-aplicaciones

# Verificar que los datos persisten
```

### Backup de datos

```bash
# Backup manual
cp backend/config/data.json backend/config/data.json.backup.$(date +%Y%m%d)

# Automatizado con cron
0 2 * * * cp /path/to/backend/config/data.json /path/to/backup/data.json.$(date +\%Y\%m\%d)
```

## Comandos Útiles

### Ver estado del contenedor
```bash
docker ps -a
```

### Ver logs en tiempo real
```bash
docker logs -f portal-aplicaciones
```

### Ver logs específicos
```bash
# Últimas 100 líneas
docker logs --tail 100 portal-aplicaciones

# Desde hace 1 hora
docker logs --since 1h portal-aplicaciones

# Con timestamps
docker logs -t portal-aplicaciones
```

### Acceder al contenedor (debugging)
```bash
docker exec -it portal-aplicaciones sh
```

### Ver recursos usados
```bash
docker stats portal-aplicaciones
```

### Reconstruir imagen
```bash
# Sin caché
docker build --no-cache -t portal-aplicaciones .

# Forzar rebuild
docker-compose build --no-cache
```

### Limpiar recursos no usados
```bash
# Imágenes no usadas
docker image prune

# Todo no usado (imágenes, contenedores, volúmenes)
docker system prune -a --volumes
```

## Actualización de la Aplicación

### Cuando hay cambios en el código

**1. Reconstruir imagen:**
```bash
docker-compose build --no-cache
# o
docker build -t portal-aplicaciones .
```

**2. Recrear contenedor:**
```bash
docker-compose up -d --force-recreate
# o
docker stop portal-aplicaciones
docker rm portal-aplicaciones
docker run -d ... (comandos anteriores)
```

### Actualizar dependencias

```bash
# Actualizar en host
cd backend && npm install
cd ../frontend && npm install

# Reconstruir imagen
docker-compose build
docker-compose up -d
```

## Troubleshooting

### El contenedor no inicia

```bash
# Ver logs de error
docker logs portal-aplicaciones

# Verificar si puerto está en uso
netstat -tuln | grep 3000

# Verificar volumen
docker inspect portal-aplicaciones | grep -A 10 Mounts
```

### No puedo acceder a la aplicación

```bash
# Verificar que el contenedor está corriendo
docker ps

# Verificar que el puerto está mapeado correctamente
docker port portal-aplicaciones

# Verificar que el firewall no está bloqueando
# Linux (ufw)
sudo ufw status
sudo ufw allow 3000
```

### data.json se pierde al reiniciar

```bash
# Verificar que el volumen está mapeado
docker inspect portal-aplicaciones | grep Mounts

# Debe mostrar:
# "Source": "/ruta/local/backend/config"
# "Destination": "/app/config"
```

### Error de permisos en volumen

```bash
# Verificar permisos en host
ls -la backend/config/

# Corregir permisos
sudo chown -R $USER:$USER backend/config/
chmod 644 backend/config/data.json
```

### El frontend no se muestra correctamente

```bash
# Verificar que los archivos estáticos existen
docker exec portal-aplicaciones ls -la /app/public/

# Verificar que Express los está sirviendo
docker exec portal-aplicaciones curl http://localhost:3000/
```

## Configuración de Producción

### Variables de entorno

Crear archivo `.env` en la raíz:

```env
PORT=3000
NODE_ENV=production
```

### Seguridad

**1. No ejecutar como root (opcional):**
```dockerfile
# Agregar al final del Dockerfile
USER node
```

**2. Usar versión específica de Node:**
```dockerfile
FROM node:18.19.0-alpine
```

**3. Limpiar caché de npm:**
```dockerfile
RUN npm cache clean --force
```

### Logs y Monitoreo

**Ver logs:**
```bash
docker logs -f portal-aplicaciones

# Guardar logs en archivo
docker logs portal-aplicaciones > portal.log 2>&1
```

**Rotación de logs (con logrotate):**
```
# Crear /etc/logrotate.d/docker-container
/path/to/portal.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    copytruncate
}
```

## Consideraciones para el Servidor de Producción

### Instalación de Docker en Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose

# CentOS/RHEL
sudo yum install -y docker docker-compose

# Iniciar y habilitar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Recargar sesión
newgrp docker

# Verificar
docker --version
docker-compose --version
```

### Firewall

```bash
# Permitir puerto (ej: 3000)
sudo ufw allow 3000/tcp

# Verificar
sudo ufw status
```

### Recursos del servidor

**Mínimos recomendados:**
- CPU: 1 core
- RAM: 512 MB
- Disco: 1 GB

**Moderados:**
- CPU: 2 cores
- RAM: 1 GB
- Disco: 2 GB

### Inicio automático

**Con docker-compose:**
```yaml
restart: unless-stopped
```

**Con systemd (opcional):**
```bash
# Crear servicio systemd
sudo nano /etc/systemd/system/portal-app.service
```

```ini
[Unit]
Description=Portal de Aplicaciones
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/portal-aplicaciones
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar servicio
sudo systemctl enable portal-app.service
sudo systemctl start portal-app.service
```

## Checklist de Implementación

- [ ] Instalar Docker en el servidor
- [ ] Crear Dockerfile
- [ ] Crear .dockerignore
- [ ] Crear docker-compose.yml
- [ ] Modificar backend/src/app.js para servir estáticos
- [ ] Verificar que el puerto deseado está disponible
- [ ] Crear archivo .env con el puerto
- [ ] Construir imagen: `docker-compose build`
- [ ] Ejecutar contenedor: `docker-compose up -d`
- [ ] Verificar logs: `docker-compose logs -f`
- [ ] Probar acceso desde navegador: `http://ip-servidor:3000`
- [ ] Verificar persistencia de data.json
- [ ] Configurar inicio automático (opcional)
- [ ] Documentar IP y puerto para el equipo

## Resumen Rápido

```bash
# 1. Instalar Docker
sudo apt install -y docker.io docker-compose

# 2. Clonar/descargar proyecto
cd portal-aplicaciones

# 3. Configurar puerto (opcional)
echo "PORT=3000" > .env

# 4. Construir y ejecutar
docker-compose up -d

# 5. Verificar
docker-compose logs -f

# 6. Acceder
# http://ip-del-servidor:3000
```

## Soporte y Contacto

Para problemas o dudas:
1. Verificar logs: `docker logs portal-aplicaciones`
2. Verificar estado: `docker ps -a`
3. Revisar esta documentación
4. Contactar al equipo de desarrollo

## Referencias

- [Documentación oficial de Docker](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Express.js serving static files](https://expressjs.com/en/starter/static-files.html)
