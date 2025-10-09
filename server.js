import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3004;

// Enable CORS
app.use(cors());

// Serve static files from the public directory
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'accident-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Middleware to parse JSON
app.use(express.json());

// Route for uploading images
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se ha seleccionado ningún archivo' 
      });
    }

    // Return success response with file information
    res.json({
      success: true,
      filename: req.file.filename,
      path: `images/${req.file.filename}`,
      message: 'Imagen guardada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route for getting accidents data
app.get('/api/accidents', (req, res) => {
  try {
    // In a real application, you would read from a database
    // For this demo, we'll just return the accidents.json file
    import('./src/data/accidents.json', { assert: { type: 'json' } }).then((data) => {
      res.json(data.default);
    }).catch((error) => {
      res.status(500).json({ 
        success: false, 
        error: 'Error al leer los datos de incidentes' 
      });
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route for adding new accidents
app.post('/api/accidents', (req, res) => {
  try {
    // In a real application, you would save to a database
    // For this demo, we'll just return success
    res.json({ 
      success: true, 
      message: 'Incidente guardado exitosamente' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`📁 Directorio de imágenes: public/images/`);
});

export default app;