# Tetela Radar - Sistema de Monitoreo de Incidentes

Sistema de monitoreo y reporte de incidentes para la comunidad de Tetela de Ocampo, Puebla. Permite reportar y visualizar incidentes como huracanes, inundaciones, derrumbes y otros eventos climáticos en un mapa interactivo.

## Características

- 🗺️ Visualización de incidentes en mapa interactivo
- 🌪️ Reporte de incidentes con información detallada
- 📸 Carga de imágenes de los incidentes
- 📱 Interfaz responsive y amigable
- 🌐 Backend API para almacenamiento de datos
- 📤 Exportación e importación de datos

## Tecnologías

### Frontend
- React 18
- Vite
- Leaflet para mapas interactivos
- FontAwesome para iconos

### Backend
- Node.js
- Express
- Multer para manejo de archivos

## Instalación Local

1. Clonar el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd tetela-radar
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor backend:
   ```bash
   npm run server
   ```

4. En otra terminal, iniciar el servidor de desarrollo frontend:
   ```bash
   npm run dev
   ```

5. Abrir la aplicación en `http://localhost:5174`

## Despliegue

Para desplegar la aplicación en producción, consulta la [guía de despliegue](DEPLOYMENT.md) que incluye instrucciones para:

- Desplegar el backend en Render o Railway
- Desplegar el frontend en Vercel o Netlify
- Configurar variables de entorno
- Solucionar problemas comunes

## Estructura del Proyecto

```
tetela-radar/
├── api/              # Endpoints de API
├── public/           # Archivos estáticos
├── src/
│   ├── components/   # Componentes de React
│   ├── config/       # Configuración
│   ├── data/         # Datos iniciales
│   ├── utils/        # Funciones utilitarias
│   ├── App.jsx       # Componente principal
│   └── main.jsx      # Punto de entrada
├── server.js         # Servidor backend
└── DEPLOYMENT.md     # Guía de despliegue
```

## Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

## Contacto

Proyecto creado para la comunidad de Tetela de Ocampo, Puebla.
