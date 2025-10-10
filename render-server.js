import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON with increased size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the dist directory (frontend build)
app.use(express.static(path.join(__dirname, 'dist')));

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

// API Routes
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
    
    // Add new accident with an ID if it doesn't have one
    const accidentWithId = {
      ...newAccident,
      id: newAccident.id || Date.now() // Use existing ID or generate a new one
    };
    
    accidents.push(accidentWithId);
    console.log('New accidents count:', accidents.length);
    
    // Save updated accidents data
    const success = writeAccidentsData(accidents);
    
    if (success) {
      console.log('Accident saved successfully');
      res.json({ 
        success: true, 
        message: 'Incidente guardado exitosamente',
        data: accidentWithId // Return the added accident data
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve the frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Render corriendo en http://localhost:${PORT}`);
  console.log(`📁 Directorio de archivos: ${__dirname}`);
  console.log(`📄 Archivo de datos: ${accidentsFilePath}`);
  console.log(`🏥 Health check endpoint: http://localhost:${PORT}/api/health`);
});