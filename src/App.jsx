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
    // In development, use localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3004';
    }
    // In production, we'll use a more persistent storage approach
    return null;
  };

  const apiBaseUrl = getApiBaseUrl();

  // Load accidents from backend API or session storage/fallback
  useEffect(() => {
    const fetchAccidents = async () => {
      try {
        // Try to fetch from API first (only in development)
        if (apiBaseUrl) {
          const response = await fetch(`${apiBaseUrl}/api/accidents`);
          if (response.ok) {
            const data = await response.json();
            setAccidents(data);
            return;
          }
        }
        
        // Try multiple storage options
        // 1. Check sessionStorage
        const sessionAccidents = sessionStorage.getItem('tetela-accidents');
        if (sessionAccidents) {
          setAccidents(JSON.parse(sessionAccidents));
          return;
        }
        
        // 2. Check localStorage (in case it still exists)
        const localAccidents = localStorage.getItem('tetela-accidents');
        if (localAccidents) {
          setAccidents(JSON.parse(localAccidents));
          return;
        }
        
        // 3. Fallback to initial data
        setAccidents(initialAccidentsData);
      } catch (error) {
        console.error('Error fetching accidents:', error);
        // Final fallback to initial data
        setAccidents(initialAccidentsData);
      }
    };

    fetchAccidents();
  }, []);

  // Save accidents to both sessionStorage and localStorage for redundancy
  useEffect(() => {
    if (accidents.length > 0 && !apiBaseUrl) {
      try {
        // Save to sessionStorage (less likely to be cleared)
        sessionStorage.setItem('tetela-accidents', JSON.stringify(accidents));
        // Also save to localStorage as backup
        localStorage.setItem('tetela-accidents-backup', JSON.stringify(accidents));
      } catch (error) {
        console.error('Error saving accidents to storage:', error);
      }
    }
  }, [accidents, apiBaseUrl]);

  const handleAddAccident = async (newAccident) => {
    try {
      // Try to save to backend API (only in development)
      if (apiBaseUrl) {
        const response = await fetch(`${apiBaseUrl}/api/accidents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAccident),
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Update state with new accident
          setAccidents(prevAccidents => [...prevAccidents, newAccident]);
          setShowForm(false); // Close form after successful submission
          return true;
        } else {
          alert('Error al guardar el incidente: ' + result.error);
          return false;
        }
      } else {
        // In production (Vercel), save to storage
        const updatedAccidents = [...accidents, newAccident];
        setAccidents(updatedAccidents);
        setShowForm(false); // Close form after successful submission
        
        // Save to both storage mechanisms
        try {
          sessionStorage.setItem('tetela-accidents', JSON.stringify(updatedAccidents));
          localStorage.setItem('tetela-accidents-backup', JSON.stringify(updatedAccidents));
        } catch (error) {
          console.error('Error saving to storage:', error);
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error adding accident:', error);
      
      // In production, just add to local state
      if (!apiBaseUrl) {
        const updatedAccidents = [...accidents, newAccident];
        setAccidents(updatedAccidents);
        setShowForm(false); // Close form after successful submission
        
        // Save to both storage mechanisms
        try {
          sessionStorage.setItem('tetela-accidents', JSON.stringify(updatedAccidents));
          localStorage.setItem('tetela-accidents-backup', JSON.stringify(updatedAccidents));
        } catch (storageError) {
          console.error('Error saving to storage:', storageError);
        }
        
        return true;
      } else {
        alert('Error al conectar con el servidor para guardar el incidente');
        return false;
      }
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
        // Try to restore via backend API (only in development)
        if (apiBaseUrl) {
          const response = await fetch(`${apiBaseUrl}/api/accidents/restore`, {
            method: 'POST',
          });
          
          const result = await response.json();
          
          if (result.success) {
            setAccidents(initialAccidentsData);
            alert('Datos iniciales restaurados exitosamente.');
          } else {
            throw new Error(result.error);
          }
        } else {
          // In production (Vercel), restore from initial data
          setAccidents(initialAccidentsData);
          
          // Save to both storage mechanisms
          try {
            sessionStorage.setItem('tetela-accidents', JSON.stringify(initialAccidentsData));
            localStorage.setItem('tetela-accidents-backup', JSON.stringify(initialAccidentsData));
          } catch (error) {
            console.error('Error saving to storage:', error);
          }
          
          alert('Datos iniciales restaurados exitosamente.');
        }
      } catch (error) {
        console.error('Error restoring initial data:', error);
        // Fallback to client-side restore
        setAccidents(initialAccidentsData);
        
        // Save to both storage mechanisms
        try {
          sessionStorage.setItem('tetela-accidents', JSON.stringify(initialAccidentsData));
          localStorage.setItem('tetela-accidents-backup', JSON.stringify(initialAccidentsData));
        } catch (storageError) {
          console.error('Error saving to storage:', storageError);
        }
        
        alert('Datos iniciales restaurados exitosamente.');
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
          
          // Save to storage
          if (!apiBaseUrl) {
            try {
              sessionStorage.setItem('tetela-accidents', JSON.stringify(data));
              localStorage.setItem('tetela-accidents-backup', JSON.stringify(data));
            } catch (error) {
              console.error('Error saving imported data:', error);
            }
          }
          
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