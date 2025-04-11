# API OSM-PostGIS

API para consultar datos de OpenStreetMap desde una base de datos PostgreSQL con extensión PostGIS.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (v14 o superior)
- [PostgreSQL](https://www.postgresql.org/) con extensión [PostGIS](https://postgis.net/)
- Base de datos con datos de OSM importados usando [osm2pgsql](https://osm2pgsql.org/)

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd osm-postgis-api
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar las variables de entorno:
   - Modificar los valores según tu configuración local

## Configuración de la Base de Datos

### Importar datos OSM con osm2pgsql

1. Descargar un archivo .osm o .pbf de OpenStreetMap
2. Crear una base de datos con extensión PostGIS:
   ```sql
   CREATE DATABASE osm;
   \c osm
   CREATE EXTENSION postgis
   CREATE EXTENSION hstore
   ```

3. Importar los datos usando osm2pgsql:
   ```cmd

   "C:\Users\famil\Downloads\osm2pgsql-latest-x64\osm2pgsql-bin\osm2pgsql.exe" -c -d osm -U postgres -W -H localhost -S "C:\Users\famil\Downloads\default.style" "C:\Users\famil\Downloads\mexico-latest.osm.pbf"

   osm2pgsql -c -d osm -U postgres -H localhost -S C:\default.style C:\bangkok.osm.pbf  
   ```

## Uso

### Iniciar el servidor

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

### Endpoints API

- `GET /api/ways/:id` - Obtiene los puntos de un way por su ID
- `POST /api/ways/points` - Obtiene los puntos enviando el ID en el cuerpo de la petición

### Ejemplos de Peticiones

#### GET Request
```cmd
curl -X GET http://localhost:3000/api/ways/123456789
```

#### POST Request
```cmd
curl -X POST http://localhost:3000/api/ways/points -H "Content-Type: application/json" -d "{\"wayId\": 123456789}"
```

### Formato de la Respuesta

```json
{
  "wayId": 123456789,
  "points": [
    [12.3456, 56.7890],
    [12.3457, 56.7891],
    [12.3460, 56.7892]
  ]
}
```

## Estructura del Proyecto

```
osm-postgis-api/
├── src/
│   ├── config/        # Configuración de la base de datos
│   ├── routes/        # Definición de rutas
│   ├── controllers/   # Controladores de rutas
│   ├── models/        # Consultas a la base de datos
│   ├── utils/         # Funciones de utilidad
│   └── app.js         # Punto de entrada de la aplicación
├── .env               # Variables de entorno
├── package.json
└── README.md
```

## Licencia

MIT