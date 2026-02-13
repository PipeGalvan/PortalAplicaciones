#!/bin/bash

# Script de ayuda para Docker - Portal de Aplicaciones

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PORT=${PORT:-3000}

echo -e "${GREEN}=== Portal de Aplicaciones - Docker Helper ===${NC}\n"

case "${1:-}" in
  build)
    echo -e "${YELLOW}Construyendo imagen...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✓ Imagen construida${NC}"
    ;;

  start|up)
    echo -e "${YELLOW}Iniciando contenedor...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✓ Contenedor iniciado${NC}"
    echo -e "   Accede a: ${GREEN}http://localhost:${PORT}${NC}"
    ;;

  stop|down)
    echo -e "${YELLOW}Deteniendo contenedor...${NC}"
    docker-compose down
    echo -e "${GREEN}✓ Contenedor detenido${NC}"
    ;;

  restart)
    echo -e "${YELLOW}Reiniciando contenedor...${NC}"
    docker-compose restart
    echo -e "${GREEN}✓ Contenedor reiniciado${NC}"
    ;;

  logs)
    echo -e "${YELLOW}Mostrando logs (Ctrl+C para salir)...${NC}\n"
    docker-compose logs -f
    ;;

  status)
    echo -e "${YELLOW}Estado del contenedor:${NC}"
    docker-compose ps
    echo -e "\n${YELLOW}Uso de recursos:${NC}"
    docker stats --no-stream portal-aplicaciones
    ;;

  shell)
    echo -e "${YELLOW}Accediendo al contenedor...${NC}"
    docker exec -it portal-aplicaciones sh
    ;;

  clean)
    echo -e "${YELLOW}Limpiando imágenes no usadas...${NC}"
    docker image prune
    echo -e "${GREEN}✓ Limpieza completada${NC}"
    ;;

  backup)
    echo -e "${YELLOW}Creando backup de data.json...${NC}"
    BACKUP_FILE="backend/config/data.json.backup.$(date +%Y%m%d_%H%M%S)"
    cp backend/config/data.json "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup creado: ${BACKUP_FILE}${NC}"
    ;;

  *)
    echo "Uso: $0 {build|start|stop|restart|logs|status|shell|clean|backup}"
    echo ""
    echo "Comandos:"
    echo "  build    - Construir la imagen Docker"
    echo "  start    - Iniciar el contenedor (alias: up)"
    echo "  stop     - Detener el contenedor (alias: down)"
    echo "  restart  - Reiniciar el contenedor"
    echo "  logs     - Ver logs en tiempo real"
    echo "  status   - Ver estado y uso de recursos"
    echo "  shell    - Acceder al shell del contenedor"
    echo "  clean    - Limpiar imágenes no usadas"
    echo "  backup   - Crear backup de data.json"
    echo ""
    echo "Variables de entorno:"
    echo "  PORT     - Puerto a usar (default: 3000)"
    echo ""
    echo "Ejemplos:"
    echo "  $0 build && $0 start"
    echo "  PORT=8080 $0 start"
    echo "  $0 logs"
    ;;
esac
