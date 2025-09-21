<?php
// deliver.php
$orderId = $_GET['order'] ?? null;

if (!$orderId) {
    die("Invalid request.");
}

// In real setup: verify from DB that this order was PAID

// Example digital product (replace with your actual file/link)
$productLink = "https://marco.com/downloads/product123.zip";
?>

<!DOCTYPE html>
<html>
<head>
    <title>Your Digital Product</title>
</head>
<body style="font-family: Arial, sans-serif; text-align:center; margin-top:50px;">
    <h2>🎉 Thank you for your purchase!</h2>
    <p>Your order ID: <b><?php echo htmlspecialchars($orderId); ?></b></p>
    <p>Click below to download your product:</p>
    <a href="<?php echo $productLink; ?>" download
       style="padding:10px 20px; background:#28a745; color:#fff; text-decoration:none; border-radius:5px;">
       Download Product
    </a>
</body>
</html>
