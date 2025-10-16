# Configuración de Cloudinary para la Aplicación

## Problema Identificado

La aplicación está teniendo problemas para cargar imágenes a Cloudinary debido a que requiere un "upload preset" para las cargas sin firma (unsigned uploads).

## Solución

Para que la carga de imágenes funcione correctamente, necesitas crear un upload preset en tu cuenta de Cloudinary.

## Pasos para Configurar Cloudinary

### 1. Acceder al Dashboard de Cloudinary

1. Ve a [Cloudinary Console](https://console.cloudinary.com/)
2. Inicia sesión con tus credenciales

### 2. Crear un Upload Preset

1. En el menú lateral, haz clic en "Settings" (Configuración)
2. Selecciona la pestaña "Upload" (Carga)
3. Busca la sección "Upload presets" (Presets de carga)
4. Haz clic en "Add upload preset" (Agregar preset de carga)

### 3. Configurar el Upload Preset

Configura el preset con los siguientes valores:

- **Upload preset name**: `accident_reports_preset`
- **Signing mode**: `Unsigned` (Sin firma)
- **Asset folder**: `accident_reports`

### 4. Guardar la Configuración

Haz clic en "Save" (Guardar) para crear el preset.

## Verificación

Después de crear el upload preset, la aplicación debería poder cargar imágenes correctamente.

## Solución Alternativa

Si prefieres no crear un upload preset, puedes usar la carga firmada. Sin embargo, esto requiere generar firmas criptográficas en el frontend, lo cual es más complejo y puede exponer tus credenciales.

## Soporte

Si continúas teniendo problemas, por favor verifica:

1. Que tus credenciales de Cloudinary en el archivo `.env` sean correctas
2. Que tengas una cuenta activa de Cloudinary
3. Que el upload preset se haya creado con el nombre exacto `accident_reports_preset`