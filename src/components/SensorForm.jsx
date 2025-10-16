import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showErrorNotification } from '../utils/errorHandler';

const SensorForm = ({ onAddSensor }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Campos de accidente
    incidentName: '',
    municipality: 'Tetela de Ocampo',
    date: new Date().toISOString().split('T')[0],
    time: '',
    type: 'Huracán',
    description: '',
    affected: 0,
    assignedTeam: '',
    phoneNumber: '',
    // Campos compartidos
    coordinates: ['', ''],
    riskLevel: 'Bajo'
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Campo del formulario cambiado:', name, value);

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Borrar error cuando el usuario comienza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar la selección de archivo de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Verificar si el archivo es una imagen
      if (!file.type.startsWith('image/')) {
        showErrorNotification('Por favor seleccione un archivo de imagen válido (JPEG, PNG, GIF, WEBP, SVG)', 'warning');
        e.target.value = ''; // Limpiar la entrada
        return;
      }

      // Verificar el tamaño del archivo (límite de 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorNotification(`La imagen es demasiado grande (${(file.size / (1024 * 1024)).toFixed(2)} MB). El tamaño máximo es 5MB.`, 'warning');
        e.target.value = ''; // Limpiar la entrada
        return;
      }

      // Verificar las dimensiones de la imagen (opcional - puedes ajustar estos límites)
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        // Opcional: Verificar dimensiones mínimas y máximas
        const minWidth = 100;
        const maxWidth = 5000;
        const minHeight = 100;
        const maxHeight = 5000;
        
        if (img.width < minWidth || img.height < minHeight) {
          showErrorNotification(`La imagen es demasiado pequeña (${img.width}x${img.height}px). El tamaño mínimo es ${minWidth}x${minHeight}px.`, 'warning');
          e.target.value = ''; // Limpiar la entrada
          return;
        }
        
        if (img.width > maxWidth || img.height > maxHeight) {
          showErrorNotification(`La imagen es demasiado grande (${img.width}x${img.height}px). El tamaño máximo es ${maxWidth}x${maxHeight}px.`, 'warning');
          e.target.value = ''; // Limpiar la entrada
          return;
        }
        
        // Si todas las validaciones pasan, establecer la imagen
        setImage(file);
        
        // Crear vista previa
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      };
      
      img.onerror = () => {
        showErrorNotification('Error al leer la imagen. Por favor intente con otra imagen.', 'warning');
        e.target.value = ''; // Limpiar la entrada
      };
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  // Manejar la casilla de verificación para usar la ubicación actual
  const handleLocationCheckboxChange = (e) => {
    const checked = e.target.checked;
    console.log('Casilla de ubicación cambiada:', checked);
    setUseCurrentLocation(checked);

    // Si la casilla está marcada, intentar obtener la ubicación actual
    if (checked) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('Ubicación obtenida:', latitude, longitude);
            setFormData(prev => ({
              ...prev,
              coordinates: [longitude.toString(), latitude.toString()]
            }));
          },
          (error) => {
            console.error('Error al obtener la ubicación:', error);
            showErrorNotification('No se pudo obtener la ubicación. Por favor, ingresa las coordenadas manualmente.', 'warning');
            setUseCurrentLocation(false);
          }
        );
      } else {
        showErrorNotification('La geolocalización no es compatible con este navegador.', 'warning');
        setUseCurrentLocation(false);
      }
    } else {
      // Limpiar coordenadas cuando la casilla no está marcada
      setFormData(prev => ({
        ...prev,
        coordinates: ['', '']
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    console.log('Validando datos del formulario:', formData);

    // Validar TODOS los campos de accidente como requeridos
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

    // Validar número de teléfono - campo requerido
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'El número de teléfono es requerido';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'El número de teléfono debe tener 10 dígitos';
    }

    // Validar campos de ubicación - requeridos a menos que se use la ubicación actual
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

    // Validar assignedTeam (Localidad) - campo requerido
    if (!formData.assignedTeam.trim()) {
      newErrors.assignedTeam = 'La localidad es requerida';
    }

    console.log('Errores de validación:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Envío de formulario iniciado');

    // Validar formulario
    if (!validateForm()) {
      const errorMsg = 'Por favor corrija los errores en el formulario';
      console.error(errorMsg);
      showErrorNotification(errorMsg, 'warning');
      return;
    }

    setIsSubmitting(true);

    // Crear un nuevo objeto de accidente
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

    console.log('Objeto de accidente creado:', newAccident);

    // Llamar a la función padre para agregar los datos
    try {
      console.log('Llamando a onAddSensor con:', newAccident);
      const success = await onAddSensor(newAccident, image); // Pasar imagen a la función padre
      console.log('Resultado de onAddSensor:', success);

      if (success) {
        // Restablecer formulario
        setFormData({
          // Campos de accidente
          incidentName: '',
          municipality: 'Tetela de Ocampo',
          date: new Date().toISOString().split('T')[0],
          time: '',
          type: 'Huracán',
          description: '',
          affected: 0,
          assignedTeam: '',
          phoneNumber: '',
          // Campos compartidos
          coordinates: ['', ''],
          riskLevel: 'Bajo'
        });
        setImage(null);
        setImagePreview(null);
        setErrors({});
        setUseCurrentLocation(false);

        // Mostrar mensaje de éxito
        showErrorNotification('Reporte de incidente agregado exitosamente!', 'info');
      } else {
        const errorMsg = 'Error al agregar los datos. Por favor intente nuevamente.';
        console.error(errorMsg);
        showErrorNotification(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error al agregar datos:', error);
      showErrorNotification('Error al agregar los datos. Por favor intente nuevamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para obtener el color del nivel de riesgo
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
          {/* Nombre del Incidente */}
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

          {/* Municipio */}
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

          {/* Fecha */}
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

          {/* Hora */}
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

          {/* Tipo */}
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
              <option value=" ">Seleccione un tipo de incidente</option>
              <option value="Caida de Arbol" >Caída de árbol</option>
              <option value="Inundacion">Inundación</option>
              <option value="Derrumbe">Derrumbe de tierra o laderas</option>
              <option value="Viento fuerte">Viento fuerte</option>
              <option value="Caida de techo">Caída de techo o casas</option>
              <option value="Caida de postes">Caída de postes eléctricos o cables</option>
              <option value="Vehiculo arrastrado">Vehículos arrastrados por agua</option>
              <option value="Objetos voladores">Objetos voladores peligrosos</option>
              <option value="Derrumbe de puente">Derrumbe de puentes o caminos</option>
              <option value="Rios desbordados">Ríos desbordados o corrientes fuertes</option>
              <option value="Incendio">Incendio por cortocircuito o gas</option>
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

          {/* Casilla de Verificación de Ubicación Actual */}
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

          {/* Latitud */}
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

          {/* Longitud */}
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

          {/* Descripción */}
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

          {/* Personas Afectadas */}
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

          {/* Número de Teléfono */}
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

          {/* Equipo Asignado */}
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

          {/* Carga de Imagen */}
          <div className="form-group">
            <label
              htmlFor="image"
              style={{
                display: 'block',
                color: '#333',
                fontWeight: '600',
                marginBottom: '8px',
                fontSize: '16px'
              }}
            >
              📷 Imagen del Incidente (Opcional)
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #ced4da',
                borderRadius: '8px',
                color: '#333',
                backgroundColor: '#fff',
                fontSize: '16px',
                transition: 'border-color 0.3s',
                boxSizing: 'border-box'
              }}
            />
            <p style={{
              color: '#6c757d',
              fontSize: '12px',
              fontStyle: 'italic',
              marginTop: '5px',
              marginBottom: '0'
            }}>
              Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB
            </p>

            {/* Vista Previa de la Imagen */}
            {imagePreview && (
              <div style={{ marginTop: '15px' }}>
                <p style={{
                  fontWeight: '600',
                  marginBottom: '10px',
                  color: '#333'
                }}>
                  Vista previa de la imagen:
                </p>
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '5px',
                  color: '#155724'
                }}>
                  ✓ La imagen ha sido cargada correctamente. Formato y tamaño válidos.
                </div>
              </div>
            )}
          </div>

          {/* Nivel de Riesgo */}
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

          {/* Acciones de Ancho Completo */}
          <div style={{
            textAlign: 'center',
            paddingTop: '25px',
            borderTop: '1px solid #dee2e6'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap'
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
                  minWidth: '200px'
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
                  // Cerrar el panel del formulario
                  const closeButtons = document.querySelectorAll('.close-button');
                  if (closeButtons.length > 0) {
                    closeButtons[0].click();
                  } else {
                    // Alternativa: navegar a la página principal
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default SensorForm;