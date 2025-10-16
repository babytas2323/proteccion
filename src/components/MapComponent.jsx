import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCrosshairs, faLocationArrow,faInfoCircle, faPhone, faMapMarkedAlt, faImage, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import * as turf from '@turf/turf';

// Corrección para los iconos de marcador predeterminados en Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Hook personalizado para actualizar el centro del mapa
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Función para formatear la fecha en español: "10 de octubre de 2025"
const formatDateInSpanish = (dateString) => {
  try {
    if (!dateString) return 'No especificada';
    
    // Nombres de meses en español
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    // Analizar la cadena de fecha directamente para evitar problemas de zona horaria
    // Asumiendo que el formato es AAAA-MM-DD
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // El mes es indexado desde 0
      const day = parseInt(parts[2], 10);
      
      // Validar los valores analizados
      if (year > 0 && month >= 0 && month < 12 && day > 0 && day <= 31) {
        return `${day} de ${months[month]} de ${year}`;
      }
    }
    
    return 'Fecha no válida';
  } catch (error) {
    console.error('Error al formatear la fecha en español:', error);
    return 'Fecha no disponible';
  }
};

// Función para convertir el tiempo de 24 horas a 12 horas con AM/PM
const formatTimeTo12Hour = (timeString) => {
  try {
    if (!timeString) return 'No especificada';
    
    // Dividir la cadena de tiempo (asumiendo el formato es HH:MM)
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      
      // Validar horas y minutos
      if (hours >= 0 && hours <= 23 && minutes && minutes.length === 2) {
        // Determinar AM/PM
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        // Convertir al formato de 12 horas
        hours = hours % 12;
        if (hours === 0) hours = 12; // 0 debe ser 12
        
        return `${hours}:${minutes} ${ampm}`;
      }
    }
    
    // Si el análisis falla, devolver la cadena original
    return timeString || 'No especificada';
  } catch (error) {
    console.error('Error al formatear el tiempo al formato de 12 horas:', error);
    return timeString || 'No especificada';
  }
};

const MapComponent = ({ sensors = [], userLocation, onLocationFound, mapView = 'public' }) => {
  const mapRef = useRef();
  const [mapCenter, setMapCenter] = useState([19.8167, -97.8167]); // Predeterminado a Tetela de Ocampo
  const [mapZoom, setMapZoom] = useState(13);
  const [showRadar, setShowRadar] = useState(true);

  // Función para obtener el icono apropiado basado en el tipo de incidente
  const getIconForIncident = (incident) => {
    // Determinar el icono basado en el tipo de incidente
    const lowerTipo = (incident.tipo || incident.Tipo || 'Otro').toLowerCase();
    
    // Configuración del icono
    let iconType = 'fas fa-exclamation-triangle';
    let iconColor = '#dc3545'; // Color rojo predeterminado
    
    if (lowerTipo.includes('huracán') || lowerTipo.includes('hurricane')) {
      iconType = 'fas fa-hurricane';
      iconColor = 'white'; // Azul
    } else if (lowerTipo.includes('inundacion') || lowerTipo.includes('inundación') || lowerTipo.includes('flood') || lowerTipo.includes('rios desbordados') || lowerTipo.includes('ríos desbordados') || lowerTipo.includes('corrientes fuertes')) {
      iconType = 'fas fa-water';
     iconColor = 'white'; // Cian
    } else if (lowerTipo.includes('derrumbe') || lowerTipo.includes('deslizamiento') || lowerTipo.includes('landslide') || lowerTipo.includes('tierra o laderas') || lowerTipo.includes('puente') || lowerTipo.includes('caminos')) {
      iconType = 'fas fa-mountain';
      iconColor = 'white';// Gris
    } else if (lowerTipo.includes('viento') || lowerTipo.includes('wind') || lowerTipo.includes('fuerte')) {
      iconType = 'fas fa-wind';
    iconColor = 'white'; // Púrpura
    } else if (lowerTipo.includes('fuego') || lowerTipo.includes('fire') || lowerTipo.includes('incendio') || lowerTipo.includes('cortocircuito') || lowerTipo.includes('gas')) {
      iconType = 'fas fa-fire';
     iconColor = 'white'; // Naranja
    } else if (lowerTipo.includes('terremoto') || lowerTipo.includes('earthquake')) {
      iconType = 'fas fa-home';
      iconColor = 'white'; // Verde
    } else if (lowerTipo.includes('lluvia') || lowerTipo.includes('rain')) {
      iconType = 'fas fa-cloud-rain';
     iconColor = 'white'; // Cian
    } else if (lowerTipo.includes('rayo') || lowerTipo.includes('lightning')) {
      iconType = 'fas fa-bolt';
    iconColor = 'white'; // Amarillo
    } else if (lowerTipo.includes('arbol') || lowerTipo.includes('árbol') || lowerTipo.includes('tree')) {
      iconType = 'fas fa-tree';
      iconColor = 'white';; // Verde
    } else if (lowerTipo.includes('techo') || lowerTipo.includes('casa') || lowerTipo.includes('roof') || lowerTipo.includes('house')) {
      iconType = 'fas fa-house-damage';
   iconColor = 'white';// Rojo
    } else if (lowerTipo.includes('poste') || lowerTipo.includes('postes') || lowerTipo.includes('cables') || lowerTipo.includes('electric')) {
      iconType = 'fas fa-bolt';
      iconColor = 'white';// Amarillo
    } else if (lowerTipo.includes('vehiculo') || lowerTipo.includes('vehículo') || lowerTipo.includes('vehicle') || lowerTipo.includes('car')) {
      iconType = 'fas fa-car';
      iconColor = 'white'; // Gris
    } else if (lowerTipo.includes('objeto') || lowerTipo.includes('objetos') || lowerTipo.includes('volador') || lowerTipo.includes('voladores') || lowerTipo.includes('object') || lowerTipo.includes('flying')) {
      iconType = 'fas fa-wind';
      iconColor = 'white'; // Púrpura
    }

    // Determinar el nivel de riesgo para la animación de radar
    const riskLevel = (incident.nivel_riesgo || incident.riskLevel || 'default').toString().toLowerCase();
    let radarClass = 'radar-icon default';
    
    if (riskLevel.includes('bajo') || riskLevel.includes('low')) {
      radarClass = 'radar-icon low';
    } else if (riskLevel.includes('medio') || riskLevel.includes('medium')) {
      radarClass = 'radar-icon medium';
    } else if (riskLevel.includes('alto') || riskLevel.includes('high') || riskLevel.includes('crítico')) {
      radarClass = 'radar-icon high';
    }

    // Crear icono personalizado usando FontAwesome con animación de radar
    const icon = L.divIcon({
      className: 'custom-icon',
      html: `<div class="${radarClass}" style="display: flex; align-items: center; justify-content: center; ">
               <i class="${iconType}" style="color: ${iconColor}; font-size: 14px;"></i>
             </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    return icon;
  };

  // Función para determinar si se debe mostrar un marcador basado en la vista actual
  const shouldShowMarker = (incident) => {
    // Para la vista pública, mostrar todos los incidentes
    if (mapView === 'public') {
      return true;
    }
    
    // Para la vista de protección civil, mostrar todos los incidentes también
    // Puedes agregar lógica de filtrado específica aquí si es necesario
    return true;
  };

  // Función para obtener el contenido del popup basado en la vista
  const getPopupContent = (incident) => {
    // Función para obtener el color del nivel de riesgo
    const getRiskLevelColor = (riskLevel) => {
      const normalizedRiskLevel = riskLevel.toString().toLowerCase();
      if (normalizedRiskLevel.includes('bajo') || normalizedRiskLevel.includes('low')) {
        return '#28a745'; // verde
      } else if (normalizedRiskLevel.includes('medio') || normalizedRiskLevel.includes('medium')) {
        return '#ffc107'; // amarillo
      } else if (normalizedRiskLevel.includes('alto') || normalizedRiskLevel.includes('high') || normalizedRiskLevel.includes('crítico')) {
        return '#dc3545'; // rojo
      }
      return '#6c757d'; // gris predeterminado
    };

    // Función para obtener la insignia del nivel de riesgo
    const getRiskLevelBadge = (riskLevel) => {
      const color = getRiskLevelColor(riskLevel);
      return (
        <span style={{
          backgroundColor: color,
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'inline-block',
          marginTop: '2px'
        }}>
          {riskLevel}
        </span>
      );
    };

    if (mapView === 'public') {
      // Contenido de popup simplificado para la vista pública con estilo mejorado
      return (
        <div style={{ 
          minWidth: '250px', 
          maxWidth: '300px',
          padding: '15px',
          textAlign: 'center',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: '#333', 
            fontSize: '18px',
            borderBottom: '2px solid #eee',
            paddingBottom: '8px'
          }}>
            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '8px', color: '#dc3545' }} />
            {incident.nombre || incident.name || 'Incidente sin nombre'}
          </h3>
          
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Tipo:</strong> 
              <span style={{ color: '#007bff' }}>{incident.tipo || incident.Tipo || 'No especificado'}</span>
            </p>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Fecha:</strong> 
              <span>{formatDateInSpanish(incident.fecha || incident.Fecha)}</span>
            </p>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Riesgo:</strong> 
              <span>{incident.nivel_riesgo || incident.riskLevel || 'No especificado'}</span>
            </p>
          </div>
          
          <div style={{ 
            marginTop: '10px', 
            paddingTop: '10px', 
            borderTop: '1px solid #eee',
            fontSize: '12px',
            color: '#666'
          }}>
            <p style={{ margin: '0' }}>Haz clic para más detalles</p>
          </div>
        </div>
      );
    } else {
      // Contenido de popup detallado para la vista de protección civil con estilo mejorado
      return (
        <div style={{ 
          minWidth: '280px', 
          maxWidth: '350px',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#fff'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: '#333', 
            fontSize: '18px',
            borderBottom: '2px solid #eee',
            paddingBottom: '8px'
          }}>
            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '8px', color: '#dc3545' }} />
            {incident.nombre || incident.name || 'Incidente sin nombre'}
          </h3>
          
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Municipio:</strong> 
              <span style={{ color: '#007bff' }}>{incident.municipio || incident.Municipio || 'No especificado'}</span>
            </p>
          </div>
          
          {/* Localidad */}
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Localidad:</strong> 
              <span>{incident.localidad || 'No especificada'}</span>
            </p>
          </div>
          
          {/* Brigada asignada */}
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Brigada asignada:</strong> 
              <span>{incident.brigada_asignada || 'No asignada'}</span>
            </p>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Tipo:</strong> 
              <span style={{ color: '#007bff' }}>{incident.tipo || incident.Tipo || 'No especificado'}</span>
            </p>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Fecha:</strong> 
              <span>{formatDateInSpanish(incident.fecha || incident.Fecha)}</span>
            </p>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Hora:</strong> 
              <span>{formatTimeTo12Hour(incident.hora || incident.Hora)}</span>
            </p>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Riesgo:</strong> 
              {getRiskLevelBadge(incident.nivel_riesgo || incident.riskLevel || 'No especificado')}
            </p>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Afectados:</strong> 
              <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{incident.afectados || incident.Afectados || 'No especificado'}</span>
            </p>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Teléfono:</strong> 
              <span style={{ color: '#007bff' }}>{incident.telefono || 'No especificado'}</span>
            </p>
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              <strong>Descripción:</strong>
            </p>
            <p style={{ 
              margin: '5px 0', 
              fontSize: '13px', 
              color: '#555',
              fontStyle: 'italic',
              backgroundColor: '#f8f9fa',
              padding: '8px',
              borderRadius: '4px',
              borderLeft: '3px solid #007bff'
            }}>
              {incident.descripcion || incident.Descripcion || 'No disponible'}
            </p>
          </div>
          
          {/* Imagen del incidente */}
          {incident.imageUrl && (
            <div style={{ marginBottom: '8px', textAlign: 'center' }}>
              <button
                onClick={() => {
                  // Alternar visibilidad de la imagen
                  const imgElement = document.getElementById(`incident-image-${incident.id || Math.random()}`);
                  if (imgElement) {
                    if (imgElement.style.display === 'none') {
                      imgElement.style.display = 'block';
                    } else {
                      imgElement.style.display = 'none';
                    }
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  margin: '0 5px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5a6268';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6c757d';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <FontAwesomeIcon icon={faImage} />
              </button>
              <p style={{ margin: '5px 0', fontSize: '14px', display: 'inline-block' }}>
                <strong>Imagen del incidente</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <img 
                  id={`incident-image-${incident.id || Math.random()}`}
                  src={incident.imageUrl} 
                  alt="Imagen del incidente" 
                  style={{ 
                    display: 'none', // Ocultar inicialmente
                    maxWidth: '100%', 
                    maxHeight: '200px', 
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    marginTop: '10px',
                    margin: '10px auto 0'
                  }} 
                />
              </div>
            </div>
          )}
          
          {/* Marca de tiempo */}
          <div style={{ 
            marginTop: '10px', 
            paddingTop: '10px', 
            borderTop: '1px solid #eee',
            fontSize: '11px',
            color: '#888',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Botón de llamada */}
              {incident.telefono && incident.telefono !== 'No especificado' && (
                <a 
                  href={`tel:${incident.telefono}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#007bff',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#0056b3';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#007bff';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <FontAwesomeIcon icon={faPhone} />
                </a>
              )}
              
              {/* Botón de WhatsApp */}
              {incident.telefono && incident.telefono !== 'No especificado' && (
                <a 
                  href={`https://wa.me/${incident.telefono.replace(/\D/g, '')}?text=Estamos%20revisando%20su%20reporte.%20En%20un%20momento%20lo%20atendemos.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#25D366',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#128C7E';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#25D366';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                </a>
              )}
              
              {/* Botón de Google Maps */}
              {incident.coordenadas && Array.isArray(incident.coordenadas) && incident.coordenadas.length >= 2 && (
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${incident.coordenadas[1]},${incident.coordenadas[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#4285F4',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#3367D6';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#4285F4';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <FontAwesomeIcon icon={faMapMarkedAlt} />
                </a>
              )}
            </div>
            
            {/* Marca de tiempo del reporte */}
            <p style={{ margin: '0', textAlign: 'right' }}>
              Reporte: {new Date().toLocaleString('es-MX')}
            </p>
          </div>
        </div>
      );
    }
  };

  // Agregar este useEffect para asegurar que el mapa se vuelva a renderizar cuando los sensores cambien
  useEffect(() => {
    // Este efecto se ejecutará cada vez que la propiedad sensors cambie
    // No necesita hacer nada, pero su presencia asegura
    // que el componente se vuelva a renderizar con nuevos datos de sensores
  }, [sensors]);

  // Efecto para actualizar el centro del mapa cuando la ubicación del usuario cambia
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(15);
    }
  }, [userLocation]);

  // Efecto para manejar la búsqueda de ubicación - SE ELIMINÓ la solicitud automática de geolocalización
  // La geolocalización ahora es manejada por el botón en App.jsx
  useEffect(() => {
    // Se eliminó la solicitud automática de geolocalización
    // Este efecto ahora solo se usa para responder a los cambios de userLocation
  }, [onLocationFound]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={true}
        attributionControl={true}
      >
        <ChangeView center={mapCenter} zoom={mapZoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Marcador de Ubicación del Usuario */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'custom-icon',
              html: `<div class="radar-icon default" style="display: flex; align-items: center; justify-content: center;">
                       <i class="fa-solid fa-location-arrow" style="color:rgb(255, 255, 255); font-size: 14px;"></i>
                     </div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],

             })}
          >
            <Popup>
              <div style={{ 
                textAlign: 'center',
                minWidth: '180px',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <FontAwesomeIcon icon={faCrosshairs} style={{ fontSize: '24px', color: '#007bff', marginBottom: '5px' }} />
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '16px' }}>Tu ubicación</p>
                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                  Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de Incidentes */}
        {sensors && Array.isArray(sensors) ? sensors.map((point, index) => {
          try {
            // Saltar si el marcador no debe mostrarse basado en la vista
            if (!shouldShowMarker(point)) {
              return null;
            }
            
            // Obtener coordenadas con mejor validación
            let lat, lng;
            if (point && point.coordenadas && Array.isArray(point.coordenadas) && point.coordenadas.length >= 2) {
              lat = point.coordenadas[1];
              lng = point.coordenadas[0];
            } else if (point) {
              lat = point.latitude || point.Latitud;
              lng = point.longitude || point.Longitud;
            }
            
            // Saltar si las coordenadas son inválidas
            if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
              return null;
            }
            
            // Obtener el icono apropiado
            const icon = getIconForIncident(point);
            
            return (
              <Marker 
                key={index} 
                position={[lat, lng]} 
                icon={icon}
              >
                <Popup>
                  {getPopupContent(point)}
                </Popup>
              </Marker>
            );
          } catch (error) {
            console.error('Error procesando marcador:', error, point);
            return null; // Saltar este marcador si hay un error
          }
        }) : null}
      </MapContainer>
      
      {/* Indicador de Vista */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50px',
        backgroundColor: mapView === 'public' ? '#28a745' : '#007bff',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        {mapView === 'public' ? 'Vista Pública' : 'Vista Protección Civil'}
      </div>
    </div>
  );
};

export default MapComponent;