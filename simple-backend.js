import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3004;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit to handle base64 images
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
app.post('/api/accidents', upload.single('image'), async (req, res) => {
  try {
    // Parse the accident data from form data
    const newAccident = JSON.parse(req.body.accident);
    
    // Validate required fields
    if (!newAccident.nombre || !newAccident.tipo || !newAccident.descripcion) {
      return res.status(400).json({ 
        error: 'Missing required fields: nombre, tipo, and descripcion are required' 
      });
    }
    
    // Handle image upload if provided
    if (req.file) {
      try {
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          {
            folder: 'accident_reports',
            use_filename: true,
            unique_filename: false
          }
        );
        
        // Add image URL to accident data
        newAccident.imageUrl = result.secure_url;
        newAccident.imagePublicId = result.public_id;
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        // Continue without image if upload fails
      }
    }
    
    // Read existing accidents
    const accidents = readAccidentsData();
    
    // Add new accident with timestamp
    newAccident.id = Date.now();
    newAccident.createdAt = new Date().toISOString();
    
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

// Handle image upload to Cloudinary
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('Received upload request');
    console.log('Request file:', req.file);
    
    if (!req.file) {
      console.log('No file provided in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Uploading image to Cloudinary...');
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: 'accident_reports',
        use_filename: true,
        unique_filename: false
      }
    );
    
    console.log('Image uploaded successfully:', result.secure_url);

    res.json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
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

app.listen(PORT, () => {
  console.log(`🚀 Simple backend service running on http://localhost:${PORT}`);
  console.log(`📁 Data file: ${accidentsFilePath}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});