<?php
// Database credentials

$host = 'db-9fba1671-9c4a-4fda-a1b6-b2ee094724f8.ap-southeast-1.db.laravel.cloud'; // Change if your DB is hosted elsewhere
$user = 'b5hcebz337bz0a4s'; // Change to your MySQL username
$password = 'MGb3e3AvTryE4KGZVrxA'; // Change to your MySQL password
$dbname = 'main'; // Change to your database name

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

echo '<form method="post">
    <label for="query">Enter SQL Query:</label><br>
    <textarea name="query" id="query" rows="4" cols="50">SELECT * FROM your_table LIMIT 10;</textarea><br>
    <input type="submit" value="Run Query">
</form>';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['query'])) {
    $user_query = $_POST['query'];
    echo '<h3>Query:</h3><pre>' . htmlspecialchars($user_query) . '</pre>';
    $result = $conn->query($user_query);
    if ($result) {
        if ($result instanceof mysqli_result) {
            echo '<table border="1"><tr>';
            // Print table headers
            $fields = $result->fetch_fields();
            foreach ($fields as $field) {
                echo '<th>' . htmlspecialchars($field->name) . '</th>';
            }
            echo '</tr>';
            // Print table rows
            while ($row = $result->fetch_assoc()) {
                echo '<tr>';
                foreach ($row as $cell) {
                    echo '<td>' . htmlspecialchars($cell) . '</td>';
                }
                echo '</tr>';
            }
            echo '</table>';
        } else {
            echo '<p>Query executed successfully.</p>';
        }
    } else {
        echo '<p style="color:red;">Error: ' . htmlspecialchars($conn->error) . '</p>';
    }
}

// Show tables as before
$sql = 'SHOW TABLES';
$result = $conn->query($sql);
if ($result && $result->num_rows > 0) {
    echo "<h2>Tables in database '$dbname':</h2><ul>";
    while ($row = $result->fetch_array()) {
        echo '<li>' . htmlspecialchars($row[0]) . '</li>';
    }
    echo '</ul>';
} else {
    echo 'No tables found.';
}

$conn->close();
?>
