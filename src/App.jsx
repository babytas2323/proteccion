import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import MapComponent from './components/MapComponent';
import SensorForm from './components/SensorForm';
import './App.css';

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
    // In production (Vercel), use relative paths for static data
    return '';
  };

  const apiBaseUrl = getApiBaseUrl();

  // Load accidents from backend API or local data
  useEffect(() => {
    const fetchAccidents = async () => {
      try {
        // Try to fetch from API first
        if (apiBaseUrl) {
          const response = await fetch(`${apiBaseUrl}/api/accidents`);
          if (response.ok) {
            const data = await response.json();
            setAccidents(data);
            return;
          }
        }
        // Fallback to local data if API fails or in production
        import('./data/accidents.json').then((accidentsData) => {
          setAccidents(accidentsData.default);
        });
      } catch (error) {
        console.error('Error fetching accidents:', error);
        // Final fallback to local data
        import('./data/accidents.json').then((accidentsData) => {
          setAccidents(accidentsData.default);
        });
      }
    };

    fetchAccidents();
  }, []);

  const handleAddAccident = async (newAccident) => {
    try {
      // Only try to save to backend in development
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
        // In production (Vercel), just add to local state
        setAccidents(prevAccidents => [...prevAccidents, newAccident]);
        setShowForm(false); // Close form after successful submission
        return true;
      }
    } catch (error) {
      console.error('Error adding accident:', error);
      // In production, just add to local state
      if (!apiBaseUrl) {
        setAccidents(prevAccidents => [...prevAccidents, newAccident]);
        setShowForm(false); // Close form after successful submission
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
  const handleRestoreInitialData = () => {
    if (window.confirm('¿Está seguro de que desea restaurar los datos iniciales? Esto eliminará todos los incidentes agregados.')) {
      // In a real app, you would call a backend endpoint to restore data
      // For now, we'll just reload the initial data
      import('./data/accidents.json').then((accidentsData) => {
        setAccidents(accidentsData.default);
        alert('Datos iniciales restaurados exitosamente.');
      });
    }
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
                        <button onClick={handleRestoreInitialData} className="restore-button">
                          Restaurar Datos Iniciales
                        </button>
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