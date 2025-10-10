import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to accidents data file
const accidentsFilePath = path.join(process.cwd(), 'src/data/accidents.json');

// Helper function to read accidents data
const readAccidentsData = async () => {
  try {
    console.log('Reading accidents data from:', accidentsFilePath);
    const data = await fs.readFile(accidentsFilePath, 'utf8');
    const parsedData = JSON.parse(data);
    console.log('Successfully read', parsedData.length, 'accidents');
    return parsedData;
  } catch (error) {
    console.error('Error reading accidents data:', error);
    return [];
  }
};

// Helper function to write accidents data
const writeAccidentsData = async (data) => {
  try {
    console.log('Writing accidents data to:', accidentsFilePath);
    // Ensure directory exists
    const dir = path.dirname(accidentsFilePath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(accidentsFilePath, JSON.stringify(data, null, 2));
    console.log('Successfully wrote accidents data');
    return true;
  } catch (error) {
    console.error('Error writing accidents data:', error);
    return false;
  }
};

// GET /api/accidents
export async function GET(request) {
  try {
    console.log('GET /api/accidents request received');
    const accidents = await readAccidentsData();
    console.log('Sending', accidents.length, 'accidents');
    return new Response(JSON.stringify(accidents), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/accidents:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Error al leer los datos de incidentes' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// POST /api/accidents
export async function POST(request) {
  try {
    console.log('POST /api/accidents request received');
    const newAccident = await request.json();
    console.log('Request body:', JSON.stringify(newAccident, null, 2));
    
    // Read existing accidents
    const accidents = await readAccidentsData();
    console.log('Current accidents count:', accidents.length);
    
    // Add new accident
    accidents.push(newAccident);
    console.log('New accidents count:', accidents.length);
    
    // Save updated accidents data
    const success = await writeAccidentsData(accidents);
    
    if (success) {
      console.log('Accident saved successfully');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Incidente guardado exitosamente' 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      console.error('Failed to save accident data');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Error al guardar el incidente' 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Error in POST /api/accidents:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}