<?php

use PHPMailer\PHPMailer\PHPMailer;

require __DIR__ . '/../vendor/autoload.php';



require_once __DIR__ . '/../config/cors.php';
applyCors(['POST', 'OPTIONS']);

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$phone = trim($data["phone"] ?? "");
$subject = trim($data["subject"] ?? "");
$message = trim($data["message"] ?? "");

if ($name === "" || $email === "" || $subject === "" || $message === "") {
    echo json_encode([
        "success" => false,
        "message" => "Please fill in all required fields."
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid email address."
    ]);
    exit;
}

try {
    $config = require __DIR__ . '/../config/mail.php';
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config["host"];
    $mail->SMTPAuth = true;
    $mail->Username = $config["username"];
    $mail->Password = $config["password"];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $config["port"];

    $mail->setFrom($config["from_email"], $config["from_name"]);
    $mail->addAddress($config["owner_email"]);

    $mail->addReplyTo($email, $name);

    $mail->isHTML(true);
    $mail->CharSet = "UTF-8";

    $mail->Subject = "New Contact Message - " . $subject;

    $safeName = htmlspecialchars($name, ENT_QUOTES, "UTF-8");
    $safeEmail = htmlspecialchars($email, ENT_QUOTES, "UTF-8");
    $safePhone = htmlspecialchars($phone, ENT_QUOTES, "UTF-8");
    $safeSubject = htmlspecialchars($subject, ENT_QUOTES, "UTF-8");
    $safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, "UTF-8"));

    $mail->Body = "
        <div style='font-family: Arial, sans-serif; background:#f7f4ef; padding:30px;'>
            <div style='max-width:650px; margin:auto; background:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #e8dfd2;'>
                <div style='background:#1f1a17; color:#ffffff; padding:24px 28px;'>
                    <h2 style='margin:0; font-size:22px;'>New Contact Message</h2>
                    <p style='margin:8px 0 0; color:#d6c3a3;'>Star Hotel</p>
                </div>

                <div style='padding:28px; color:#2b2723;'>
                    <p><strong>Name:</strong> {$safeName}</p>
                    <p><strong>Email:</strong> {$safeEmail}</p>
                    <p><strong>Phone:</strong> {$safePhone}</p>
                    <p><strong>Subject:</strong> {$safeSubject}</p>

                    <div style='margin-top:22px; padding:18px; background:#faf7f1; border-radius:14px; border:1px solid #eadfce;'>
                        <strong>Message:</strong>
                        <p style='line-height:1.7; margin-bottom:0;'>{$safeMessage}</p>
                    </div>
                </div>
            </div>
        </div>
    ";

    $mail->AltBody = "
        New Contact Message

        Name: {$name}
        Email: {$email}
        Phone: {$phone}
        Subject: {$subject}

        Message:
        {$message}
    ";

    $mail->send();

    echo json_encode([
        "success" => true,
        "message" => "Your message has been sent successfully."
    ]);
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Message could not be sent. Please try again later."
    ]);
}