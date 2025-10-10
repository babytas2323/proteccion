// Utility functions for better error handling and reporting

/**
 * Format error message for user display
 * @param {Error|string} error - The error object or message
 * @returns {string} - Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && error.message) {
    // Handle common network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.';
    }
    
    // Handle JSON parsing errors
    if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
      return 'Error al procesar los datos. Los datos pueden estar corruptos.';
    }
    
    return error.message;
  }
  
  return 'Ha ocurrido un error desconocido.';
};

/**
 * Log error with context for debugging
 * @param {string} context - Context where the error occurred
 * @param {Error} error - The error object
 * @param {Object} additionalInfo - Additional information to log
 */
export const logError = (context, error, additionalInfo = {}) => {
  const errorInfo = {
    context,
    message: error.message || error,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    additionalInfo
  };
  
  console.error('Application Error:', errorInfo);
  
  // In production, you might want to send this to an error tracking service
  // For now, we'll just log it to the console
  if (process.env.NODE_ENV === 'production') {
    // Example: send to error tracking service
    // sendToErrorService(errorInfo);
  }
};

/**
 * Show user-friendly error notification
 * @param {string} message - Error message to display
 * @param {string} type - Type of notification (error, warning, info)
 */
export const showErrorNotification = (message, type = 'error') => {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    ${type === 'error' ? 'background-color: #dc3545;' : ''}
    ${type === 'warning' ? 'background-color: #ffc107; color: #212529;' : ''}
    ${type === 'info' ? 'background-color: #17a2b8;' : ''}
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center;">
      <span style="margin-right: 10px;">
        ${type === 'error' ? '⚠️' : ''}
        ${type === 'warning' ? '⚠️' : ''}
        ${type === 'info' ? 'ℹ️' : ''}
      </span>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
};

/**
 * Handle API errors with user-friendly messages
 * @param {Response} response - Fetch API response
 * @returns {Promise} - Promise that resolves with error message
 */
export const handleApiError = async (response) => {
  let errorMessage = 'Error desconocido al comunicarse con el servidor.';
  
  try {
    // Try to get error message from response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } else {
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
  } catch (parseError) {
    // If we can't parse the error, use the status text
    errorMessage = `Error ${response.status}: ${response.statusText}`;
  }
  
  return errorMessage;
};