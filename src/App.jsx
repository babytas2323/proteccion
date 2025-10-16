import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faPlus, faTimes, faDownload, faUpload, faImage, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import MapComponent from './components/MapComponent';
import SensorForm from './components/SensorForm';
import ErrorBoundary from './components/ErrorBoundary';

import { formatErrorMessage, logError, showErrorNotification, handleApiError } from './utils/errorHandler';



// Importar Firebase
import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

import './App.css';

// Importar librería xlsx para exportar a Excel
import * as XLSX from 'xlsx';

// Importar datos iniciales como respaldo
import initialAccidentsData from './data/accidents.json';

// Componente para rastrear cambios de ruta y actualizar el estado mapView
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

// Componente para botones de cambio de vista
const ViewToggleButtons = ({ currentView }) => {
  const navigate = useNavigate();
  
 
};

function App() {
  const [accidents, setAccidents] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showLegend, setShowLegend] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [mapView, setMapView] = useState('public'); // 'public' o 'civil-protection'

  const [mostrarClima, setMostrarClima] = useState(false); // Estado para el widget del clima
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDebug, setShowDebug] = useState(false); // Para depurar cargas de imágenes

  // Función para obtener el nivel de riesgo de los datos del accidente
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

  // Función para contar accidentes por nivel de riesgo
  const countAccidentsByRiskLevel = () => {
    const counts = { low: 0, medium: 0, high: 0 };
    
    accidents.forEach(accident => {
      const riskLevel = getRiskLevel(accident);
      counts[riskLevel]++;
    });
    
    return counts;
  };

  // Función para contar accidentes por tipo
  const getIncidentTypeCounts = () => {
    const typeCounts = {};
    
    accidents.forEach(accident => {
      const type = accident.tipo || 'No especificado';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    // Convertir a array de elementos para mostrar
    return Object.entries(typeCounts).map(([type, count]) => (
      <p key={type}><strong>{type}:</strong> {count} incidentes</p>
    ));
  };

  // Cargar datos de accidentes desde Firebase
  const loadAccidentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando accidentes desde Firebase');
      const q = query(collection(db, "accidents"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const accidentsData = [];
      
      querySnapshot.forEach((doc) => {
        accidentsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('Datos de accidentes cargados:', accidentsData);
      setAccidents(accidentsData);
    } catch (error) {
      console.error('Error al cargar datos de accidentes:', error);
      logError('Cargando datos de accidentes', error);
      // Proporcionar información de error más detallada
      const errorMessage = error.message || 'Error al cargar datos.';
      const errorCode = error.code ? ` (Código: ${error.code})` : '';
      setError(`${errorMessage}${errorCode}`);
      // Usar datos locales en caso de error
      setAccidents(initialAccidentsData);
      showErrorNotification(`Error al cargar datos. Usando datos locales. ${errorMessage}${errorCode}`, 'warning');
    } finally {
      setLoading(false);
    }
  };

  // Agregar accidente a Firebase
  const addAccidentToFirebase = async (accidentData) => {
    try {
      console.log('Agregando accidente a Firebase:', accidentData);
      
      // Agregar marca de tiempo
      const accidentWithTimestamp = {
        ...accidentData,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, "accidents"), accidentWithTimestamp);
      
      // Agregar al estado local
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
      console.error('Error al agregar accidente:', error);
      logError('Agregando accidente', error);
      // Proporcionar información de error más detallada
      const errorMessage = error.message || 'Error al agregar el incidente.';
      const errorCode = error.code ? ` (Código: ${error.code})` : '';
      showErrorNotification(`${errorMessage}${errorCode}`, 'error');
      return false;
    }
  };

  // Cargar datos de accidentes cuando el componente se monta
  useEffect(() => {
    loadAccidentsData();
  }, []);

  const handleAddAccident = async (newAccident, imageFile) => {
    try {
      console.log('Intentando guardar accidente:', newAccident);
      console.log('Archivo de imagen recibido:', imageFile);
      
      // Si hay una imagen, cargarla a Cloudinary directamente
      if (imageFile) {
        try {
          console.log('Iniciando carga de imagen a Cloudinary...');
          
          // Registrar detalles del archivo de imagen
          console.log('Detalles de la imagen:', {
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type
          });
          
          // Crear FormData para la carga a Cloudinary
          const formData = new FormData();
          formData.append('file', imageFile);
          formData.append('upload_preset', 'accident_reports_preset');
          formData.append('folder', 'accident_reports');
          
          console.log('Datos de carga a Cloudinary:', {
            cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
            fileName: imageFile.name,
            fileSize: imageFile.size,
            fileType: imageFile.type
          });
          
          // Cargar imagen directamente a Cloudinary usando carga sin firma con preset
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: formData
            }
          );
          
          console.log('Estado de respuesta de Cloudinary:', response.status);
          console.log('Encabezados de respuesta de Cloudinary:', [...response.headers.entries()]);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Respuesta de error de Cloudinary:', errorText);
            throw new Error(`Error al cargar imagen: ${response.status} ${response.statusText} - ${errorText}`);
          }
          
          const result = await response.json();
          console.log('Imagen cargada a Cloudinary:', result);
          
          // Agregar URL de imagen a los datos del accidente
          newAccident.imageUrl = result.secure_url;
          newAccident.imagePublicId = result.public_id;
        } catch (uploadError) {
          console.error('Error al cargar imagen a Cloudinary:', uploadError);
          // Verificar si es un error de conexión
          if (uploadError instanceof TypeError && uploadError.message.includes('fetch')) {
            showErrorNotification('Error de conexión al subir la imagen. Verifique su conexión a internet.', 'error');
          } else {
            showErrorNotification(`Error al cargar la imagen: ${uploadError.message}`, 'error');
          }
          // Continuar sin imagen si la carga falla
        }
      } else {
        console.log('No se proporcionó archivo de imagen');
      }
      
      // Guardar datos del accidente en Firebase
      console.log('Guardando datos del accidente en Firebase:', newAccident);
      return await addAccidentToFirebase(newAccident);
    } catch (error) {
      logError('Agregando accidente', error);
      console.log('Error al agregar accidente:', formatErrorMessage(error));
      setShowForm(false);
      showErrorNotification('Error al agregar el incidente.', 'error');
      return false;
    }
  };

  // Función para manejar cuando se encuentra la ubicación del usuario
  const handleLocationFound = (lat, lng) => {
    setUserLocation({ lat, lng });
  };

  // Función para solicitar la ubicación del usuario
  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationFound(latitude, longitude);
          showErrorNotification('Ubicación obtenida exitosamente!', 'info');
        },
        (error) => {
          console.error('Error al obtener ubicación:', error);
          showErrorNotification('No se pudo obtener la ubicación. Por favor, verifica los permisos.', 'error');
        }
      );
    } else {
      showErrorNotification('La geolocalización no es compatible con este navegador.', 'error');
    }
  };



  // Función de depuración para carga de imágenes en el navegador
  const debugImageUploadInBrowser = async () => {
    const outputDiv = document.getElementById('debug-output');
    if (!outputDiv) return;
    
    outputDiv.innerHTML = 'Iniciando prueba de depuración...\\n';
    
    try {
      outputDiv.innerHTML += '1. Verificando variables de entorno...\\n';
      outputDiv.innerHTML += `   Nombre de Cloud: ${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}\\n`;
      outputDiv.innerHTML += `   La clave API existe: ${!!import.meta.env.VITE_CLOUDINARY_API_KEY}\\n`;
      
      if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) {
        outputDiv.innerHTML += '   ❌ ERROR: VITE_CLOUDINARY_CLOUD_NAME está faltando\\n';
        return;
      }
      
      outputDiv.innerHTML += '   ✅ Variables de entorno presentes\\n\\n';
      
      // Crear imagen de prueba (GIF de 1x1 píxel)
      outputDiv.innerHTML += '2. Creando imagen de prueba...\\n';
      const testImageData = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const binary = atob(testImageData);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      const testImageBlob = new Blob([new Uint8Array(array)], { type: 'image/gif' });
      outputDiv.innerHTML += '   ✅ Imagen de prueba creada\\n\\n';
      
      // Probar carga con preset
      outputDiv.innerHTML += '3. Probando carga con preset...\\n';
      const formData = new FormData();
      formData.append('file', testImageBlob, 'browser-debug-test.gif');
      formData.append('upload_preset', 'accident_reports_preset');
      formData.append('folder', 'accident_reports');
      
      outputDiv.innerHTML += '   Enviando solicitud a Cloudinary...\\n';
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      outputDiv.innerHTML += `   Estado de respuesta: ${response.status}\\n`;
      outputDiv.innerHTML += `   Encabezados: ${[...response.headers.entries()].map(([k, v]) => `\\n     ${k}: ${v}`).join('')}\\n`;
      
      if (response.ok) {
        const result = await response.json();
        outputDiv.innerHTML += '   ✅ Carga con preset exitosa!\\n';
        outputDiv.innerHTML += `   URL de imagen: ${result.secure_url}\\n`;
        outputDiv.innerHTML += `   ID público: ${result.public_id}\\n`;
      } else {
        const errorText = await response.text();
        outputDiv.innerHTML += `   ❌ Carga con preset fallida: ${errorText}\\n`;
      }
      
      outputDiv.innerHTML += '\\n=== Prueba de depuración completada ===\\n';
      
    } catch (error) {
      outputDiv.innerHTML += `\\n❌ Error en la prueba de depuración: ${error.message}\\n`;
      console.error('Error en depuración del navegador:', error);
    }
  };

  // Función para restaurar datos iniciales
  const handleRestoreInitialData = async () => {
    if (window.confirm('¿Está seguro de que desea restaurar los datos iniciales? Esto eliminará todos los incidentes agregados.')) {
      try {
        // Eliminar todos los documentos en la colección
        const querySnapshot = await getDocs(collection(db, "accidents"));
        const deletePromises = [];
        
        querySnapshot.forEach((doc) => {
          deletePromises.push(deleteDoc(doc.ref));
        });
        
        await Promise.all(deletePromises);
        
        // Recargar datos
        await loadAccidentsData();
        showErrorNotification('Datos iniciales restaurados exitosamente.', 'info');
      } catch (error) {
        logError('Restaurando datos iniciales', error);
        showErrorNotification('Error al restaurar los datos iniciales.');
      }
    }
  };

  // Exportar datos a archivo
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
      logError('Exportando datos', error);
      showErrorNotification('Error al exportar datos.');
    }
  };

  // Exportar datos a Excel
  const handleExportToExcel = () => {
    try {
      // Preparar datos para exportar a Excel
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

      // Crear hoja de cálculo
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Incidentes');
      
      // Exportar a archivo Excel
      const exportFileName = `tetela-accidents-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, exportFileName);
      
      showErrorNotification('Datos exportados a Excel exitosamente!', 'info');
    } catch (error) {
      logError('Exportando a Excel', error);
      showErrorNotification('Error al exportar datos a Excel.');
    }
  };

  // Importar datos desde archivo
  const handleImportData = (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (Array.isArray(data)) {
            // Agregar cada accidente a Firebase
            for (const accident of data) {
              await addAccidentToFirebase(accident);
            }
            showErrorNotification('Datos importados exitosamente!', 'info');
          } else {
            showErrorNotification('Formato de archivo inválido. Debe ser un arreglo JSON.');
          }
        } catch (error) {
          logError('Analizando archivo importado', error);
          showErrorNotification('Error al importar el archivo. Asegúrese de que sea un archivo JSON válido.');
        }
      };
      reader.readAsText(file);
      
      // Restablecer entrada de archivo
      event.target.value = '';
    } catch (error) {
      logError('Importando datos', error);
      showErrorNotification('Error al importar datos.');
    }
  };

  // Alternar visibilidad de la leyenda
  const toggleLegend = () => {
    setShowLegend(!showLegend);
    if (!showLegend) {
      setShowForm(false); // Cerrar formulario al abrir leyenda
    }
  };

  // Alternar visibilidad del formulario
  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      setShowLegend(false); // Cerrar leyenda al abrir formulario
    }
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <header className="app-header">
            <h1>Sistema de Detección de Riesgos - Tetela de Ocampo</h1>
            <button 
              onClick={() => setShowDebug(!showDebug)}
              style={{
               display: 'none', // 👈 esto lo oculta totalmente el boton 
                position: 'absolute',
                right: '10px',
                top: '10px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 10px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {showDebug ? 'Cerrar Debug' : 'Debug Image Upload'}
            </button>
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
            
            {showDebug && (
              <div style={{
                position: 'fixed',
                top: '50px',
                right: '10px',
                backgroundColor: 'white',
                border: '2px solid #007bff',
                borderRadius: '8px',
                padding: '15px',
                zIndex: 9998,
                maxWidth: '400px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <h3 style={{ margin: 0, color: '#007bff' }}>Debug Image Upload</h3>
                  <button 
                    onClick={() => setShowDebug(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      color: '#777'
                    }}
                  >
                    ×
                  </button>
                </div>
                <p>Presiona el botón para ejecutar la prueba de carga de imagen:</p>
                <button 
                  onClick={debugImageUploadInBrowser}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Ejecutar Prueba de Carga
                </button>
                <div id="debug-output" style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap'
                }}>
                  Los resultados de la prueba aparecerán aquí...
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
                  
                  {/* Botones Flotantes */}
                  <div className="floating-buttons">
                    {/* Botón de Leyenda - ocultar en vista pública */}
                    <button 
                      className={`floating-button legend-button ${showLegend ? 'active' : ''}`}
                      onClick={toggleLegend}
                      title="Mostrar/Ocultar Leyenda"
                      style={{ display: 'none' }} // Ocultar en vista pública
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
                    
                    {/* Botón de Ubicación */}
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
                        width: '40px',
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
                    
                    {/* Botón de Vista de Protección Civil - ocultar en vista pública */}
                    <button
                      onClick={() => navigate('/proteccion-civil')}
                      style={{
                        position: 'absolute',
                        top: '230px', // Posicionado debajo del botón del clima
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
                        display: 'none', // Ocultar en vista pública
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
                  
                  {/* Panel de Leyenda */}
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
                          
                          {/* Conteo de tipos de incidentes */}
                          <div className="incident-type-counts">
                            <h4>Clasificación de Incidentes por Tipo:</h4>
                            {getIncidentTypeCounts()}
                          </div>
                          
                          {/* Botones de Gestión de Datos */}
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
                            {/*
                            <button 
                              onClick={handleRestoreInitialData} 
                              className="restore-button"
                              style={{ backgroundColor: '#dc3545' }}
                            >
                              Restaurar Datos Iniciales
                            </button>*/}
                          </div>
                          
                          {/* Información del Entorno */}
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
                  
                  {/* Panel de Formulario */}
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
                  
                  {/* Botones Flotantes */}
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
                    
                    {/* Botón de Ubicación */}
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
                        top: '180px',
                        right: 0,
                        backgroundColor: '#4285f4',
                        color: 'white',
                        borderRadius: '50% 0 0 50%',
                        width: '40px',
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
                    
                    {/* Botones de Cambio de Vista - Movido debajo del botón del clima */}
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
                  
                  {/* Panel de Leyenda */}
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
                          
                          {/* Conteo de tipos de incidentes */}
                          <div className="incident-type-counts">
                            <h4>Clasificación de Incidentes por Tipo:</h4>
                            {getIncidentTypeCounts()}
                          </div>
                          
                          {/* Botones de Gestión de Datos */}
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
                                {/* 
                            <button 
                              onClick={handleRestoreInitialData} 
                              className="restore-button"
                              style={{ backgroundColor: '#dc3545' }}
                            >
                              Restaurar Datos Iniciales
                            </button>     
                            OCULTAR BOTONES DE RESTAURACION DE DATOS
                            */}
                          </div>
                          
                          {/* Información del Entorno */}
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
                  
                  {/* Panel de Formulario */}
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