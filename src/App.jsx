import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faPlus, faTimes, faDownload, faUpload, faImage } from '@fortawesome/free-solid-svg-icons';
import MapComponent from './components/MapComponent';
import SensorForm from './components/SensorForm';
import ErrorBoundary from './components/ErrorBoundary';
import { formatErrorMessage, logError, showErrorNotification, handleApiError } from './utils/errorHandler';

import './App.css';

// Import xlsx library for Excel export
import * as XLSX from 'xlsx';

// Import initial data as fallback
import initialAccidentsData from './data/accidents.json';

function App() {
  const [accidents, setAccidents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);

  const [apiBaseUrl] = useState('http://localhost:3004');
  const [mostrarClima, setMostrarClima] = useState(false); // State for weather widget
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get risk level from accident data
  const getRiskLevel = (accident) => {
    const riskLevel = accident.nivel_riesgo || accident.riskLevel;
    if (!riskLevel) return 'low';
    
    const normalizedRiskLevel = riskLevel.toString().toLowerCase();
    if (normalizedRiskLevel.includes('bajo') || normalizedRiskLevel.includes('low')) {
      return 'low';
    } else if (normalizedRiskLevel.includes('medio') || normalizedRiskLevel.includes('medium')) {
      return 'medium';
    } else if (normalizedRiskLevel.includes('alto') || normalizedRiskLevel.includes('high') || normalizedRiskLevel.includes('crítico')) {
      return 'high';
    }
    return 'low';
  };

  // Function to count accidents by risk level
  const countAccidentsByRiskLevel = () => {
    const counts = { low: 0, medium: 0, high: 0 };
    
    accidents.forEach(accident => {
      const riskLevel = getRiskLevel(accident);
      counts[riskLevel]++;
    });
    
    return counts;
  };

  // Function to count accidents by type
  const getIncidentTypeCounts = () => {
    const typeCounts = {};
    
    accidents.forEach(accident => {
      const type = accident.tipo || 'No especificado';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    // Convert to array of elements to display
    return Object.entries(typeCounts).map(([type, count]) => (
      <p key={type}><strong>{type}:</strong> {count} incidentes</p>
    ));
  };

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

  // Sync local data with backend when it comes back online
  const syncLocalDataWithBackend = async () => {
    try {
      // Get local data from localStorage
      const localData = localStorage.getItem('tetela-accidents');
      if (localData) {
        const accidentsData = JSON.parse(localData);
        
        // If there's local data and backend is now available, sync it
        if (accidentsData.length > 0) {
          const isBackendAvailable = await checkBackendAvailability();
          if (isBackendAvailable) {
            // Send each local accident to the backend
            let syncSuccess = true;
            for (const accident of accidentsData) {
              // Skip accidents that already have IDs from the backend
              if (!accident.id || typeof accident.id !== 'number') {
                try {
                  const response = await fetch(`${apiBaseUrl}/api/accidents`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(accident),
                  });
                  
                  if (!response.ok) {
                    syncSuccess = false;
                    console.error('Failed to sync accident:', accident);
                  }
                } catch (error) {
                  syncSuccess = false;
                  console.error('Error syncing accident:', error);
                }
              }
            }
            
            if (syncSuccess) {
              // Clear local storage after successful sync
              localStorage.removeItem('tetela-accidents');
              showErrorNotification('Datos locales sincronizados con el servidor exitosamente!', 'info');
              
              // Reload data from backend
              const response = await fetch(`${apiBaseUrl}/api/accidents`);
              if (response.ok) {
                const data = await response.json();
                setAccidents(data);
              }
            } else {
              showErrorNotification('Algunos datos locales no se pudieron sincronizar. Intente más tarde.', 'warning');
            }
          }
        }
      }
    } catch (error) {
      logError('Syncing local data with backend', error);
      showErrorNotification('Error al sincronizar datos locales con el servidor.', 'error');
    }
  };

  // Load accidents data when component mounts
  useEffect(() => {
    const loadAccidentsData = async () => {
      try {
        setLoading(true);
        setError(null);
        

        
        // Check if backend is available
        const isBackendAvailable = await checkBackendAvailability();
        
        if (isBackendAvailable) {
          // Load from backend
          const response = await fetch(`${apiBaseUrl}/api/accidents`);
          if (response.ok) {
            const data = await response.json();
            setAccidents(data);
            
            // Try to sync any local data that might exist
            await syncLocalDataWithBackend();
          } else {
            throw new Error(`Error al cargar datos: ${response.status} ${response.statusText}`);
          }
        } else {
          // Fallback to local data
          console.log('Using local fallback data');
          setAccidents(initialAccidentsData);
          showErrorNotification('Trabajando en modo sin conexión. Los datos se guardarán localmente.', 'info');
        }
      } catch (error) {
        logError('Loading accidents data', error);
        setError(formatErrorMessage(error));
        // Fallback to local data in case of error
        setAccidents(initialAccidentsData);
        showErrorNotification('Error al cargar datos. Usando datos locales.', 'warning');
      } finally {
        setLoading(false);
      }
    };

    loadAccidentsData();
  }, [apiBaseUrl]);

  const handleAddAccident = async (newAccident, imageFile) => {
    try {
      console.log('Attempting to save accident:', newAccident);
      
      // Check if backend is available
      const isBackendAvailable = await checkBackendAvailability();
      
      if (isBackendAvailable) {
        // If there's an image, convert it to base64 and add it to the accident data
        if (imageFile) {
          // Convert image to base64
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64Image = e.target.result;
            
            // Add base64 image to accident data
            const accidentWithImage = {
              ...newAccident,
              image: base64Image
            };
            
            // Save to backend
            const response = await fetch(`${apiBaseUrl}/api/accidents`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(accidentWithImage),
            });
            
            if (response.ok) {
              const result = await response.json();
              // Add to local state
              const updatedAccidents = [...accidents, result.data];
              setAccidents(updatedAccidents);
              setShowForm(false);
              showErrorNotification('Reporte de incidente agregado exitosamente!', 'info');
              return true;
            } else {
              const errorMessage = await handleApiError(response);
              showErrorNotification(errorMessage);
              return false;
            }
          };
          reader.readAsDataURL(imageFile);
        } else {
          // Save to backend without image
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
            showErrorNotification('Reporte de incidente agregado exitosamente!', 'info');
            return true;
          } else {
            const errorMessage = await handleApiError(response);
            showErrorNotification(errorMessage);
            return false;
          }
        }
      } else {
        // For offline scenarios, always save locally first
        const updatedAccidents = [...accidents, {...newAccident, id: Date.now()}];
        setAccidents(updatedAccidents);
        
        // Try to save to localStorage
        try {
          localStorage.setItem('tetela-accidents', JSON.stringify(updatedAccidents));
          console.log('Accidents saved to localStorage');
        } catch (error) {
          logError('Saving to localStorage', error);
          showErrorNotification('Error al guardar datos localmente.');
        }
        
// Continue with local save
        
        setShowForm(false);
        showErrorNotification('Reporte de incidente agregado localmente. Para guardar permanentemente inicie el servidor backend.', 'warning');
        return true;
      }
    } catch (error) {
      logError('Adding accident', error);
      showErrorNotification(`Error al agregar el incidente: ${formatErrorMessage(error)}`);
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
            showErrorNotification('Datos iniciales restaurados exitosamente.', 'info');
            return;
          } else {
            const errorMessage = await handleApiError(response);
            showErrorNotification(errorMessage);
            return;
          }
        }
        
        // Fallback to local data
        setAccidents(initialAccidentsData);
        showErrorNotification('Datos iniciales restaurados exitosamente (datos locales).', 'info');
      } catch (error) {
        logError('Restoring initial data', error);
        showErrorNotification('Error al restaurar los datos iniciales.');
      }
    }
  };

  // Export data to file
  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(accidents, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `tetela-accidents-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showErrorNotification('Datos exportados exitosamente!', 'info');
    } catch (error) {
      logError('Exporting data', error);
      showErrorNotification('Error al exportar datos.');
    }
  };

  // Export data to Excel
  const handleExportToExcel = () => {
    try {
      // Prepare data for Excel export
      const excelData = accidents.map(accident => ({
        'ID': accident.id || '',
        'Nombre del Incidente': accident.nombre || accident.name || '',
        'Municipio': accident.municipio || accident.Municipio || '',
        'Fecha': accident.fecha || '',
        'Hora': accident.hora || accident.Hora || '',
        'Tipo de Incidente': accident.tipo || accident.Tipo || '',
        'Descripción': accident.descripcion || accident.Descripcion || '',
        'Latitud': accident.coordenadas ? accident.coordenadas[1] : '',
        'Longitud': accident.coordenadas ? accident.coordenadas[0] : '',
        'Nivel de Riesgo': accident.nivel_riesgo || accident.riskLevel || '',
        'Personas Afectadas': accident.afectados || accident.Afectados || 0,
        'Localidad': accident.localidad || accident.brigada_asignada || '',
        'Teléfono': accident.telefono || ''
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Incidentes');
      
      // Export to Excel file
      const exportFileName = `tetela-accidents-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, exportFileName);
      
      showErrorNotification('Datos exportados a Excel exitosamente!', 'info');
    } catch (error) {
      logError('Exporting to Excel', error);
      showErrorNotification('Error al exportar datos a Excel.');
    }
  };

  // Import data from file
  const handleImportData = (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data)) {
            setAccidents(data);
            showErrorNotification('Datos importados exitosamente!', 'info');
          } else {
            showErrorNotification('Formato de archivo inválido. Debe ser un arreglo JSON.');
          }
        } catch (error) {
          logError('Parsing imported file', error);
          showErrorNotification('Error al importar el archivo. Asegúrese de que sea un archivo JSON válido.');
        }
      };
      reader.readAsText(file);
      
      // Reset file input
      event.target.value = '';
    } catch (error) {
      logError('Importing data', error);
      showErrorNotification('Error al importar datos.');
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
    <ErrorBoundary>
      <Router>
        <div className="App">
          <header className="app-header">
            <h1>Sistema de Detección de Riesgos - Tetela de Ocampo</h1>
          </header>
          
          <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {loading && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
              }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '30px',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <p>Cargando datos...</p>
                </div>
              </div>
            )}
            
            {error && (
              <div style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '5px',
                padding: '15px 20px',
                color: '#721c24',
                zIndex: 9999,
                maxWidth: '90%',
                textAlign: 'center'
              }}>
                <strong>Error:</strong> {error}
                <button 
                  onClick={() => setError(null)} 
                  style={{
                    marginLeft: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#721c24',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            )}
            
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
                    
                    {/* 🌤️ Botón del clima */}
                    <button
                      onClick={() => setMostrarClima(!mostrarClima)}
                      style={{
                        position: 'absolute',
                        top: '120px', // Positioned below the form button
                        right: 0,
                        backgroundColor: '#4285f4',
                        color: 'white',
                        borderRadius: '50% 0 0 50%',
                        width: '50px',
                        height: '50px',
                        border: '2px solid #ffffff',
                        fontSize: '1.5em',
                        cursor: 'pointer',
                        boxShadow: '0 6px 15px rgba(66, 133, 244, 0.4)',
                        zIndex: 9999,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        outline: 'none',
                        transform: 'scale(1)',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#3367d6';
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.boxShadow = '0 8px 20px rgba(66, 133, 244, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#4285f4';
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 6px 15px rgba(66, 133, 244, 0.4)';
                      }}
                      onMouseDown={(e) => {
                        e.target.style.transform = 'scale(0.95)';
                      }}
                      onMouseUp={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                      }}
                    >
                      🌤️
                    </button>
                  </div>
                  
                  {/* Widget del clima */}
                  {mostrarClima && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '170px', // Adjusted to appear below the weather button
                        right: '1em',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        zIndex: 9999,
                        border: '1px solid #e0e0e0',
                        maxWidth: '400px',
                        width: '90%',
                      }}
                    >
                      {/* Botón para cerrar el widget del clima */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          padding: '10px 10px 0 0',
                        }}
                      >
                        <button
                          onClick={() => setMostrarClima(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#777',
                            padding: '0',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          ×
                        </button>
                      </div>
                      
                      <iframe
                        src="https://www.meteoblue.com/es/tiempo/mapas/widget/tetela-de-ocampo_m%C3%A9xico_3515762?windAnimation=1&gust=1&satellite=1&cloudsAndPrecipitation=1&temperature=1&sunshine=1&extremeForecastIndex=1&geoloc=fixed&tempunit=C&windunit=km%252Fh&lengthunit=metric&zoom=5&autowidth=auto"
                        frameBorder="0"
                        scrolling="NO"
                        allowTransparency="true"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                        style={{
                          width: '100%',
                          height: '400px',
                          borderRadius: '0 0 12px 12px',
                        }}
                      ></iframe>
                    </div>
                  )}
                  
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
                          <span>Riesgo Bajo ({countAccidentsByRiskLevel().low})</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color" style={{backgroundColor: 'orange'}}></div>
                          <span>Riesgo Medio ({countAccidentsByRiskLevel().medium})</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-color" style={{backgroundColor: 'red'}}></div>
                          <span>Riesgo Alto ({countAccidentsByRiskLevel().high})</span>
                        </div>
                        <div className="legend-description">
                          <p><strong>Incidentes reportados:</strong> <br />{accidents.length} incidentes en Tetela de Ocampo</p>
                          <p><strong>Última actualización:</strong><br /> {new Date().toLocaleString('es-MX')}</p>
                          
                          {/* Incident type counts */}
                          <div className="incident-type-counts">
                            <h4>Clasificación de Incidentes por Tipo:</h4>
                            {getIncidentTypeCounts()}
                          </div>
                          
                          {/* Data Management Buttons */}
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                            <button 
                              onClick={handleExportData} 
                              className="restore-button"
                              style={{ backgroundColor: '#28a745', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                              <FontAwesomeIcon icon={faDownload} />
                              Exportar Datos (JSON)
                            </button>
                            
                            <button 
                              onClick={handleExportToExcel} 
                              className="restore-button"
                              style={{ backgroundColor: '#20c997', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                              <FontAwesomeIcon icon={faDownload} />
                              Exportar a Excel
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
                                Para guardar permanentemente en el archivo accidents.json, inicie el servidor backend: <code>npm run backend</code>.
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
    </ErrorBoundary>
  );
}

export default App;