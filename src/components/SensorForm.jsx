import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Function to get today's date in YYYY-MM-DD format without timezone issues
const getTodayDate = () => {
  const today = new Date();
  // Adjust for local timezone
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0];
};

const SensorForm = ({ onAddSensor }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Accident fields
    incidentName: '',
    municipality: 'Tetela de Ocampo',
    date: getTodayDate(),
    time: '',
    type: 'Huracán',
    description: '',
    affected: 0,
    assignedTeam: '',
    phoneNumber: '',
    // Shared fields
    coordinates: ['', ''],
    riskLevel: 'Bajo'
  });
  const [errors, setErrors] = useState({});
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Form field changed:', name, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle checkbox for using current location
  const handleLocationCheckboxChange = (e) => {
    const checked = e.target.checked;
    console.log('Location checkbox changed:', checked);
    setUseCurrentLocation(checked);
    
    // If checkbox is checked, try to get current location
    if (checked) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('Location obtained:', latitude, longitude);
            setFormData(prev => ({
              ...prev,
              coordinates: [longitude.toString(), latitude.toString()]
            }));
          },
          (error) => {
            console.error('Error getting location:', error);
            alert('No se pudo obtener la ubicación. Por favor, ingresa las coordenadas manualmente.');
            setUseCurrentLocation(false);
          }
        );
      } else {
        alert('La geolocalización no es compatible con este navegador.');
        setUseCurrentLocation(false);
      }
    } else {
      // Clear coordinates when checkbox is unchecked
      setFormData(prev => ({
        ...prev,
        coordinates: ['', '']
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    console.log('Validating form data:', formData);
    
    // Validate ALL accident fields as required
    if (!formData.incidentName.trim()) {
      newErrors.incidentName = 'El nombre del incidente es requerido';
    }
    
    if (!formData.municipality.trim()) {
      newErrors.municipality = 'El municipio es requerido';
    }
    
    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    }
    
    if (!formData.time) {
      newErrors.time = 'La hora es requerida';
    }
    
    if (!formData.type.trim()) {
      newErrors.type = 'El tipo de incidente es requerido';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (formData.affected === '' || isNaN(formData.affected) || parseInt(formData.affected) < 0) {
      newErrors.affected = 'El número de afectados es requerido y debe ser un número positivo';
    }
    
    // Validate phone number - required field
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'El número de teléfono es requerido';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'El número de teléfono debe tener 10 dígitos';
    }
    
    // Validate location fields - required unless using current location
    if (!useCurrentLocation) {
      if (!formData.coordinates[1]) {
        newErrors.latitude = 'La latitud es requerida';
      } else if (isNaN(formData.coordinates[1]) || parseFloat(formData.coordinates[1]) < -90 || parseFloat(formData.coordinates[1]) > 90) {
        newErrors.latitude = 'La latitud debe ser un número entre -90 y 90';
      }
      
      if (!formData.coordinates[0]) {
        newErrors.longitude = 'La longitud es requerida';
      } else if (isNaN(formData.coordinates[0]) || parseFloat(formData.coordinates[0]) < -180 || parseFloat(formData.coordinates[0]) > 180) {
        newErrors.longitude = 'La longitud debe ser un número entre -180 y 180';
      }
    }
    
    // Validate assignedTeam (Localidad) - required field
    if (!formData.assignedTeam.trim()) {
      newErrors.assignedTeam = 'La localidad es requerida';
    }
    
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    
    // Validate form
    if (!validateForm()) {
      const errorMsg = 'Por favor corrija los errores en el formulario';
      console.error(errorMsg);
      alert(errorMsg);
      return;
    }
    
    setIsSubmitting(true);
    
    // Create a new accident object
    const newAccident = {
      nombre: formData.incidentName,
      municipio: formData.municipality,
      fecha: formData.date,
      hora: formData.time,
      tipo: formData.type,
      descripcion: formData.description,
      coordenadas: [parseFloat(formData.coordinates[0]), parseFloat(formData.coordinates[1])],
      nivel_riesgo: formData.riskLevel,
      afectados: parseInt(formData.affected),
      localidad: formData.assignedTeam,
      telefono: formData.phoneNumber
    };
    
    console.log('Created accident object:', newAccident);

    // Call the parent function to add the data
    try {
      console.log('Calling onAddSensor with:', newAccident);
      const success = await onAddSensor(newAccident);
      console.log('onAddSensor result:', success);
      
      if (success) {
        // Reset form
        setFormData({
          // Accident fields
          incidentName: '',
          municipality: 'Tetela de Ocampo',
          date: getTodayDate(),
          time: '',
          type: 'Huracán',
          description: '',
          affected: 0,
          assignedTeam: '',
          phoneNumber: '',
          // Shared fields
          coordinates: ['', ''],
          riskLevel: 'Bajo'
        });
        setErrors({});
        setUseCurrentLocation(false);
        
        // Show success message
        alert('Reporte de incidente agregado exitosamente!');
      } else {
        const errorMsg = 'Error al agregar los datos. Por favor intente nuevamente.';
        console.error(errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error adding data:', error);
      alert('Error al agregar los datos. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to get risk level color
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Bajo':
      case 'bajo':
      case 'low':
        return '#28a745';
      case 'Medio':
      case 'medio':
      case 'medium':
        return '#ffc107';
      case 'Alto':
      case 'alto':
      case 'high':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="sensor-form">
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '30px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#333',
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: '600',
          paddingBottom: '15px',
          borderBottom: '2px solid #007bff'
        }}>
          🌪️ Reportar Incidente por Huracán
        </h2>
        
        {isSubmitting && (
          <div style={{
            textAlign: 'center',
            padding: '15px',
            backgroundColor: '#e9ecef',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p>📤 Guardando incidente... Por favor espere</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Incident Name */}
          <div className="form-group">
            <label 
              htmlFor="incidentName" 
              style={{
                display: 'block',
                color: '#333',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              🏷️ Nombre del Incidente *
            </label>
            <input
              type="text"
              id="incidentName"
              name="incidentName"
              value={formData.incidentName}
              onChange={handleChange}
              className={errors.incidentName ? 'error' : ''}
              style={{
                width: '100%',
                padding: '14px',
                border: errors.incidentName ? '2px solid #dc3545' : '2px solid #ced4da',
                borderRadius: '8px',
                color: '#333',
                backgroundColor: '#fff',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              placeholder="Ej: Huracán Patricia afectando la región"
            />
            {errors.incidentName && (
              <span className="error-message" style={{
                color: '#dc3545',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '6px',
                display: 'block'
              }}>
                ⚠️ {errors.incidentName}
              </span>
            )}
          </div>

          {/* Municipality */}
          <div className="form-group">
            <label 
              htmlFor="municipality" 
              style={{
                display: 'block',
                color: '#333',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              🏙️ Municipio *
            </label>
            <input
              type="text"
              id="municipality"
              name="municipality"
              value={formData.municipality}
              onChange={handleChange}
              className={errors.municipality ? 'error' : ''}
              style={{
                width: '100%',
                padding: '14px',
                border: errors.municipality ? '2px solid #dc3545' : '2px solid #ced4da',
                borderRadius: '8px',
                color: '#333',
                backgroundColor: '#fff',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              placeholder="Ej: Tetela de Ocampo"
            />
            {errors.municipality && (
              <span className="error-message" style={{
                color: '#dc3545',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '6px',
                display: 'block'
              }}>
                ⚠️ {errors.municipality}
              </span>
            )}
          </div>

          {/* Date */}
          <div className="form-group">
            <label 
              htmlFor="date" 
              style={{
                display: 'block',
                color: '#333',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              📅 Fecha *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={errors.date ? 'error' : ''}
              style={{
                width: '100%',
                padding: '14px',
                border: errors.date ? '2px solid #dc3545' : '2px solid #ced4da',
                borderRadius: '8px',
                color: '#333',
                backgroundColor: '#fff',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
            />
            {errors.date && (
              <span className="error-message" style={{
                color: '#dc3545',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '6px',
                display: 'block'
              }}>
                  ⚠️ {errors.date}
              </span>
            )}
          </div>
          
          {/* Time */}
          <div className="form-group">
            <label 
              htmlFor="time" 
              style={{
                display: 'block',
                color: '#333',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              ⏰ Hora *
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={errors.time ? 'error' : ''}
              style={{
                width: '100%',
                padding: '14px',
                border: errors.time ? '2px solid #dc3545' : '2px solid #ced4da',
                borderRadius: '8px',
                color: '#333',
                backgroundColor: '#fff',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
            />
            {errors.time && (
              <span className="error-message" style={{
                color: '#dc3545',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '6px',
                display: 'block'
              }}>
                ⚠️ {errors.time}
              </span>
            )}
          </div>

          {/* Type */}
          <div className="form-group">
            <label 
              htmlFor="type" 
              style={{
                display: 'block',
                color: '#333',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              🌪️ Tipo de Incidente *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={errors.type ? 'error' : ''}
              style={{
                width: '100%',
                padding: '14px',
                border: errors.type ? '2px solid #dc3545' : '2px solid #ced4da',
                borderRadius: '8px',
                color: '#333',
                backgroundColor: '#fff',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Seleccione un tipo de incidente</option>
              <option value="Huracán">Huracán</option>
              <option value="Inundación">Inundación</option>
              <option value="Derrumbe">Derrumbe</option>
              <option value="Viento fuerte">Viento fuerte</option>
              <option value="Otro">Otro</option>
            </select>
            {errors.type && (
              <span className="error-message" style={{
                color: '#dc3545',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '6px',
                display: 'block'
              }}>
                ⚠️ {errors.type}
              </span>
            )}
          </div>

          {/* Use Current Location Checkbox */}
          <div className="form-group">
            <label style={{
              display: 'flex',
              alignItems: 'center',
              color: '#333',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={useCurrentLocation}
                onChange={handleLocationCheckboxChange}
                style={{
                  width: '20px',
                  height: '20px',
                  marginRight: '10px'
                }}
              />
              📍 Usar mi ubicación actual
            </label>
            <p style={{
              color: '#6c757d',
              fontSize: '13px',
              fontStyle: 'italic',
              marginTop: '5px',
              marginBottom: '10px'
            }}>
              Marca esta casilla para usar tu ubicación actual como posición
            </p>
          </div>

          {/* Latitude */}
          <div className="form-group">
            <label 
              htmlFor="latitude" 
              style={{
                display: 'block',
                color: '#333',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              🧭 Latitud *
            </label>
            <input
              type="number"
              id="latitude"
              name="coordinates[1]"
              value={formData.coordinates[1]}
              onChange={(e) => {
                const newCoordinates = [...formData.coordinates];
                newCoordinates[1] = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  coordinates: newCoordinates
                }));
              }}
              step="any"
              disabled={useCurrentLocation}
              className={errors.latitude ? 'error' : ''}
              style={{
                width: '100%',
                padding: '14px',
                border: errors.latitude ? '2px solid #dc3545' : '2px solid #ced4da',
                borderRadius: '8px',
                color: '#333',
                backgroundColor: useCurrentLocation ? '#f8f9fa' : '#fff',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              placeholder="Ej: 19.75"
            />
            {errors.latitude && (
              <span className="error-message" style={{
                color: '#dc3545',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '6px',
                display: 'block'
              }}>
                ⚠️ {errors.latitude}
              </span>
            )}
          </div>

          {/* Longitude */}
          <div className="form-group">
            <label 
              htmlFor="longitude" 
              style={{
                display: 'block',
                color: '#333',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              🌍 Longitud *
            </label>
            <input
              type="number"
              id="longitude"
              name="coordinates[0]"
              value={formData.coordinates[0]}
              onChange={(e) => {
                const newCoordinates = [...formData.coordinates];
                newCoordinates[0] = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  coordinates: newCoordinates
                }));
              }}
              step="any"
              disabled={useCurrentLocation}
              className={errors.longitude ? 'error' : ''}
              style={{
                width: '100%',
                padding: '14px',
                border: errors.longitude ? '2px solid #dc3545' : '2px solid #ced4da',
                borderRadius: '8px',
                color: '#333',
                backgroundColor: useCurrentLocation ? '#f8f9fa' : '#fff',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              placeholder="Ej: -97.85"
            />
            {errors.longitude && (
              <span className="error-message" style={{
                color: '#dc3545',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '6px',
                display: 'block'
              }}>
                ⚠️ {errors.longitude}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label 
              htmlFor="description" 
              style={{
                display: 'block',
                color: '#333',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              📝 Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={errors.description ? 'error' : ''}
              style={{
                width: '100%',
                padding: '14px',
                border: errors.description ? '2px solid #dc3545' : '2px solid #ced4da',
                borderRadius: '8px',
                color: '#333',
                backgroundColor: '#fff',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              placeholder="Describe brevemente el incidente..."
            />
            {errors.description && (
              <span className="error-message" style={{
                color: '#dc3545',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '6px',
                display: 'block'
              }}>
                ⚠️ {errors.description}
              </span>
            )}
          </div>

          {/* Affected People */}
          <div className="form-group">
            <label 
              htmlFor="affected" 
              style={{
                display: 'block',
                color: '#333',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              👥 Personas Afectadas *
            </label>
            <input
              type="number"
              id="affected"
              name="affected"
              value={formData.affected}
              onChange={handleChange}
              min="0"
              className={errors.affected ? 'error' : ''}
              style={{
                width: '100%',
                padding: '14px',
                border: errors.affected ? '2px solid #dc3545' : '2px solid #ced4da',
                borderRadius: '8px',
                color: '#333',
                backgroundColor: '#fff',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              placeholder="Número de personas afectadas"
            />
            {errors.affected && (
              <span className="error-message" style={{
                color: '#dc3545',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '6px',
                display: 'block'
              }}>
                ⚠️ {errors.affected}
              </span>
            )}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label 
              htmlFor="phoneNumber" 
              style={{
                display: 'block',
                color: '#333',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              📱 Número de Teléfono *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={errors.phoneNumber ? 'error' : ''}
              style={{
                width: '100%',
                padding: '14px',
                border: errors.phoneNumber ? '2px solid #dc3545' : '2px solid #ced4da',
                borderRadius: '8px',
                color: '#333',
                backgroundColor: '#fff',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              placeholder="Ej: 2221234567"
            />
            {errors.phoneNumber && (
              <span className="error-message" style={{
                color: '#dc3545',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '6px',
                display: 'block'
              }}>
                ⚠️ {errors.phoneNumber}
              </span>
            )}
            <p style={{
              color: '#6c757d',
              fontSize: '12px',
              fontStyle: 'italic',
              marginTop: '5px',
              marginBottom: '0'
            }}>
              Ingrese un número de 10 dígitos sin espacios ni guiones
            </p>
          </div>

          {/* Assigned Team */}
          <div className="form-group">
            <label 
              htmlFor="assignedTeam" 
              style={{
                display: 'block',
                color: '#333',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              📍 Localidad *
            </label>
            <input
              type="text"
              id="assignedTeam"
              name="assignedTeam"
              value={formData.assignedTeam}
              onChange={handleChange}
              className={errors.assignedTeam ? 'error' : ''}
              style={{
                width: '100%',
                padding: '14px',
                border: errors.assignedTeam ? '2px solid #dc3545' : '2px solid #ced4da',
                borderRadius: '8px',
                color: '#333',
                backgroundColor: '#fff',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
              placeholder="Nombre de la localidad"
            />
            {errors.assignedTeam && (
              <span className="error-message" style={{
                color: '#dc3545',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '6px',
                display: 'block'
              }}>
                ⚠️ {errors.assignedTeam}
              </span>
            )}
          </div>

          {/* Risk Level */}
          <div className="form-group">
            <label 
              htmlFor="riskLevel" 
              style={{
                display: 'block',
                color: '#333',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              ⚠️ Nivel de Riesgo
            </label>
            <select
              id="riskLevel"
              name="riskLevel"
              value={formData.riskLevel}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #ced4da',
                borderRadius: '8px',
                color: getRiskColor(formData.riskLevel),
                backgroundColor: '#fff',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1em'
              }}
            >
              <option value="Bajo" style={{ color: '#28a745' }}>🟢 Bajo</option>
              <option value="Medio" style={{ color: '#ffc107' }}>🟡 Medio</option>
              <option value="Alto" style={{ color: '#dc3545' }}>🔴 Alto</option>
            </select>
          </div>

          {/* Full Width Actions */}
          <div style={{ 
            textAlign: 'center',
            paddingTop: '25px',
            borderTop: '1px solid #dee2e6'
          }}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{
                backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
                color: 'white',
                padding: '14px 28px',
                border: 'none',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                boxShadow: '0 4px 6px rgba(0,123,255,0.3)',
                transition: 'all 0.3s',
                minWidth: '200px',
                marginRight: '10px'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {isSubmitting ? '📤 Guardando...' : '🌪️ Reportar'}
            </button>
            <button 
              type="button" 
              onClick={() => {
                // Close the form panel
                const closeButtons = document.querySelectorAll('.close-button');
                if (closeButtons.length > 0) {
                  closeButtons[0].click();
                } else {
                  // Fallback: navigate to home
                  navigate('/');
                }
              }}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '14px 28px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                boxShadow: '0 4px 6px rgba(108,117,125,0.3)',
                transition: 'all 0.3s',
                minWidth: '200px'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SensorForm;