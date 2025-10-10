import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faLocationArrow, 
  faExclamationTriangle, 
  faWater, 
  faTint, 
  faHurricane,
  faFire,
  faWind,
  faHome,
  faMountain,
  faCloudRain,
  faBolt,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { showErrorNotification } from '../utils/errorHandler';
import 'leaflet/dist/leaflet.css';

// Add the icons to the library
library.add(
  faLocationArrow, 
  faExclamationTriangle, 
  faWater, 
  faTint, 
  faHurricane,
  faFire,
  faWind,
  faHome,
  faMountain,
  faCloudRain,
  faBolt,
  faImage
);

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Geolocation Control Component
const LocationControl = ({ onLocationFound }) => {
  const map = useMap();

  const handleClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 16);
          onLocationFound(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          showErrorNotification('No se pudo obtener la ubicación. Por favor, asegúrate de permitir el acceso a la ubicación.', 'warning');
        }
      );
    } else {
      showErrorNotification('La geolocalización no es compatible con este navegador.', 'warning');
    }
  };

  useEffect(() => {
    // Add custom control button to the map
    const LocationButton = L.Control.extend({
      onAdd: function() {
        const btn = L.DomUtil.create('button');
        
        // Create the Font Awesome icon using innerHTML
        btn.innerHTML = '<i class="fas fa-location-arrow" style="color: #333; font-size: 16px;"></i>';
        
        btn.className = 'leaflet-bar leaflet-control leaflet-control-custom';
        btn.style.backgroundColor = 'white';
        btn.style.width = '30px';
        btn.style.height = '30px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
        btn.style.borderRadius = '4px';
        btn.title = 'Mi ubicación';
        btn.onclick = handleClick;
        return btn;
      },
      onRemove: function() {}
    });

    const locationControl = new LocationButton({ position: 'topleft' });
    locationControl.addTo(map);

    return () => {
      locationControl.remove();
    };
  }, [map, handleClick]);

  return null;
};

const MapComponent = ({ sensors, userLocation, onLocationFound }) => {
  // Debug: Log the sensors data
  useEffect(() => {
    console.log('Sensors data received:', sensors);
  }, [sensors]);

  // Function to get marker color based on risk level (used in popup)
  const getMarkerColor = (riskLevel) => {
    // Normalize risk level values
    const normalizedRiskLevel = riskLevel ? riskLevel.toString().toLowerCase() : 'low';
    let level = normalizedRiskLevel;
    if (normalizedRiskLevel.includes('bajo') || normalizedRiskLevel.includes('low')) {
      level = 'low';
    } else if (normalizedRiskLevel.includes('medio') || normalizedRiskLevel.includes('medium')) {
      level = 'medium';
    } else if (normalizedRiskLevel.includes('alto') || normalizedRiskLevel.includes('high') || normalizedRiskLevel.includes('crítico')) {
      level = 'high';
    }
    
    switch (level) {
      case 'low': return '#28a745'; // green
      case 'medium': return '#ffc107'; // yellow
      case 'high': return '#dc3545'; // red
      default: return '#007bff'; // blue
    }
  };

  // Function to get risk level text
  const getRiskLevelText = (riskLevel) => {
    // Normalize risk level values
    const normalizedRiskLevel = riskLevel ? riskLevel.toString().toLowerCase() : 'low';
    let level = normalizedRiskLevel;
    if (normalizedRiskLevel.includes('bajo') || normalizedRiskLevel.includes('low')) {
      level = 'low';
    } else if (normalizedRiskLevel.includes('medio') || normalizedRiskLevel.includes('medium')) {
      level = 'medium';
    } else if (normalizedRiskLevel.includes('alto') || normalizedRiskLevel.includes('high') || normalizedRiskLevel.includes('crítico')) {
      level = 'high';
    }
    
    switch (level) {
      case 'low': return 'BAJO';
      case 'medium': return 'MEDIO';
      case 'high': return 'ALTO';
      default: return 'BAJO';
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    try {
      // Create a new Date object from the date string
      const date = new Date(dateString);
      
      // Format the date as DD/MM/YYYY HH:MM
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  // Function to convert 24-hour time to 12-hour time with AM/PM
  const formatTime = (timeString) => {
    try {
      if (!timeString) return 'No especificada';
      
      // Split the time string into hours and minutes
      const [hours, minutes] = timeString.split(':');
      
      // Convert to integers
      let hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      // Determine AM/PM
      const ampm = hour >= 12 ? 'PM' : 'AM';
      
      // Convert hour to 12-hour format
      hour = hour % 12;
      hour = hour ? hour : 12; // 0 should be 12
      
      // Add leading zeros if needed
      const formattedHour = String(hour).padStart(2, '0');
      const formattedMinute = String(minute).padStart(2, '0');
      
      return `${formattedHour}:${formattedMinute} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Hora no disponible';
    }
  };

  // Function to format date in Spanish: "10 de octubre de 2025"
  const formatDateInSpanish = (dateString) => {
    try {
      if (!dateString) return 'No especificada';
      
      // Spanish month names
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      
      // Parse the date string directly to avoid timezone issues
      // Assuming the format is YYYY-MM-DD
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const day = parseInt(parts[2], 10);
        
        // Validate the parsed values
        if (year > 0 && month >= 0 && month < 12 && day > 0 && day <= 31) {
          return `${day} de ${months[month]} de ${year}`;
        }
      }
      
      return 'Fecha no válida';
    } catch (error) {
      console.error('Error formatting date in Spanish:', error);
      return 'Fecha no disponible';
    }
  };

  // Function to get image path based on environment and image type
  const getImagePath = (imgPath) => {
    try {
      // If it's already an absolute URL or Base64 data URL, return as is
      if (imgPath.startsWith('http') || imgPath.startsWith('data:')) {
        return imgPath;
      }
      
      // For relative paths, we need to handle them correctly
      // Remove leading slash if present
      let cleanPath = imgPath;
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
      }
      
      // For Vercel deployment, images should be in the root or images directory
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Try different possible paths for Vercel deployment
        return cleanPath;
      }
      
      // For local development, keep the original path
      return imgPath;
    } catch (error) {
      console.error('Error processing image path:', error);
      showErrorNotification('Error al procesar la imagen.');
      return '';
    }
  };

  return (
    <MapContainer center={[19.8116, -97.8096]} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Location Control */}
      <LocationControl onLocationFound={onLocationFound} />
      
      {/* User Location Marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>
            <div style={{ fontFamily: 'Arial, sans-serif' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>📍 Tu ubicación actual</h3>
              <p><strong>Latitud:</strong> {userLocation.lat.toFixed(6)}</p>
              <p><strong>Longitud:</strong> {userLocation.lng.toFixed(6)}</p>
            </div>
          </Popup>
        </Marker>
      )}
      
      {/* Accidents Markers with FontAwesome Icons */}
      {sensors && sensors.map((point, index) => {
        // Debug: Log each point
        console.log('Processing point:', point);
        
        // Handle coordinate structure for accidents
        let position;
        if (point.coordenadas && Array.isArray(point.coordenadas) && point.coordenadas.length === 2) {
          // For accidents: [longitude, latitude] -> [latitude, longitude]
          position = [point.coordenadas[1], point.coordenadas[0]];
          console.log('Position for point:', position);
        } else {
          // Skip points with invalid coordinates
          console.warn('Invalid coordinates for point:', point);
          return null;
        }
        
        // Get the name, handling different possible property names
        const name = point.nombre || point.name || 'Incidente sin nombre';
        
        // Create a custom getMarkerIcon function that has access to point data
        const getPointMarkerIcon = () => {
          // Create a custom div icon with FontAwesome
          let iconClass, color, iconType;
          
          // Normalize risk level values
          const normalizedRiskLevel = point.nivel_riesgo || point.riskLevel ? (point.nivel_riesgo || point.riskLevel).toString().toLowerCase() : 'low';
          let level = normalizedRiskLevel;
          if (normalizedRiskLevel.includes('bajo') || normalizedRiskLevel.includes('low')) {
            level = 'low';
          } else if (normalizedRiskLevel.includes('medio') || normalizedRiskLevel.includes('medium')) {
            level = 'medium';
          } else if (normalizedRiskLevel.includes('alto') || normalizedRiskLevel.includes('high') || normalizedRiskLevel.includes('crítico')) {
            level = 'high';
          }
          
          switch (level) {
            case 'low':
              iconClass = 'low';
              color = '#28a745'; // green
              break;
            case 'medium':
              iconClass = 'medium';
              color = '#ffc107'; // yellow
              break;
            case 'high':
              iconClass = 'high'; 
              color = '#dc3545'; // red
              break;
            default:
              iconClass = 'default';
              color = '#007bff'; // blue
          }
          
          // Set icon based on type and incident type
          if (point.type === 'accident' || point.tipo) {
            // Determine icon based on incident type
            const lowerTipo = (point.tipo || point.Tipo || 'Otro').toLowerCase();
            if (lowerTipo.includes('huracán') || lowerTipo.includes('hurricane')) {
              iconType = 'fas fa-hurricane';
            } else if (lowerTipo.includes('inundacion') || lowerTipo.includes('inundación') || lowerTipo.includes('flood') || lowerTipo.includes('rios desbordados') || lowerTipo.includes('ríos desbordados') || lowerTipo.includes('corrientes fuertes')) {
              iconType = 'fas fa-water'; // Using water icon for floods and river overflows
            } else if (lowerTipo.includes('derrumbe') || lowerTipo.includes('deslizamiento') || lowerTipo.includes('landslide') || lowerTipo.includes('tierra o laderas') || lowerTipo.includes('puente') || lowerTipo.includes('caminos')) {
              iconType = 'fas fa-mountain'; // Mountain icon for landslides and bridge collapses
            } else if (lowerTipo.includes('viento') || lowerTipo.includes('wind') || lowerTipo.includes('fuerte')) {
              iconType = 'fas fa-wind';
            } else if (lowerTipo.includes('fuego') || lowerTipo.includes('fire') || lowerTipo.includes('incendio') || lowerTipo.includes('cortocircuito') || lowerTipo.includes('gas')) {
              iconType = 'fas fa-fire';
            } else if (lowerTipo.includes('terremoto') || lowerTipo.includes('earthquake')) {
              iconType = 'fas fa-home'; // Using home icon for earthquakes
            } else if (lowerTipo.includes('lluvia') || lowerTipo.includes('rain')) {
              iconType = 'fas fa-cloud-rain';
            } else if (lowerTipo.includes('rayo') || lowerTipo.includes('lightning')) {
              iconType = 'fas fa-bolt';
            } else if (lowerTipo.includes('arbol') || lowerTipo.includes('árbol') || lowerTipo.includes('tree')) {
              iconType = 'fas fa-tree'; // Tree icon for fallen trees
            } else if (lowerTipo.includes('techo') || lowerTipo.includes('casa') || lowerTipo.includes('roof') || lowerTipo.includes('house')) {
              iconType = 'fas fa-house-damage'; // House damage icon for fallen roofs
            } else if (lowerTipo.includes('poste') || lowerTipo.includes('postes') || lowerTipo.includes('cables') || lowerTipo.includes('electric')) {
              iconType = 'fas fa-bolt'; // Bolt icon for fallen electrical posts
            } else if (lowerTipo.includes('vehiculo') || lowerTipo.includes('vehículo') || lowerTipo.includes('vehicle') || lowerTipo.includes('car')) {
              iconType = 'fas fa-car'; // Car icon for vehicles dragged by water
            } else if (lowerTipo.includes('objeto') || lowerTipo.includes('objetos') || lowerTipo.includes('volador') || lowerTipo.includes('voladores') || lowerTipo.includes('object') || lowerTipo.includes('flying')) {
              iconType = 'fas fa-wind'; // Wind icon for flying objects
            } else {
              iconType = 'fas fa-exclamation-triangle';
            }
          } else {
            // For sensors, use different icons based on risk level
            switch (level) {
              case 'low':
                iconType = 'fas fa-tint';
                break;
              case 'medium':
                iconType = 'fas fa-water';
                break;
              case 'high':
                iconType = 'fas fa-exclamation-triangle';
                break;
              default:
                iconType = 'fas fa-tint';
            }
          }
          
          // Determine the correct animation name
          let animationName;
          switch (level) {
            case 'low':
              animationName = 'pulse-green';
              break;
            case 'medium':
              animationName = 'pulse-yellow';
              break;
            case 'high':
              animationName = 'pulse-red';
              break;
            default:
              animationName = 'pulse-blue';
          }
          
          // Create the icon HTML
          const iconHtml = `
            <div class="radar-icon ${iconClass}" style="
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: ${color};
              border-radius: 50%;
              box-shadow: 0 0 0 0 rgba(31, 47, 47, 0.4);
              animation: ${animationName} 2s infinite;
            ">
              <i class="${iconType}" style="color: white; font-size: 12px;"></i>
            </div>
          `;
          
          console.log('Icon HTML:', iconHtml);
          
          return L.divIcon({
            className: 'custom-icon',
            html: iconHtml,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
        };
        
        return (
          <Marker
            key={point.id || index}
            position={position}
            icon={getPointMarkerIcon()}
          >
            <Popup>
              <div style={{ 
                minWidth: '250px',
                maxWidth: '300px',
                fontFamily: 'Arial, sans-serif'
              }}>
                <h3 style={{ 
                  margin: '0 0 10px 0', 
                  color: '#333',
                  borderBottom: '2px solid #eee',
                  paddingBottom: '5px'
                }}>
                  {name}
                </h3>
                
                <div style={{ marginBottom: '8px' }}>
                  <strong>Municipio:</strong> {point.municipio || point.Municipio || 'No especificado'}
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <strong>Tipo:</strong> 
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: '#007bff',
                    marginLeft: '5px'
                  }}>
                    {point.tipo || point.Tipo || 'No especificado'}
                  </span>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <strong>Fecha:</strong> {formatDateInSpanish(point.fecha)}
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <strong>Hora:</strong> {point.hora ? formatTime(point.hora) : 'No especificada'}
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <strong>Personas afectadas:</strong> 
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: '#dc3545',
                    marginLeft: '5px'
                  }}>
                    {point.afectados || point.Afectados || 0}
                  </span>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <strong>Riesgo:</strong>
                  <span style={{
                    fontWeight: 'bold',
                    color: getMarkerColor(point.nivel_riesgo || point.riskLevel),
                    marginLeft: '5px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: `${getMarkerColor(point.nivel_riesgo || point.riskLevel)}20`
                  }}>
                    {getRiskLevelText(point.nivel_riesgo || point.riskLevel)}
                  </span>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <strong>Descripción:</strong>
                  <p style={{ 
                    margin: '5px 0 0 0', 
                    fontStyle: 'italic',
                    fontSize: '14px'
                  }}>
                    {point.descripcion || point.Descripcion || 'Sin descripción'}
                  </p>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <strong>Brigada asignada:</strong> {point.brigada_asignada || point.Brigada_asignada || 'No asignada'}
                </div>
                
                {/* Display images if available */}
                {(point.imagenes || point.Imagenes || point.imagePath || point.image) && (
                  <div style={{ 
                    marginTop: '10px',
                    borderTop: '1px solid #eee',
                    paddingTop: '10px'
                  }}>
                    {/* Display single image if image (base64) exists */}
                    {point.image && (
                      <div>
                        <FontAwesomeIcon icon={faImage} style={{ marginRight: '5px' }} />
                        <strong>Imagen del incidente:</strong>
                        <img 
                          src={point.image} 
                          alt="Imagen del incidente" 
                          onError={(e) => {
                            // Handle image loading errors
                            console.error('Failed to load image:', point.image);
                            e.target.style.display = 'none';
                            showErrorNotification('Error al cargar imagen del incidente.');
                          }}
                          style={{ 
                            width: '100%', 
                            maxHeight: '150px', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            marginTop: '5px'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Display single image if imagePath exists */}
                    {point.imagePath && !point.image && (
                      <div>
                        <FontAwesomeIcon icon={faImage} style={{ marginRight: '5px' }} />
                        <strong>Imagen del incidente:</strong>
                        <img 
                          src={getImagePath(point.imagePath)} 
                          alt="Imagen del incidente" 
                          onError={(e) => {
                            // Handle image loading errors
                            console.error('Failed to load image:', point.imagePath);
                            e.target.style.display = 'none';
                            showErrorNotification('Error al cargar imagen del incidente.');
                          }}
                          style={{ 
                            width: '100%', 
                            maxHeight: '150px', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            marginTop: '5px'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Display multiple images if imagenes array exists */}
                    {(point.imagenes || point.Imagenes) && (point.imagenes || point.Imagenes).length > 0 && (
                      <div>
                        <FontAwesomeIcon icon={faImage} style={{ marginRight: '5px' }} />
                        <strong>Imágenes del incidente:</strong>
                        {(point.imagenes || point.Imagenes).map((img, imgIndex) => (
                          <img 
                            key={imgIndex}
                            src={getImagePath(img)} 
                            alt={`Incidente ${imgIndex + 1}`} 
                            onError={(e) => {
                              // Handle image loading errors
                              console.error('Failed to load image:', img);
                              e.target.style.display = 'none';
                              showErrorNotification('Error al cargar imagen del incidente.');
                            }}
                            style={{ 
                              width: '100%', 
                              maxHeight: '150px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              marginBottom: '5px',
                              marginTop: '5px'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;