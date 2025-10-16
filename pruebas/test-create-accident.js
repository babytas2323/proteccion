// Test script to create an accident via the backend API
const testCreateAccident = async () => {
  try {
    const accidentData = {
      nombre: "Nuevo Incidente",
      tipo: "Prueba",
      descripcion: "Descripción de prueba"
    };

    // Create FormData
    const formData = new FormData();
    formData.append('accident', JSON.stringify(accidentData));

    // Send request to backend
    const response = await fetch('http://localhost:3004/api/accidents', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to create accident: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Accident created successfully:', result);
  } catch (error) {
    console.error('Error creating accident:', error);
  }
};

testCreateAccident();