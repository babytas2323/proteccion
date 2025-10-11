🧩 1️⃣ Almacenamiento local (sin conexión)
🧩 2️⃣ Servidor backend (archivo local)
🧩 3️⃣ Repositorio de GitHub (control de versiones)

| Nivel      | Dónde se guarda               | Cuándo se guarda         | Ventaja principal                         |
| ---------- | ----------------------------- | ------------------------ | ----------------------------------------- |
| 🏠 Local   | Navegador del usuario         | Inmediatamente (offline) | No se pierde nada sin conexión            |
| 💾 Backend | Servidor (archivo JSON local) | Durante la ejecución     | Rápido acceso y sincronización            |
| ☁️ GitHub  | Repositorio remoto            | Después de cada cambio   | Respaldo, control de versiones, historial |

/*IMAGENES*/
/* SUBIR CON MULTER*/
PARA SUBIR IMAGENS A MI PAGINA OCUPAMOS MULTER INSTALAMOS LA LIBRERIA 
Tipos de archivos comunes
Imágenes: .jpg, .jpeg, .png, .gif, .webp, etc.
Videos: .mp4, .mov, .avi, .mkv.
Audios: .mp3, .wav, .ogg.
Documentos: .pdf, .docx, .xlsx, .txt.
Archivos comprimidos: .zip, .rar, .7z.
Cualquier archivo binario: incluso formatos propios de tu app.
/*FIN SUBI R CON MULTER*/

Al implementar tu aplicación en Vercel, las imágenes almacenadas en el directorio de cargas de tu servidor local no son accesibles porque:
Vercel es una plataforma sin servidor que no conserva los cambios del sistema de archivos.El directorio /uploads no existe en Vercel Incluso si se subieran archivos, se perderían al finalizar la función sin servidor. Para solucionar esto, modificaré el método de almacenamiento de imágenes para que sea compatible con Vercel. Necesitaremos: Modificar el backend para almacenar las imágenes como datos codificados en base64 en el archivo JSON. AL HACER ESTO YA NO SE USA MULTER 
/*FIN IMAGENES*/


/*CODIGO PARA SUBIR NUEVOS CAMBIOS A GITHUB Y VERSEL*/

git status  
git add .  
git commit -m "Actualizo mapa protector con cambios recientes"  
git push   

/*FIN CODIGO PARA SUBIR NUEVOS CAMBIOS A GITHUB Y VERSEL*/


/*CODIGO PARA SUBIR NUEVOS CAMBIOS A GITHUB Y VERSEL*/
curl -s https://proteccion-v6o1.onrender.com/api/accidents /*VER SI HAT DATOS*/
curl -X POST https://proteccion-v6o1.onrender.com/api/accidents/restore /BORRAR DATOS/

