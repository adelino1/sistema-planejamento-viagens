<?php
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $prompt = $data['prompt'] ?? '';

    // Mock delay to simulate AI thinking
    sleep(1);

    // Mock AI response
    $response = [
        'status' => 'success',
        'data' => [
            'itinerary' => [
                'title' => 'Roteiro de 3 dias no Lubango',
                'description' => 'Com base no seu pedido, preparei uma aventura inesquecível pelo sul de Angola.',
                'days' => [
                    [
                        'day' => 1,
                        'activities' => [
                            ['time' => '09:00', 'desc' => 'Chegada e Check-in no Lodge', 'cost_aoa' => 0],
                            ['time' => '11:00', 'desc' => 'Visita à Fenda da Tundavala', 'cost_aoa' => 5000],
                            ['time' => '14:00', 'desc' => 'Almoço tradicional Angolano', 'cost_aoa' => 15000],
                            ['time' => '16:00', 'desc' => 'Passeio pelo Cristo Rei do Lubango', 'cost_aoa' => 2000]
                        ]
                    ]
                ]
            ]
        ]
    ];
    echo json_encode($response);
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método não permitido']);
}
