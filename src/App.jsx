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
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [apiBaseUrl] = useState('http://localhost:3004');

  // Check if backend is available
  const checkBackendAvailability = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/health`);
      if (response.ok) {
        setBackendAvailable(true);
        return true;
      }
    } catch (error) {
      console.log('Backend not available');
    }
    setBackendAvailable(false);
    return false;
  };

  // Load accidents data when component mounts
  useEffect(() => {
    const loadAccidentsData = async () => {
      try {
        // Check if backend is available
        const isBackendAvailable = await checkBackendAvailability();
        
        if (isBackendAvailable) {
          // Load from backend
          const response = await fetch(`${apiBaseUrl}/api/accidents`);
          if (response.ok) {
            const data = await response.json();
            setAccidents(data);
            return;
          }
        }
        
        // Fallback to local data
        console.log('Using local fallback data');
        setAccidents(initialAccidentsData);
      } catch (error) {
        console.error('Error loading accidents data:', error);
        // Fallback to local data in case of error
        setAccidents(initialAccidentsData);
      }
    };

    loadAccidentsData();
  }, [apiBaseUrl]);

  const handleAddAccident = async (newAccident) => {
    try {
      console.log('Attempting to save accident:', newAccident);
      
      // Check if backend is available
      const isBackendAvailable = await checkBackendAvailability();
      
      if (isBackendAvailable) {
        // Save to backend
        const response = await fetch(`${apiBaseUrl}/api/accidents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAccident),
        });
        
        if (response.ok) {
          const result = await response.json();
          // Add to local state
          const updatedAccidents = [...accidents, result.data];
          setAccidents(updatedAccidents);
          setShowForm(false);
          alert('Reporte de incidente agregado exitosamente!');
          return true;
        } else {
          const errorData = await response.json();
          alert(`Error al guardar el incidente: ${errorData.error}`);
          return false;
        }
      } else {
        // Fallback to localStorage if backend is not available
        const updatedAccidents = [...accidents, {...newAccident, id: Date.now()}];
        setAccidents(updatedAccidents);
        try {
          localStorage.setItem('tetela-accidents', JSON.stringify(updatedAccidents));
          console.log('Accidents saved to localStorage as fallback');
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
        setShowForm(false);
        alert('Reporte de incidente agregado localmente. Para guardar permanentemente en el archivo accidents.json, inicie el servidor backend con "npm run backend".');
        return true;
      }
    } catch (error) {
      console.error('Error adding accident:', error);
      alert(`Error al agregar el incidente: ${error.message}`);
      setShowForm(false);
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
        // Check if backend is available
        const isBackendAvailable = await checkBackendAvailability();
        
        if (isBackendAvailable) {
          const response = await fetch(`${apiBaseUrl}/api/accidents/restore`, {
            method: 'POST',
          });
          
          if (response.ok) {
            const result = await response.json();
            setAccidents(result.data);
            alert('Datos iniciales restaurados exitosamente.');
            return;
          } else {
            const errorData = await response.json();
            alert(`Error al restaurar los datos: ${errorData.error}`);
            return;
          }
        }
        
        // Fallback to local data
        setAccidents(initialAccidentsData);
        alert('Datos iniciales restaurados exitosamente (datos locales).');
      } catch (error) {
        console.error('Error restoring initial data:', error);
        alert('Error al restaurar los datos iniciales.');
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
                          <p><strong>Entorno:</strong> {backendAvailable ? 'Con backend disponible' : 'Sin backend (solo lectura)'}</p>
                          <p><strong>API URL:</strong> {apiBaseUrl}</p>
                          {!backendAvailable && (
                            <p>
                              <strong>Nota:</strong> Los datos se guardan localmente en su navegador. 
                              Para guardar permanentemente en el archivo accidents.json, inicie el servidor backend: <code>npm run backend</code>
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