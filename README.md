# Tetela Radar - Sistema de Detección de Riesgos

Sistema de monitoreo y reporte de riesgos naturales para Tetela de Ocampo, Puebla.

## Descripción

Tetela Radar es una aplicación web que permite:
- Reportar incidentes relacionados con riesgos naturales (huracanes, inundaciones, etc.)
- Visualizar incidentes en un mapa interactivo
- Almacenar datos directamente en el archivo accidents.json
- Exportar e importar datos en formato JSON

## Características

### Frontend (React + Leaflet)
- Interfaz de usuario moderna y responsive
- Mapa interactivo con marcadores de incidentes
- Formulario para reportar nuevos incidentes
- Sistema de leyenda con niveles de riesgo
- Funcionalidades de exportación/importación de datos
- Geolocalización automática (opcional)

### Backend Simple (Node.js + JSON)
- Servicio backend minimalista sin base de datos
- Almacenamiento directo en el archivo `src/data/accidents.json`
- API RESTful para gestión de datos
- Fácil de ejecutar y mantener

## Alternativas de Persistencia de Datos

### 1. Servicio Backend Simple (Recomendado)
La mejor manera de guardar directamente en un archivo JSON es crear un servicio backend mínimo. Para ello, se ha creado un servicio Node.js simple.

### 2. Integración con GitHub (Nueva Opción)
Para aquellos que prefieren no ejecutar un servidor local, se ha implementado una integración con GitHub que permite almacenar los datos directamente en un repositorio de GitHub. Esta opción:
- No requiere ejecutar un servidor local
- Proporciona almacenamiento permanente en la nube
- Ofrece control de versiones de los datos
- Permite acceso colaborativo

Consulte [GITHUB_INTEGRATION.md](./GITHUB_INTEGRATION.md) para obtener más detalles sobre cómo configurar esta opción.

## Requisitos

- Node.js (versión 14 o superior)
- npm (Node Package Manager)

## Instalación

```bash
# Clonar el repositorio (si no lo has hecho ya)
git clone <repository-url>
cd tetela-radar

# Instalar dependencias
npm install
```

## Uso

### Modo con Backend (Guarda directamente en accidents.json)

1. **Iniciar el Servicio Backend** (en una terminal):
   ```bash
   npm run backend
   ```
   El servicio se ejecutará en `http://localhost:3004` por defecto.

2. **Iniciar el Servidor Frontend** (en otra terminal):
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

3. **Acceder a la Aplicación**:
   - Abrir navegador en `http://localhost:5173`
   - El frontend se conectará automáticamente al backend
   - Todos los datos se guardarán directamente en `src/data/accidents.json`

### Modo Sin Backend (Guarda en localStorage)

Si no inicias el backend, la aplicación funcionará en modo offline:
- Los datos se guardarán en el localStorage del navegador
- No se guardarán directamente en el archivo accidents.json
- Se mostrará un mensaje indicando que se necesita iniciar el backend

### Modo de Producción

```bash
# Construir la aplicación para producción
npm run build

# Servir la versión construida localmente
npm run preview
```

## Funcionalidades

### Reporte de Incidentes
- Formulario para reportar incidentes de riesgos naturales
- Validación de datos
- Geolocalización automática (opcional)
- Niveles de riesgo (bajo, medio, alto)

### Visualización en Mapa
- Mapa interactivo con marcadores de incidentes
- Colores codificados por nivel de riesgo
- Información detallada en popups

### Gestión de Datos
- Almacenamiento automático en el archivo accidents.json (con backend)
- Fallback a localStorage cuando el backend no está disponible
- Exportación de datos a archivo JSON
- Importación de datos desde archivo JSON
- Restauración de datos iniciales

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo del frontend |
| `npm run build` | Construye la aplicación para producción |
| `npm run preview` | Sirve la versión construida localmente |
| `npm run backend` | Inicia el servicio backend simple |
| `npm run lint` | Ejecuta el linter para verificar el código |

## Estructura del Proyecto

```
tetela-radar/
├── src/                    # Código fuente
│   ├── components/         # Componentes de React
│   ├── data/               # Datos (accidents.json)
│   └── App.jsx             # Componente principal
├── simple-backend.js       # Servicio backend simple
├── package.json            # Dependencias y scripts
└── README.md               # Este archivo
```

## Cómo Funciona el Guardado de Datos

### Con Backend Activo
1. Cuando agregas un incidente, los datos se envían al backend
2. El backend guarda los datos directamente en `src/data/accidents.json`
3. El frontend actualiza su vista con los nuevos datos

### Sin Backend
1. Los datos se guardan en el localStorage del navegador
2. Se muestra un mensaje indicando que se necesita el backend
3. Los datos no se guardan en el archivo accidents.json

## Verificación del Funcionamiento

### Con Backend
- Verifica que el backend esté corriendo en `http://localhost:3004`
- Revisa el archivo `src/data/accidents.json` para ver los datos guardados
- El panel de la aplicación mostrará "Con backend disponible"

### Sin Backend
- El panel de la aplicación mostrará "Sin backend (solo lectura)"
- Los datos se guardarán en localStorage
- Se mostrará un mensaje indicando cómo iniciar el backend

## Limitaciones

1. **Datos por Instancia**: Todos los usuarios que accedan a la aplicación verán los mismos datos
2. **Sin Autenticación**: No hay control de acceso de usuarios
3. **Un Solo Archivo**: Todos los datos se guardan en un solo archivo JSON

## Recomendaciones

1. **Iniciar el Backend**: Siempre inicia el backend para guardar datos permanentemente
2. **Backup Regular**: Haz copias de seguridad del archivo accidents.json
3. **Verificar Conexión**: Asegúrate de que el frontend puede conectar con el backend

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.