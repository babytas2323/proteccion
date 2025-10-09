<?php
// upload.php - Handle image uploads

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// Ensure uploads directory exists
$uploadDir = __DIR__ . '/../public/images/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Check if file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No se ha seleccionado ningún archivo']);
    exit();
}

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!in_array($_FILES['image']['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Solo se permiten archivos de imagen (JPEG, PNG, GIF)']);
    exit();
}

// Validate file size (max 10MB)
$maxSize = 10 * 1024 * 1024;
if ($_FILES['image']['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'La imagen debe ser menor a 10MB']);
    exit();
}

// Generate unique filename
$fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
$filename = 'accident-' . time() . '-' . uniqid() . '.' . $fileExtension;
$uploadPath = $uploadDir . $filename;

// Move uploaded file
if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
    echo json_encode([
        'success' => true,
        'filename' => $filename,
        'path' => 'images/' . $filename,
        'message' => 'Imagen guardada exitosamente'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al guardar la imagen']);
}
?>