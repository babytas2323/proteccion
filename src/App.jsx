import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faPlus, faTimes, faDownload, faUpload, faImage, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import MapComponent from './components/MapComponent';
import SensorForm from './components/SensorForm';
import ErrorBoundary from './components/ErrorBoundary';
import DatabaseTest from './components/DatabaseTest';
import { formatErrorMessage, logError, showErrorNotification, handleApiError } from './utils/errorHandler';

// Import Firebase
import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

import './App.css';

// Import xlsx library for Excel export
import * as XLSX from 'xlsx';

// Import initial data as fallback
import initialAccidentsData from './data/accidents.json';

// Component to track route changes and update mapView state
const RouteTracker = ({ setMapView }) => {
  const location = useLocation();
  
  useEffect(() => {
    if (location.pathname === '/proteccion-civil') {
      setMapView('civil-protection');
    } else {
      setMapView('public');
    }
  }, [location, setMapView]);
  
  return null;
};

// Component for view toggle buttons
const ViewToggleButtons = ({ currentView }) => {
  const navigate = useNavigate();
  
 
};

function App() {
  const [accidents, setAccidents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true); // Firebase is always available
  const [mapView, setMapView] = useState('public'); // 'public' or 'civil-protection'

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

  // Load accidents data from Firebase
  const loadAccidentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading accidents from Firebase');
      const q = query(collection(db, "accidents"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const accidentsData = [];
      
      querySnapshot.forEach((doc) => {
        accidentsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('Accidents data loaded:', accidentsData);
      setAccidents(accidentsData);
    } catch (error) {
      console.error('Error loading accidents data:', error);
      logError('Loading accidents data', error);
      setError(formatErrorMessage(error));
      // Fallback to local data in case of error
      setAccidents(initialAccidentsData);
      showErrorNotification('Error al cargar datos. Usando datos locales.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Add accident to Firebase
  const addAccidentToFirebase = async (accidentData) => {
    try {
      console.log('Adding accident to Firebase:', accidentData);
      
      // Add timestamp
      const accidentWithTimestamp = {
        ...accidentData,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, "accidents"), accidentWithTimestamp);
      
      // Add to local state
      const accidentToAdd = {
        id: docRef.id,
        ...accidentWithTimestamp
      };
      
      const updatedAccidents = [...accidents, accidentToAdd];
      setAccidents(updatedAccidents);
      
      setShowForm(false);
      showErrorNotification('Reporte de incidente agregado exitosamente!', 'info');
      return true;
    } catch (error) {
      console.error('Error adding accident:', error);
      logError('Adding accident', error);
      showErrorNotification('Error al agregar el incidente.', 'error');
      return false;
    }
  };

  // Load accidents data when component mounts
  useEffect(() => {
    loadAccidentsData();
  }, []);

  const handleAddAccident = async (newAccident, imageFile) => {
    try {
      console.log('Attempting to save accident:', newAccident);
      
      // Function to save accident with image data
      const saveAccident = async (accidentData) => {
        // Save to Firebase
        return await addAccidentToFirebase(accidentData);
      };
      
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
          
          // Save the accident with image data
          await saveAccident(accidentWithImage);
        };
        reader.readAsDataURL(imageFile);
        return true; // Return early as we're handling the async operation
      } else {
        // Save without image
        return await saveAccident(newAccident);
      }
    } catch (error) {
      logError('Adding accident', error);
      // Instead of showing error, just log it since user wants to ignore it
      console.log('Error adding accident (ignored):', formatErrorMessage(error));
      setShowForm(false);
      return true; // Return true to avoid blocking the UI
    }
  };

  // Function to handle when user location is found
  const handleLocationFound = (lat, lng) => {
    setUserLocation({ lat, lng });
  };

  // Function to request user location
  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationFound(latitude, longitude);
          showErrorNotification('Ubicación obtenida exitosamente!', 'info');
        },
        (error) => {
          console.error('Error getting location:', error);
          showErrorNotification('No se pudo obtener la ubicación. Por favor, verifica los permisos.', 'error');
        }
      );
    } else {
      showErrorNotification('La geolocalización no es compatible con este navegador.', 'error');
    }
  };

  // Function to restore initial data
  const handleRestoreInitialData = async () => {
    if (window.confirm('¿Está seguro de que desea restaurar los datos iniciales? Esto eliminará todos los incidentes agregados.')) {
      try {
        // Delete all documents in the collection
        const querySnapshot = await getDocs(collection(db, "accidents"));
        const deletePromises = [];
        
        querySnapshot.forEach((doc) => {
          deletePromises.push(deleteDoc(doc.ref));
        });
        
        await Promise.all(deletePromises);
        
        // Reload data
        await loadAccidentsData();
        showErrorNotification('Datos iniciales restaurados exitosamente.', 'info');
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
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data)) {
            // Add each accident to Firebase
            for (const accident of data) {
              await addAccidentToFirebase(accident);
            }
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
            {/* Database Test Component */}
            <DatabaseTest />
            
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
            
            <RouteTracker setMapView={setMapView} />
            
            <Routes>
              <Route path="/" element={
                <>
                  <MapComponent 
                    sensors={accidents} 
                    userLocation={userLocation}
                    onLocationFound={handleLocationFound}
                    mapView="public"
                  />
                  
                  {/* Floating Buttons */}
                  <div className="floating-buttons">
                    {/* Legend Button - hide in public view */}
                    <button 
                      className={`floating-button legend-button ${showLegend ? 'active' : ''}`}
                      onClick={toggleLegend}
                      title="Mostrar/Ocultar Leyenda"
                      style={{ display: 'none' }} // Hide in public view
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
                    
                    {/* Location Button */}
                    <button 
                      className="floating-button"
                      onClick={requestUserLocation}
                      title="Obtener Mi Ubicación"
                      style={{
                        backgroundColor: '#28a745'
                      }}
                    >
                      <FontAwesomeIcon icon={faLocationArrow} />
                    </button>
                    
                    {/* 🌤️ Botón del clima vista publica  */}
                    <button
                      onClick={() => setMostrarClima(!mostrarClima)}
                      style={{
                        position: 'absolute',
                        top: '170px',
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
                        zIndex: 1001,
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
                    
                    {/* Civil Protection View Button - hide in public view */}
                    <button
                      onClick={() => navigate('/proteccion-civil')}
                      style={{
                        position: 'absolute',
                        top: '230px', // Positioned below weather button
                        right: 0,
                        backgroundColor: '#007bff',
                        color: 'white',
                        borderRadius: '50% 0 0 50%',
                        width: '50px',
                        height: '50px',
                        border: '2px solid #ffffff',
                        fontSize: '0.7em',
                        cursor: 'pointer',
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.4)',
                        zIndex: 1001,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'none', // Hide in public view
                        flexDirection: 'column'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#007bff';
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#007bff';
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.4)';
                      }}
                    >
                      <span style={{fontSize: '1.2em'}}>🛡️</span>
                      <span style={{fontSize: '0.8em'}}>Protección</span>
                    </button>
                  </div>
                  
                  {/* Widget del clima */}
                  {mostrarClima && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '170px',
                        right: '1em',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        zIndex: 1001,
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
                            <p><strong>Entorno:</strong> Firebase Firestore</p>
                            <p><strong>Estado:</strong> Conectado</p>
                            
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
              
              <Route path="/proteccion-civil" element={
                <>
                  <MapComponent 
                    sensors={accidents} 
                    userLocation={userLocation}
                    onLocationFound={handleLocationFound}
                    mapView="civil-protection"
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
                    
                    {/* Location Button */}
                    <button 
                      className="floating-button"
                      onClick={requestUserLocation}
                      title="Obtener Mi Ubicación"
                      style={{
                        backgroundColor: '#28a745'
                      }}
                    >
                      <FontAwesomeIcon icon={faLocationArrow} />
                    </button>
                    
                    {/* 🌤️ Botón del clima */}
                    <button
                      onClick={() => setMostrarClima(!mostrarClima)}
                      style={{
                        position: 'absolute',
                        top: '170px',
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
                        zIndex: 1001,
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
                    
                    {/* View Toggle Buttons - Moved below weather button */}
                    <ViewToggleButtons currentView={mapView} />
                  </div>
                  
                  {/* Widget del clima */}
                  {mostrarClima && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '170px',
                        right: '1em',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        zIndex: 1001,
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
                            <p><strong>Entorno:</strong> Firebase Firestore</p>
                            <p><strong>Estado:</strong> Conectado</p>
                            
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
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;