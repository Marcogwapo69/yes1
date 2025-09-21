<?php
// webhook.php

// Read raw webhook JSON
$payload = file_get_contents("php://input");
$data = json_decode($payload, true);

// (Optional but recommended) Verify webhook signature
$headers = getallheaders();
$signature = $headers['X-CALLBACK-SIGNATURE'] ?? '';
$secret = "xnd_development_Im3qjv1C3J8z34MPOEF9i0rsmawgRSn5yPJApwTXT04pKRPRRiQGXlQdgK736V7"; // Set in Xendit Dashboard
$expected_signature = hash_hmac('sha256', $payload, $secret);

if (!hash_equals($expected_signature, $signature)) {
    http_response_code(403);
    exit("Invalid signature");
}

// Check payment status
if ($data['status'] === 'PAID') {
    $orderId = $data['external_id']; 
    $email   = $data['payer_email']; 

    // Save payment to database (optional)
    // ...

    // Redirect to product delivery page
    header("Location: https://marco.com/deliver" . urlencode($orderId));
    exit();
}

// If not paid, return 200 to acknowledge receipt
http_response_code(200);
echo json_encode(["message" => "Webhook received"]);
?>
