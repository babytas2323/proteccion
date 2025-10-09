import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faPlus, faTimes, faDownload, faUpload } from '@fortawesome/free-solid-svg-icons';
import MapComponent from './components/MapComponent';
import SensorForm from './components/SensorForm';
import './App.css';

// Import initial data as fallback
import initialAccidentsData from './data/accidents.json';

function App() {
  const [accidents, setAccidents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Determine the base URL for API calls
  const getApiBaseUrl = () => {
    // In development, use localhost with the correct port
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3004'; // Node.js backend for local development
    }
    
    // For production, you need to deploy your backend and update this URL
    // Examples of what you should replace it with:
    // For PHP backend on 000webhost: return 'https://your-actual-site.000webhostapp.com/api';
    // For Node.js backend on Render: return 'https://your-app-name.onrender.com';
    // For PHP backend on InfinityFree: return 'https://your-username.infinityfreeapp.com/api';
    
    // IMPORTANT: Replace this placeholder with your actual deployed backend URL
    console.warn('⚠️ Backend API URL not configured for production');
    console.warn('📄 File to update: src/App.jsx');
    console.warn('📝 Location: getApiBaseUrl() function, line ~25');
    console.warn('🔧 Action: Replace the return value with your actual backend URL');
    return null; // No backend available - this is why data saving doesn't work
  };

  const apiBaseUrl = getApiBaseUrl();

  // Load accidents from backend API or fallback to initial data
  useEffect(() => {
    const fetchAccidents = async () => {
      try {
        // Try to fetch from API
        if (apiBaseUrl) {
          console.log('Fetching accidents from API:', `${apiBaseUrl}/api/accidents`);
          const response = await fetch(`${apiBaseUrl}/api/accidents`);
          console.log('API response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Accidents data received:', data);
            setAccidents(data);
            return;
          } else {
            throw new Error(`API request failed: ${response.status}`);
          }
        } else {
          // No backend available, use initial data
          console.log('No backend available, using initial data');
          setAccidents(initialAccidentsData);
        }
      } catch (error) {
        console.error('Error fetching accidents:', error);
        // Fallback to initial data
        setAccidents(initialAccidentsData);
      }
    };

    fetchAccidents();
  }, []);

  const handleAddAccident = async (newAccident) => {
    try {
      console.log('Attempting to save accident:', newAccident);
      
      // Try to save to backend API
      if (apiBaseUrl) {
        console.log('Sending request to API:', `${apiBaseUrl}/api/accidents`);
        const response = await fetch(`${apiBaseUrl}/api/accidents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAccident),
        });
        
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('API response data:', result);
          
          if (result.success) {
            // Update state with new accident
            setAccidents(prevAccidents => [...prevAccidents, newAccident]);
            setShowForm(false); // Close form after successful submission
            alert('Reporte de incidente agregado exitosamente!');
            return true;
          } else {
            const errorMessage = result.error || 'Error desconocido al guardar el incidente';
            console.error('API returned error:', errorMessage);
            alert(`Error al guardar el incidente: ${errorMessage}`);
            return false;
          }
        } else {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
      } else {
        // No backend available
        const errorMessage = 'No se puede guardar datos en este entorno. Para guardar datos, debe implementar un servicio backend externo y configurar la URL en src/App.jsx';
        console.log(errorMessage);
        alert(errorMessage);
        return false;
      }
    } catch (error) {
      console.error('Error adding accident:', error);
      // Provide more specific error message
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        alert(`Error de conexión: No se puede conectar con el servidor backend. Verifique que:
1. Ha desplegado su backend
2. Ha actualizado la URL en src/App.jsx
3. La URL es correcta y accesible

Error detallado: ${error.message}`);
      } else {
        alert(`Error al conectar con el servidor para guardar el incidente: ${error.message}`);
      }
      return false;
    }
  };

  // Function to handle when user location is found
  const handleLocationFound = (lat, lng) => {
    setUserLocation({ lat, lng });
  };

  // Function to restore initial data
  const handleRestoreInitialData = async () => {
    if (window.confirm('¿Está seguro de que desea restaurar los datos iniciales? Esto eliminará todos los incidentes agregados.')) {
      try {
        // Try to restore via backend API
        if (apiBaseUrl) {
          console.log('Sending restore request to API:', `${apiBaseUrl}/api/accidents/restore`);
          const response = await fetch(`${apiBaseUrl}/api/accidents/restore`, {
            method: 'POST',
          });
          
          console.log('Restore API response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('Restore API response data:', result);
            
            if (result.success) {
              setAccidents(initialAccidentsData);
              alert('Datos iniciales restaurados exitosamente.');
            } else {
              const errorMessage = result.error || 'Error desconocido al restaurar los datos';
              console.error('API returned error:', errorMessage);
              alert(`Error al restaurar los datos: ${errorMessage}`);
            }
          } else {
            throw new Error(`API request failed: ${response.status}`);
          }
        } else {
          // No backend available
          setAccidents(initialAccidentsData);
          alert('Datos iniciales restaurados exitosamente (datos locales).');
        }
      } catch (error) {
        console.error('Error restoring initial data:', error);
        alert(`Error al conectar con el servidor para restaurar los datos: ${error.message}`);
      }
    }
  };

  // Export data to file
  const handleExportData = () => {
    const dataStr = JSON.stringify(accidents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tetela-accidents-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import data from file
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          setAccidents(data);
          alert('Datos importados exitosamente!');
        } else {
          alert('Formato de archivo inválido. Debe ser un arreglo JSON.');
        }
      } catch (error) {
        console.error('Error parsing imported file:', error);
        alert('Error al importar el archivo. Asegúrese de que sea un archivo JSON válido.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  // Toggle legend visibility
  const toggleLegend = () => {
    setShowLegend(!showLegend);
    if (!showLegend) {
      setShowForm(false); // Close form when opening legend
    }
  };

  // Toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      setShowLegend(false); // Close legend when opening form
    }
  };

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>Sistema de Detección de Riesgos - Tetela de Ocampo</h1>
        </header>
        
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={
              <>
                <MapComponent 
                  sensors={accidents} 
                  userLocation={userLocation}
                  onLocationFound={handleLocationFound}
                />
                
                {/* Floating Buttons */}
                <div className="floating-buttons">
                  <button 
                    className={`floating-button legend-button ${showLegend ? 'active' : ''}`}
                    onClick={toggleLegend}
                    title="Mostrar/Ocultar Leyenda"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </button>
                  
                  <button 
                    className={`floating-button form-button ${showForm ? 'active' : ''}`}
                    onClick={toggleForm}
                    title="Agregar Incidente"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
                
                {/* Legend Panel */}
                {showLegend && (
                  <div className="floating-panel legend-panel">
                    <div className="panel-header">
                      <h2>Leyenda del Sistema de Radar</h2>
                      <button className="close-button" onClick={toggleLegend}>
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                    <div className="legend-content">
                      <div className="legend-item">
                        <div className="legend-color" style={{backgroundColor: 'green'}}></div>
                        <span>Riesgo Bajo</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color" style={{backgroundColor: 'orange'}}></div>
                        <span>Riesgo Medio</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color" style={{backgroundColor: 'red'}}></div>
                        <span>Riesgo Alto</span>
                      </div>
                      <div className="legend-description">
                        <p><strong>Incidentes reportados:</strong> {accidents.length} incidentes en Tetela de Ocampo</p>
                        <p><strong>Última actualización:</strong> {new Date().toLocaleString('es-MX')}</p>
                        
                        {/* Data Management Buttons */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                          <button 
                            onClick={handleExportData} 
                            className="restore-button"
                            style={{ backgroundColor: '#28a745', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <FontAwesomeIcon icon={faDownload} />
                            Exportar Datos
                          </button>
                          
                          <label 
                            className="restore-button"
                            style={{ 
                              backgroundColor: '#007bff', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '5px',
                              cursor: 'pointer',
                              margin: 0
                            }}
                          >
                            <FontAwesomeIcon icon={faUpload} />
                            Importar Datos
                            <input 
                              type="file" 
                              accept=".json"
                              onChange={handleImportData}
                              style={{ display: 'none' }}
                            />
                          </label>
                          
                          <button 
                            onClick={handleRestoreInitialData} 
                            className="restore-button"
                            style={{ backgroundColor: '#dc3545' }}
                          >
                            Restaurar Datos Iniciales
                          </button>
                        </div>
                        
                        {/* Environment Info */}
                        <div style={{ 
                          marginTop: '15px', 
                          padding: '10px', 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: '5px',
                          fontSize: '12px',
                          color: '#6c757d'
                        }}>
                          <p><strong>Entorno:</strong> {apiBaseUrl ? 'Con backend disponible' : 'Sin backend (solo lectura)'}</p>
                          {apiBaseUrl && <p><strong>API URL:</strong> {apiBaseUrl}</p>}
                          {!apiBaseUrl && (
                            <p>
                              <strong>Nota:</strong> Para guardar datos permanentemente, ejecute la aplicación localmente 
                              con el servidor backend o implemente un servicio backend externo.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Form Panel */}
                {showForm && (
                  <div className="floating-panel form-panel">
                    <div className="panel-header">
                      <h2>Agregar Nuevo Incidente</h2>
                      <button className="close-button" onClick={toggleForm}>
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                    <div className="form-content">
                      <SensorForm onAddSensor={handleAddAccident} />
                    </div>
                  </div>
                )}
              </>
            } />
            
            <Route path="/add-accident" element={
              <div className="full-page-form">
                <SensorForm onAddSensor={handleAddAccident} />
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;