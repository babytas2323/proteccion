# Tetela Radar - Sistema de Detección de Riesgos

Sistema de monitoreo y reporte de riesgos naturales para Tetela de Ocampo, Puebla.

## Tecnologías Utilizadas

### Frontend
- **React** - Biblioteca de JavaScript para construir interfaces de usuario. En este proyecto, React se utiliza para crear todos los componentes de la interfaz, gestionar el estado de la aplicación y permitir la interacción con el usuario.

- **React DOM** - Punto de entrada del DOM específico para React. Se encarga de renderizar los componentes de React en el navegador web y manejar las actualizaciones del DOM cuando cambia el estado.

- **Vite** - Herramienta de compilación que proporciona un entorno de desarrollo más rápido. Vite mejora la experiencia de desarrollo con un servidor de desarrollo rápido y reconstrucciones instantáneas gracias a su enfoque de módulos ES.

- **Leaflet** - Biblioteca de mapas interactivos de código abierto. Leaflet permite mostrar el mapa donde se visualizan los incidentes reportados y proporciona funcionalidades de interacción con el mapa como zoom y pan.

- **React Leaflet** - Componentes de React para Leaflet. Facilita la integración de Leaflet en una aplicación React, permitiendo crear componentes reutilizables para marcadores, polígonos y otras capas del mapa.

- **Font Awesome** - Conjunto de iconos vectoriales. Se utiliza para mostrar iconos visuales en la interfaz de usuario, como los botones flotantes y símbolos en los marcadores del mapa.

- **Turf.js** - Biblioteca de análisis espacial avanzado. Turf.js ayuda a realizar cálculos geoespaciales como distancias entre puntos, buffers y otras operaciones con datos geográficos.

### Backend
- **Node.js** - Entorno de ejecución de JavaScript. Permite ejecutar código JavaScript en el servidor, facilitando la creación del backend API para manejar los reportes de incidentes.

- **Express** - Framework web para Node.js. Express proporciona una estructura para definir rutas, middleware y manejadores de solicitudes HTTP en el backend del sistema.

- **Cors** - Middleware para habilitar CORS en Express. Permite que el frontend (que corre en un puerto diferente) pueda comunicarse con el backend, evitando restricciones de seguridad del navegador.

- **Multer** - Middleware para manejar multipart/form-data. Es fundamental para procesar las imágenes adjuntas en los reportes de incidentes, permitiendo su carga al servidor.

- **Dotenv** - Módulo que carga variables de entorno desde un archivo .env. Se utiliza para almacenar de forma segura credenciales y configuraciones sensibles como claves de API.

### Base de Datos y Almacenamiento
- **Firebase** - Plataforma de desarrollo de aplicaciones web y móvil de Google. Firebase Firestore se utiliza como base de datos principal para almacenar los datos estructurados de los incidentes con sincronización en tiempo real.

- **Cloudinary** - Servicio de gestión de medios en la nube. Cloudinary almacena las imágenes de los incidentes, optimizándolas automáticamente y entregándolas a través de una CDN para mejor rendimiento.

- **Node Fetch** - Cliente HTTP para Node.js. Permite que el backend realice solicitudes HTTP a servicios externos como la API de Cloudinary para cargar imágenes.

- **Fetch Blob** - Implementación de Blob para fetch. Facilita el manejo de datos binarios (imágenes) en las solicitudes HTTP desde el backend hacia servicios como Cloudinary.

- **Formdata Node** - Implementación de FormData para Node.js. Permite construir objetos FormData que se requieren para enviar imágenes al API de Cloudinary.

### Utilidades y Herramientas
- **XLSX** - Biblioteca para leer y escribir archivos Excel. Se utiliza para exportar los datos de incidentes a formato Excel, facilitando la generación de informes fuera de la aplicación.

- **ESLint** - Herramienta de análisis de código estático. ESLint ayuda a mantener la calidad del código identificando errores, problemas de estilo y posibles bugs antes de ejecutar la aplicación.

- **React Router DOM** - Enrutador para aplicaciones React. Gestiona la navegación entre diferentes vistas de la aplicación, como la vista principal y la vista especializada para protección civil.

## Actualización Importante

Este proyecto ha sido actualizado para utilizar Firebase como base de datos principal y Cloudinary para el almacenamiento de imágenes, mejorando significativamente la escalabilidad y el rendimiento de la aplicación.

## Descripción

Tetela Radar es una aplicación web que permite:
- Reportar incidentes relacionados con riesgos naturales (huracanes, inundaciones, etc.)
- Visualizar incidentes en un mapa interactivo
- Almacenar datos en Firebase Firestore
- Almacenar imágenes en Cloudinary
- Exportar e importar datos en formato JSON

## Características

### Frontend (React + Leaflet)
- Interfaz de usuario moderna y responsive
- Mapa interactivo con marcadores de incidentes
- Formulario para reportar nuevos incidentes
- Sistema de leyenda con niveles de riesgo
- Funcionalidades de exportación/importación de datos
- Geolocalización automática (opcional)
- Visualización de imágenes almacenadas en Cloudinary

### Backend Simple (Node.js)
- Servicio backend minimalista
- Integración con Cloudinary para almacenamiento de imágenes
- API RESTful para gestión de datos
- Fácil de ejecutar y mantener

### Base de Datos (Firebase Firestore)
- Almacenamiento de datos estructurados en la nube
- Acceso en tiempo real a los datos
- Escalabilidad automática

### Almacenamiento de Imágenes (Cloudinary)
- Almacenamiento eficiente de imágenes
- Optimización automática de imágenes
- Entrega de contenido por CDN

## Requisitos

- Node.js (versión 14 o superior)
- npm (Node Package Manager)
- Cuenta de Firebase
- Cuenta de Cloudinary

## Instalación

```
# Clonar el repositorio (si no lo has hecho ya)
git clone <repository-url>
cd tetela-radar

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear un archivo .env con las credenciales de Cloudinary:
# CLOUDINARY_CLOUD_NAME=tu_cloud_name
# CLOUDINARY_API_KEY=tu_api_key
# CLOUDINARY_API_SECRET=tu_api_secret
# VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
# VITE_CLOUDINARY_API_KEY=tu_api_key
# VITE_CLOUDINARY_API_SECRET=tu_api_secret
```

## Uso

### Modo con Backend (Integración Firebase + Cloudinary)

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
   - Los datos se guardarán en Firebase Firestore
   - Las imágenes se cargarán a Cloudinary

### Modo Sin Backend (Guarda en localStorage)

Si no inicias el backend, la aplicación funcionará en modo offline:
- Los datos se guardarán en el localStorage del navegador
- Las imágenes no se cargarán (se mostrará un mensaje indicando que se necesita el backend)
- Se mostrará un mensaje indicando que se necesita iniciar el backend

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo del frontend |
| `npm run build` | Construye la aplicación para producción |
| `npm run preview` | Sirve la versión construida localmente |
| `npm run backend` | Inicia el servicio backend simple |
| `npm run lint` | Ejecuta el linter para verificar el código |
| `firebase deploy` | Despliega las reglas de Firestore (requiere Firebase CLI) |

## Estructura del Proyecto

```
tetela-radar/
├── src/                    # Código fuente
│   ├── components/         # Componentes de React
│   ├── config/             # Configuración (Cloudinary)
│   ├── data/               # Datos (accidents.json - fallback)
│   ├── firebase.js         # Configuración de Firebase
│   └── App.jsx             # Componente principal
├── simple-backend.js       # Servicio backend simple
├── firestore.rules         # Reglas de seguridad de Firestore
├── .env                    # Variables de entorno
├── package.json            # Dependencias y scripts
└── README.md               # Este archivo
```

## Cómo Funciona el Guardado de Datos

### Con Backend Activo
1. Cuando agregas un incidente con imagen:
   - La imagen se envía al backend
   - El backend la carga a Cloudinary
   - El backend devuelve la URL de la imagen
   - El frontend guarda los datos del incidente en Firebase, incluyendo la URL de la imagen
2. Cuando agregas un incidente sin imagen:
   - Los datos se guardan directamente en Firebase
3. El frontend actualiza su vista con los nuevos datos desde Firebase

### Sin Backend
1. Los datos se guardan en el localStorage del navegador
2. Las imágenes no se pueden cargar sin el backend
3. Se muestra un mensaje indicando que se necesita el backend

## Verificación del Funcionamiento

### Con Backend
- Verifica que el backend esté corriendo en `http://localhost:3004`
- Verifica que los datos se muestren en la aplicación desde Firebase
- Verifica que las imágenes se muestren correctamente (se cargan desde Cloudinary)
- El panel de la aplicación mostrará "Con backend disponible"

### Sin Backend
- El panel de la aplicación mostrará "Sin backend (solo lectura)"
- Los datos se guardarán en localStorage
- Las imágenes no se cargarán
- Se mostrará un mensaje indicando cómo iniciar el backend

## Limitaciones

1. **Datos por Instancia**: Todos los usuarios que accedan a la aplicación verán los mismos datos
2. **Sin Autenticación**: No hay control de acceso de usuarios
3. **Dependencia de Servicios Externos**: Requiere conexión a Firebase y Cloudinary

## Configuración de Firebase

1. Crear una cuenta en [Firebase Console](https://console.firebase.google.com/)
2. Crear un nuevo proyecto o usar uno existente
3. Obtener las credenciales del proyecto:
   - Ir a "Configuración del proyecto" > "Cuentas de servicio" > "Claves de SDK"
   - Copiar los valores de configuración
4. Configurar las reglas de Firestore en `firestore.rules`
5. Desplegar las reglas con `firebase deploy --only firestore:rules`

## Configuración de Cloudinary

1. Crear una cuenta en [Cloudinary](https://cloudinary.com/)
2. Obtener las credenciales de la cuenta:
   - Cloud Name
   - API Key
   - API Secret
3. Configurar las variables de entorno en el archivo `.env`

## Recomendaciones

1. **Iniciar el Backend**: Para guardar datos permanentemente, inicia el backend
2. **Configurar Credenciales**: Asegúrate de configurar correctamente las credenciales de Firebase y Cloudinary
3. **Verificar Conexión**: Asegúrate de que el frontend puede conectar con Firebase y Cloudinary
4. **Monitorear Uso**: Revisa el uso de Cloudinary para evitar exceder los límites del plan gratuito

## Arquitectura del Sistema

### Flujo de Datos
1. **Frontend (React)**: Interfaz de usuario que se comunica con Firebase y el backend
2. **Firebase Firestore**: Almacena los datos estructurados de los incidentes
3. **Backend (Node.js)**: Servicio intermedio que maneja la carga de imágenes a Cloudinary
4. **Cloudinary**: Almacena las imágenes y proporciona URLs para su visualización

### Ventajas de la Nueva Arquitectura
- **Escalabilidad**: Firebase maneja automáticamente la escalabilidad de la base de datos
- **Eficiencia**: Las imágenes no se almacenan como base64 en la base de datos
- **Rendimiento**: Cloudinary optimiza y entrega imágenes a través de CDN
- **Persistencia**: Los datos se mantienen incluso si se reinicia el servidor

## Solución de Problemas

### Problemas Comunes

**1. Las imágenes no se muestran en la vista de protección civil**
   - Verifica que las imágenes se estén cargando correctamente a Cloudinary
   - Revisa la consola del navegador para errores de red
   - Asegúrate de que la URL de la imagen es accesible

**2. Error de permisos en Firebase**
   - Verifica que las reglas de Firestore estén correctamente configuradas
   - Ejecuta `firebase deploy --only firestore:rules` para actualizar las reglas

**3. Error al cargar imágenes a Cloudinary**
   - Verifica que las credenciales de Cloudinary estén correctamente configuradas
   - Revisa que el archivo `.env` contenga las variables correctas

**4. Los datos no se guardan en Firebase**
   - Verifica la conexión a Internet
   - Revisa la consola del navegador para errores de Firebase
   - Asegúrate de que las credenciales de Firebase estén correctamente configuradas

## Pruebas de Integración

El proyecto incluye varios scripts de prueba para verificar la integración completa:

- `test-firebase-connection.js`: Verifica la conexión con Firebase
- `test-cloudinary-node.js`: Verifica la carga de imágenes a Cloudinary
- `test-complete-integration.js`: Verifica la integración completa entre Firebase y Cloudinary

Para ejecutar las pruebas:
```
node test-firebase-connection.js
node test-cloudinary-node.js
node test-complete-integration.js
```

## Ejemplo de Uso

### Funcionalidad de Geolocalización

El sistema incluye una función de geolocalización que permite al usuario identificar su posición actual en el mapa:

1. Al hacer clic en el botón de geolocalización (📍) en la interfaz
2. El sistema solicitará permiso para acceder a la ubicación del dispositivo
3. Si se concede el permiso, el mapa se centrará en la ubicación actual del usuario
4. Se mostrará un marcador especial indicando la posición del usuario
5. Esta característica es útil para reportar incidentes desde la ubicación actual

Esta característica utiliza la API de Geolocation del navegador y requiere permisos del usuario para funcionar.

### Descripción de Botones y Funcionalidades

#### Botones Flotantes en la Vista Principal

1. **Botón de Agregar Incidente (➕)**
   - Abre el formulario para reportar un nuevo incidente
   - Permite ingresar todos los detalles del incidente incluyendo:
     - Nombre del incidente
     - Municipio (predeterminado a Tetela de Ocampo)
     - Fecha y hora del incidente
     - Tipo de incidente (desde huracanes hasta derrumbes)
     - Coordenadas geográficas (con opción de geolocalización automática)
     - Descripción detallada
     - Número de personas afectadas
     - Número de teléfono de contacto
     - Localidad afectada
     - Nivel de riesgo (bajo, medio, alto)
     - Imagen del incidente (opcional)

2. **Botón de Geolocalización (📍)**
   - Solicita permiso para acceder a la ubicación actual del dispositivo
   - Centra el mapa en la posición del usuario
   - Muestra un marcador especial en la ubicación del usuario

3. **Botón del Clima (🌤️)**
   - Muestra un widget con información meteorológica en tiempo real
   - Incluye mapas de viento, precipitaciones, temperatura y otros datos
   - Se puede cerrar haciendo clic en la "X" del widget

4. **Botón de Protección Civil (🛡️)**
   - Navega a la vista especial para personal de protección civil
   - Solo visible en la vista de protección civil

#### Panel de Leyenda (ℹ️)

Al hacer clic en el botón de información (ℹ️) en la vista de protección civil, se abre un panel con:

1. **Estadísticas de Incidentes**
   - Conteo de incidentes por nivel de riesgo (bajo, medio, alto)
   - Clasificación de incidentes por tipo
   - Número total de incidentes reportados

2. **Botones de Gestión de Datos**
   - **Exportar Datos (JSON)**: Descarga todos los incidentes en formato JSON
   - **Exportar a Excel**: Descarga todos los incidentes en formato Excel
   - **Importar Datos**: Carga incidentes desde un archivo JSON
   - **Restaurar Datos Iniciales**: Elimina todos los incidentes y restaura los datos predeterminados

#### Formulario de Reporte de Incidentes

El formulario completo incluye los siguientes campos:

1. **Nombre del Incidente**: Campo de texto para describir el incidente
2. **Municipio**: Campo de texto (predeterminado a Tetela de Ocampo)
3. **Fecha**: Selector de fecha
4. **Hora**: Selector de hora
5. **Tipo de Incidente**: Menú desplegable con opciones como:
   - Caída de árbol
   - Inundación
   - Derrumbe
   - Viento fuerte
   - Y muchos más
6. **Geolocalización Automática**: Checkbox para usar la ubicación actual
7. **Coordenadas**: Campos para latitud y longitud (se desactivan si se usa geolocalización)
8. **Descripción**: Área de texto para detalles del incidente
9. **Personas Afectadas**: Campo numérico
10. **Número de Teléfono**: Campo de teléfono (requiere 10 dígitos)
11. **Localidad**: Campo de texto para la localidad afectada
12. **Imagen del Incidente**: Selector de archivos para subir una imagen
13. **Nivel de Riesgo**: Menú desplegable (bajo, medio, alto)

#### Botones de Acción en el Formulario

1. **Botón "Reportar"**: Envía el formulario y guarda el incidente en Firebase
2. **Botón "Cancelar"**: Cierra el formulario sin guardar

### Leyendas de Protección y Uso de Datos Personales

#### Política de Protección de Datos

El sistema Tetela Radar maneja información sensible relacionada con incidentes de emergencia y datos personales de los reporteros. Para garantizar la privacidad y protección de estos datos, se han implementado las siguientes medidas:

1. **Recopilación de Datos**
   - Los datos personales recopilados incluyen:
     - Nombre del reportero (a través del nombre del incidente)
     - Número de teléfono de contacto
     - Ubicación geográfica del incidente
     - Imágenes del incidente (si se proporcionan)
   - Todos los datos se almacenan de forma segura en Firebase Firestore

2. **Uso de Datos**
   - Los datos se utilizan exclusivamente para:
     - Monitoreo y reporte de riesgos naturales
     - Coordinación de esfuerzos de protección civil
     - Análisis estadístico de incidentes
     - Mejora del sistema de detección de riesgos

3. **Protección de Datos**
   - Todos los datos se transmiten mediante conexiones seguras (HTTPS)
   - El acceso a los datos está restringido a personal autorizado de protección civil
   - Las imágenes se almacenan de forma segura en Cloudinary con acceso restringido

4. **Datos de Geolocalización**
   - La geolocalización se utiliza únicamente para:
     - Identificar la ubicación exacta de los incidentes reportados
     - Facilitar la respuesta de los equipos de emergencia
     - Proporcionar contexto geográfico para el análisis de riesgos
   - Los datos de ubicación se almacenan como coordenadas (latitud y longitud) junto con el incidente
   - La geolocalización solo se activa cuando el usuario lo permite explícitamente
   - Los usuarios pueden ingresar coordenadas manualmente en lugar de usar geolocalización automática
   - Las coordenadas se muestran en el mapa para visualización pública, pero sin identificar directamente a los reporteros

5. **Derechos del Usuario**
   - Los usuarios tienen derecho a:
     - Acceder a sus datos personales almacenados
     - Solicitar la corrección de datos incorrectos
     - Solicitar la eliminación de sus datos personales
     - Retirar su consentimiento para el uso de datos en cualquier momento

6. **Consentimiento**
   - Al utilizar el sistema, los usuarios consienten el tratamiento de sus datos personales
   - Para incidentes de emergencia, se considera consentimiento tácito por la naturaleza crítica de la situación
   - Los datos se manejan con la máxima confidencialidad y solo se comparten con entidades de protección civil autorizadas

7. **Medidas de Seguridad**
   - Encriptación de datos en tránsito y en reposo
   - Autenticación y autorización para acceso a los sistemas
   - Auditoría de acceso a los datos
   - Copias de seguridad regulares de la información

8. **Retención de Datos**
   - Los datos se retienen mientras sean necesarios para los fines descritos
   - Se establecerán períodos de retención específicos según la normativa aplicable
   - Los datos se eliminarán de forma segura cuando ya no sean necesarios

9. **Contacto**
   - Para ejercer sus derechos sobre protección de datos o resolver dudas, contactar al administrador del sistema

#### Consideraciones de Uso Responsable

1. **Uso Ético**
   - El sistema debe utilizarse únicamente para reportar incidentes reales
   - No se debe proporcionar información falsa o engañosa
   - Se debe respetar la privacidad de las personas afectadas en los reportes

2. **Responsabilidad del Usuario**
   - Los usuarios son responsables de la veracidad de la información proporcionada
   - Se recomienda verificar la información antes de enviarla
   - El uso indebido del sistema puede tener consecuencias legales

3. **Acceso a la Información**
   - La información general de incidentes es pública para concienciación
   - Los datos personales solo son accesibles para personal autorizado
   - Las imágenes se manejan con sensibilidad y respeto a la dignidad de las personas

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.



