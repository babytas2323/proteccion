<?php
// restore.php - Restore initial accidents data

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

// Path to accidents data file
$dataFile = __DIR__ . '/../src/data/accidents.json';

// Ensure data directory exists
$dataDir = dirname($dataFile);
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0777, true);
}

// Initial data
$initialData = [
    [
        "id" => 1,
        "nombre" => "Huracán Patricia",
        "municipio" => "Tetela de Ocampo",
        "fecha" => "2023-10-23",
        "hora" => "14:30",
        "tipo" => "Huracán",
        "descripcion" => "Fuertes vientos y lluvias intensas afectaron la región",
        "coordenadas" => [-97.8096, 19.8116],
        "nivel_riesgo" => "high",
        "afectados" => 15,
        "brigada_asignada" => "Brigada de Emergencia 1",
        "imagenes" => [],
        "type" => "accident"
    ],
    [
        "id" => 2,
        "nombre" => "Inundación por tormenta",
        "municipio" => "Tetela de Ocampo",
        "fecha" => "2023-09-15",
        "hora" => "08:45",
        "tipo" => "Inundación",
        "descripcion" => "Inundación en la calle principal por tormenta severa",
        "coordenadas" => [-97.815, 19.808],
        "nivel_riesgo" => "medium",
        "afectados" => 8,
        "brigada_asignada" => "Brigada de Rescate 2",
        "imagenes" => [],
        "type" => "accident"
    ]
];

// Save initial data
if (file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT))) {
    echo json_encode(['success' => true, 'message' => 'Datos iniciales restaurados exitosamente']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al restaurar los datos iniciales']);
}
?>