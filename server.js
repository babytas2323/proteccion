import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3004;

// Enable CORS
app.use(cors());

// Serve static files from the public directory
app.use(express.static('public'));

// Middleware to parse JSON
app.use(express.json());

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

// Path to accidents data file
const accidentsFilePath = path.join(__dirname, 'src/data/accidents.json');

// Helper function to read accidents data
const readAccidentsData = () => {
  try {
    const data = fs.readFileSync(accidentsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading accidents data:', error);
    return [];
  }
};

// Helper function to write accidents data
const writeAccidentsData = (data) => {
  try {
    fs.writeFileSync(accidentsFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing accidents data:', error);
    return false;
  }
};

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
    const accidents = readAccidentsData();
    res.json(accidents);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error al leer los datos de incidentes' 
    });
  }
});

// Route for adding new accidents
app.post('/api/accidents', (req, res) => {
  try {
    const newAccident = req.body;
    
    // Read existing accidents
    const accidents = readAccidentsData();
    
    // Add new accident
    accidents.push(newAccident);
    
    // Save updated accidents data
    const success = writeAccidentsData(accidents);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Incidente guardado exitosamente' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Error al guardar el incidente' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route for restoring initial data
app.post('/api/accidents/restore', (req, res) => {
  try {
    // Read initial data from a backup file or hardcoded data
    const initialData = [
      {
        "id": 1,
        "nombre": "Huracán Patricia",
        "municipio": "Tetela de Ocampo",
        "fecha": "2023-10-23",
        "hora": "14:30",
        "tipo": "Huracán",
        "descripcion": "Fuertes vientos y lluvias intensas afectaron la región",
        "coordenadas": [
          -97.8096,
          19.8116
        ],
        "nivel_riesgo": "high",
        "afectados": 15,
        "brigada_asignada": "Brigada de Emergencia 1",
        "imagenes": [],
        "type": "accident"
      },
      {
        "id": 2,
        "nombre": "Inundación por tormenta",
        "municipio": "Tetela de Ocampo",
        "fecha": "2023-09-15",
        "hora": "08:45",
        "tipo": "Inundación",
        "descripcion": "Inundación en la calle principal por tormenta severa",
        "coordenadas": [
          -97.815,
          19.808
        ],
        "nivel_riesgo": "medium",
        "afectados": 8,
        "brigada_asignada": "Brigada de Rescate 2",
        "imagenes": [],
        "type": "accident"
      }
    ];
    
    // Save initial data
    const success = writeAccidentsData(initialData);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Datos iniciales restaurados exitosamente' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Error al restaurar los datos iniciales' 
      });
    }
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