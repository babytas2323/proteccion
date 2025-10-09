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
let PORT = parseInt(process.env.PORT) || 3004; // Use environment port or default to 3004

// Enable CORS
app.use(cors());

// Serve static files from the public directory
app.use(express.static('public'));

// Middleware to parse JSON with increased size limit
app.use(express.json({ limit: '10mb' }));

// Configure multer for file uploads with proper limits
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the directory exists
    const dir = 'public/images';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'accident-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Increased to 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      console.log('File accepted:', file.originalname);
      cb(null, true);
    } else {
      console.log('File rejected:', file.originalname);
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Path to accidents data file
const accidentsFilePath = path.join(__dirname, 'src/data/accidents.json');

// Helper function to read accidents data
const readAccidentsData = () => {
  try {
    console.log('Reading accidents data from:', accidentsFilePath);
    if (fs.existsSync(accidentsFilePath)) {
      const data = fs.readFileSync(accidentsFilePath, 'utf8');
      const parsedData = JSON.parse(data);
      console.log('Successfully read', parsedData.length, 'accidents');
      return parsedData;
    } else {
      console.log('Accidents file not found, returning empty array');
      return [];
    }
  } catch (error) {
    console.error('Error reading accidents data:', error);
    return [];
  }
};

// Helper function to write accidents data
const writeAccidentsData = (data) => {
  try {
    console.log('Writing accidents data to:', accidentsFilePath);
    console.log('Data to write:', JSON.stringify(data, null, 2));
    
    // Ensure directory exists
    const dir = path.dirname(accidentsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(accidentsFilePath, JSON.stringify(data, null, 2));
    console.log('Successfully wrote accidents data');
    return true;
  } catch (error) {
    console.error('Error writing accidents data:', error);
    return false;
  }
};

// Route for uploading images
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    console.log('Image upload request received');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ 
        success: false, 
        error: 'No se ha seleccionado ningún archivo' 
      });
    }

    console.log('File uploaded successfully:', req.file);
    
    // Return success response with file information
    res.json({
      success: true,
      filename: req.file.filename,
      path: `images/${req.file.filename}`,
      message: 'Imagen guardada exitosamente'
    });
  } catch (error) {
    console.error('Error in image upload:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route for getting accidents data
app.get('/api/accidents', (req, res) => {
  try {
    console.log('GET /api/accidents request received');
    const accidents = readAccidentsData();
    console.log('Sending', accidents.length, 'accidents');
    res.json(accidents);
  } catch (error) {
    console.error('Error in GET /api/accidents:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al leer los datos de incidentes' 
    });
  }
});

// Route for adding new accidents
app.post('/api/accidents', (req, res) => {
  try {
    console.log('POST /api/accidents request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const newAccident = req.body;
    
    // Read existing accidents
    const accidents = readAccidentsData();
    console.log('Current accidents count:', accidents.length);
    
    // Add new accident
    accidents.push(newAccident);
    console.log('New accidents count:', accidents.length);
    
    // Save updated accidents data
    const success = writeAccidentsData(accidents);
    
    if (success) {
      console.log('Accident saved successfully');
      res.json({ 
        success: true, 
        message: 'Incidente guardado exitosamente' 
      });
    } else {
      console.error('Failed to save accident data');
      res.status(500).json({ 
        success: false, 
        error: 'Error al guardar el incidente' 
      });
    }
  } catch (error) {
    console.error('Error in POST /api/accidents:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route for restoring initial data
app.post('/api/accidents/restore', (req, res) => {
  try {
    console.log('POST /api/accidents/restore request received');
    
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
      console.log('Initial data restored successfully');
      res.json({ 
        success: true, 
        message: 'Datos iniciales restaurados exitosamente' 
      });
    } else {
      console.error('Failed to restore initial data');
      res.status(500).json({ 
        success: false, 
        error: 'Error al restaurar los datos iniciales' 
      });
    }
  } catch (error) {
    console.error('Error in POST /api/accidents/restore:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Start the server with better error handling
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
    console.log(`📁 Directorio de imágenes: public/images/`);
    console.log(`📄 Archivo de datos: ${accidentsFilePath}`);
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Puerto ${port} está en uso, intentando con el puerto ${port + 1}...`);
      setTimeout(() => {
        server.close();
        startServer(port + 1);
      }, 1000);
    } else {
      console.error('Error del servidor:', error);
    }
  });
};

startServer(PORT);

export default app;