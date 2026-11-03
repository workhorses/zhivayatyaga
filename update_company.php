<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['admin'])) {
    echo json_encode(["success"=>false]);
    exit;
}

$file = __DIR__ . "/data/applications.csv";

$id = (int)($_POST['id'] ?? -1);
$company = trim($_POST['company'] ?? '');

$rows = [];

if (($handle = fopen($file, "r")) !== false) {
    while (($data = fgetcsv($handle, 0, ";")) !== false) {
        $rows[] = $data;
    }
    fclose($handle);
}

if (!isset($rows[$id+1])) { // +1 потому что первая строка — заголовки
    echo json_encode(["success"=>false]);
    exit;
}

$rows[$id+1][6] = $company;

$fp = fopen($file, "w");
fwrite($fp, "\xEF\xBB\xBF");
foreach ($rows as $row) {
    fputcsv($fp, $row, ";");
}
fclose($fp);

echo json_encode(["success"=>true]);
exit;