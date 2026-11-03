<?php

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false]);
    exit;
}

function clean($text) {
    return trim($text);
}

$name    = clean($_POST["name"] ?? '');
$phone   = clean($_POST["phone"] ?? '');
$email   = clean($_POST["email"] ?? '');
$formats = $_POST["format"] ?? [];
$message = clean($_POST["message"] ?? '');

if ($name === '' || $phone === '') {
    echo json_encode(["success" => false]);
    exit;
}

$formatsString = is_array($formats) ? implode(", ", $formats) : $formats;

$date = date("d.m.Y H:i");

$file = __DIR__ . "/data/applications.csv";
$newFile = !file_exists($file);

$handle = fopen($file, "a");

if (!$handle) {
    echo json_encode(["success" => false]);
    exit;
}

if ($newFile) {
    fwrite($handle, "\xEF\xBB\xBF");

    fputcsv($handle, [
        "Дата",
        "ФИО",
        "Телефон",
        "Email",
        "Формат участия",
        "Комментарий",
        "Компания",
        "Статус"
    ], ";");
}

fputcsv($handle, [
    $date,
    $name,
    $phone,
    $email,
    $formatsString,
    $message,
    "",
    "Непрочитано"
], ";");

fclose($handle);

echo json_encode(["success" => true]);
exit;