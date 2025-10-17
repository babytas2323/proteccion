import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showErrorNotification } from '../utils/errorHandler';
import './SensorForm.css';

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
    <div className="sensor-form-container">
      <div className="sensor-form-header-decoration"></div>
      
      <h2 className="sensor-form-title">
        🌪️ Reportar Incidente por Huracán
      </h2>

      {isSubmitting && (
        <div className="sensor-form-submitting">
          <p>📤 Guardando incidente... Por favor espere</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="sensor-form">
        {/* Nombre del Incidente */}
        <div className="form-group">
          <label htmlFor="incidentName" className="form-label">
            <span className="form-label-icon">🏷️</span>
            Nombre del Incidente *
          </label>
          <input
            type="text"
            id="incidentName"
            name="incidentName"
            value={formData.incidentName}
            onChange={handleChange}
            className={`form-input ${errors.incidentName ? 'error' : ''}`}
            placeholder="Ej: Huracán Patricia afectando la región"
          />
          {errors.incidentName && (
            <span className="form-error">
              <span className="form-error-icon">⚠️</span>
              {errors.incidentName}
            </span>
          )}
        </div>

        {/* Municipio */}
        <div className="form-group">
          <label htmlFor="municipality" className="form-label">
            <span className="form-label-icon">🏙️</span>
            Municipio *
          </label>
          <input
            type="text"
            id="municipality"
            name="municipality"
            value={formData.municipality}
            onChange={handleChange}
            className={`form-input ${errors.municipality ? 'error' : ''}`}
            placeholder="Ej: Tetela de Ocampo"
          />
          {errors.municipality && (
            <span className="form-error">
              <span className="form-error-icon">⚠️</span>
              {errors.municipality}
            </span>
          )}
        </div>

        {/* Fecha */}
        <div className="form-group">
          <label htmlFor="date" className="form-label">
            <span className="form-label-icon">📅</span>
            Fecha *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`form-input ${errors.date ? 'error' : ''}`}
            placeholder="YYYY-MM-DD"
            pattern="\d{4}-\d{2}-\d{2}"
            title="Seleccione una fecha del calendario"
          />
          {errors.date && (
            <span className="form-error">
              <span className="form-error-icon">⚠️</span>
              {errors.date}
            </span>
          )}
          <p className="form-hint">
            Haga clic en el campo para abrir el calendario selector de fecha
          </p>
        </div>

        {/* Hora */}
        <div className="form-group">
          <label htmlFor="time" className="form-label">
            <span className="form-label-icon">⏰</span>
            Hora *
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`form-input ${errors.time ? 'error' : ''}`}
          />
          {errors.time && (
            <span className="form-error">
              <span className="form-error-icon">⚠️</span>
              {errors.time}
            </span>
          )}
        </div>

        {/* Tipo */}
        <div className="form-group">
          <label htmlFor="type" className="form-label">
            <span className="form-label-icon">🌪️</span>
            Tipo de Incidente
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={`form-select ${errors.type ? 'error' : ''}`}
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
            <span className="form-error">
              <span className="form-error-icon">⚠️</span>
              {errors.type}
            </span>
          )}
        </div>

        {/* Casilla de Verificación de Ubicación Actual */}
        <div className="form-group">
          <label className="form-checkbox-label">
            <span className="form-label-icon">📍</span>
            <input
              type="checkbox"
              checked={useCurrentLocation}
              onChange={handleLocationCheckboxChange}
              className="form-checkbox"
            />
            Usar mi ubicación actual
          </label>
          <p className="form-hint">
            Marca esta casilla para usar tu ubicación actual como posición
          </p>
        </div>

        {/* Latitud */}
        <div className="form-group">
          <label htmlFor="latitude" className="form-label">
            <span className="form-label-icon">🧭</span>
            Latitud *
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
            className={`form-input ${errors.latitude ? 'error' : ''}`}
            placeholder="Ej: 19.75"
          />
          {errors.latitude && (
            <span className="form-error">
              <span className="form-error-icon">⚠️</span>
              {errors.latitude}
            </span>
          )}
        </div>

        {/* Longitud */}
        <div className="form-group">
          <label htmlFor="longitude" className="form-label">
            <span className="form-label-icon">🌍</span>
            Longitud *
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
            className={`form-input ${errors.longitude ? 'error' : ''}`}
            placeholder="Ej: -97.85"
          />
          {errors.longitude && (
            <span className="form-error">
              <span className="form-error-icon">⚠️</span>
              {errors.longitude}
            </span>
          )}
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            <span className="form-label-icon">📝</span>
            Descripción *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            placeholder="Describe brevemente el incidente..."
          />
          {errors.description && (
            <span className="form-error">
              <span className="form-error-icon">⚠️</span>
              {errors.description}
            </span>
          )}
        </div>

        {/* Personas Afectadas */}
        <div className="form-group">
          <label htmlFor="affected" className="form-label">
            <span className="form-label-icon">👥</span>
            Personas Afectadas *
          </label>
          <input
            type="number"
            id="affected"
            name="affected"
            value={formData.affected}
            onChange={handleChange}
            min="0"
            className={`form-input ${errors.affected ? 'error' : ''}`}
            placeholder="Número de personas afectadas"
          />
          {errors.affected && (
            <span className="form-error">
              <span className="form-error-icon">⚠️</span>
              {errors.affected}
            </span>
          )}
        </div>

        {/* Número de Teléfono */}
        <div className="form-group">
          <label htmlFor="phoneNumber" className="form-label">
            <span className="form-label-icon">📱</span>
            Número de Teléfono *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            minLength="10"
            maxLength="10"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
            placeholder="Ej: 2221234567"
          />
          {errors.phoneNumber && (
            <span className="form-error">
              <span className="form-error-icon">⚠️</span>
              {errors.phoneNumber}
            </span>
          )}
          <p className="form-hint">
            Ingrese un número de 10 dígitos sin espacios ni guiones
          </p>
        </div>

        {/* Equipo Asignado */}
        <div className="form-group">
          <label htmlFor="assignedTeam" className="form-label">
            <span className="form-label-icon">📍</span>
            Localidad *
          </label>
          <input
            type="text"
            id="assignedTeam"
            name="assignedTeam"
            value={formData.assignedTeam}
            onChange={handleChange}
            className={`form-input ${errors.assignedTeam ? 'error' : ''}`}
            placeholder="Nombre de la localidad"
          />
          {errors.assignedTeam && (
            <span className="form-error">
              <span className="form-error-icon">⚠️</span>
              {errors.assignedTeam}
            </span>
          )}
        </div>

        {/* Carga de Imagen */}
        <div className="form-group">
          <label htmlFor="image" className="form-label">
            <span className="form-label-icon">📷</span>
            Imagen del Incidente (Opcional)
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="form-input"
          />
          <p className="form-hint">
            Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB
          </p>

          {/* Vista Previa de la Imagen */}
          {imagePreview && (
            <div className="image-preview-container">
              <p className="image-preview-title">
                <span className="form-label-icon">🖼️</span>
                Vista previa de la imagen:
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="image-preview-img"
                />
              </div>
              <div className="image-preview-success">
                ✓ La imagen ha sido cargada correctamente. Formato y tamaño válidos.
              </div>
            </div>
          )}
        </div>

        {/* Nivel de Riesgo */}
        <div className="form-group">
          <label htmlFor="riskLevel" className="form-label">
            <span className="form-label-icon">⚠️</span>
            Nivel de Riesgo
          </label>
          <select
            id="riskLevel"
            name="riskLevel"
            value={formData.riskLevel}
            onChange={handleChange}
            className="form-select"
            style={{ color: getRiskColor(formData.riskLevel) }}
          >
            <option value="Bajo" style={{ color: '#28a745' }}>🟢 Bajo</option>
            <option value="Medio" style={{ color: '#ffc107' }}>🟡 Medio</option>
            <option value="Alto" style={{ color: '#dc3545' }}>🔴 Alto</option>
          </select>
        </div>

        {/* Acciones de Ancho Completo */}
        <div className="form-actions">
          <div className="form-actions-buttons">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`form-buttons form-button-submit`}
            >
              {isSubmitting ? '📤 Guardando...' : '🌪️ Reportar Incidente'}
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
              className="form-buttons form-button-cancel"
            >
              ❌ Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SensorForm;