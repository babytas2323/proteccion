<?php
// accidents.php - Handle accidents data API requests

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Path to accidents data file
$dataFile = __DIR__ . '/../src/data/accidents.json';

// Ensure data directory exists
$dataDir = dirname($dataFile);
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0777, true);
}

// Handle GET request - fetch all accidents
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dataFile)) {
        $data = file_get_contents($dataFile);
        echo $data ? $data : json_encode([]);
    } else {
        // Return empty array if file doesn't exist
        echo json_encode([]);
    }
    exit();
}

// Handle POST request - add new accident
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
        exit();
    }
    
    // Read existing data
    $accidents = [];
    if (file_exists($dataFile)) {
        $data = file_get_contents($dataFile);
        $accidents = json_decode($data, true) ?: [];
    }
    
    // Add new accident
    $accidents[] = $input;
    
    // Save updated data
    if (file_put_contents($dataFile, json_encode($accidents, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Incidente guardado exitosamente']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al guardar el incidente']);
    }
    exit();
}

// Method not allowed
http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
?>