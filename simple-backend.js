import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3004;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir)); // Serve uploaded files

// Path to accidents data file
const accidentsFilePath = path.join(__dirname, 'src', 'data', 'accidents.json');

// Helper function to read accidents data
const readAccidentsData = () => {
  try {
    if (fs.existsSync(accidentsFilePath)) {
      const data = fs.readFileSync(accidentsFilePath, 'utf8');
      return JSON.parse(data);
    } else {
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
    fs.writeFileSync(accidentsFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing accidents data:', error);
    return false;
  }
};

// Routes
app.get('/api/accidents', (req, res) => {
  try {
    const accidents = readAccidentsData();
    res.json(accidents);
  } catch (error) {
    console.error('Error fetching accidents:', error);
    res.status(500).json({ error: 'Failed to fetch accidents data' });
  }
});

// Handle accident creation with optional image upload
app.post('/api/accidents', upload.single('image'), (req, res) => {
  try {
    // Parse the accident data from form data
    const newAccident = JSON.parse(req.body.accident);
    
    // Validate required fields
    if (!newAccident.nombre || !newAccident.tipo || !newAccident.descripcion) {
      return res.status(400).json({ 
        error: 'Missing required fields: nombre, tipo, and descripcion are required' 
      });
    }
    
    // Read existing accidents
    const accidents = readAccidentsData();
    
    // Add new accident with timestamp
    newAccident.id = Date.now();
    newAccident.createdAt = new Date().toISOString();
    
    // If an image was uploaded, add the image path to the accident data
    if (req.file) {
      newAccident.imagePath = `/uploads/${req.file.filename}`;
    }
    
    accidents.push(newAccident);
    
    // Save to file
    const success = writeAccidentsData(accidents);
    
    if (success) {
      res.status(201).json({ 
        message: 'Accident report saved successfully',
        data: newAccident
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to save accident report' 
      });
    }
  } catch (error) {
    console.error('Error saving accident:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

app.post('/api/accidents/restore', (req, res) => {
  try {
    // Sample initial data (same as in accidents.json)
    const initialData = [
      {
        "id": 1,
        "nombre": "Huracán Patricia",
        "municipio": "Tetela de Ocampo",
        "fecha": "2023-10-23",
        "hora": "14:30",
        "tipo": "Huracán",
        "descripcion": "Fuertes vientos y lluvias intensas afectaron la región",
        "coordenadas": [-97.8096, 19.8116],
        "nivel_riesgo": "high",
        "afectados": 15,
        "brigada_asignada": "Brigada de Emergencia 1"
      },
      {
        "id": 2,
        "nombre": "Inundación por tormenta",
        "municipio": "Tetela de Ocampo",
        "fecha": "2023-09-15",
        "hora": "08:45",
        "tipo": "Inundación",
        "descripcion": "Inundación en la calle principal por tormenta severa",
        "coordenadas": [-97.815, 19.808],
        "nivel_riesgo": "medium",
        "afectados": 8,
        "brigada_asignada": "Brigada de Rescate 2"
      }
    ];
    
    // Save initial data
    const success = writeAccidentsData(initialData);
    
    if (success) {
      res.json({ 
        message: 'Initial data restored successfully',
        data: initialData
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to restore initial data' 
      });
    }
  } catch (error) {
    console.error('Error restoring data:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend service is running',
    timestamp: new Date().toISOString(),
    dataFile: accidentsFilePath
  });
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 5MB allowed.' });
    }
  } else if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }
  next(error);
});

app.listen(PORT, () => {
  console.log(`🚀 Simple backend service running on http://localhost:${PORT}`);
  console.log(`📁 Data file: ${accidentsFilePath}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});