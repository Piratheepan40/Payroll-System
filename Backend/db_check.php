<?php
$host = '127.0.0.1';
$db   = 'kalvayal';
$user = 'root';
$pass = 'MyDy@2010';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
     $msg = "DATABASE_CONNECTION_SUCCESS\n";
     
     $stmt = $pdo->query("SHOW TABLES LIKE 'workers'");
     if ($stmt->rowCount() > 0) {
         $msg .= "TABLE_WORKERS_EXISTS";
     } else {
         $msg .= "TABLE_WORKERS_MISSING";
     }
} catch (\PDOException $e) {
     $msg = "DATABASE_CONNECTION_FAILED: " . $e->getMessage();
}

file_put_contents('db_status.txt', $msg);
