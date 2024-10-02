<?php
$name = $_POST['userName'];
$email = trim($_POST['userEmail']);
$phone = $_POST['userPhone'];
$message = $_POST['userMessage'];

$reciever = "ben@benjaminrubin.com";

$email_body = "Name: $name\n";
$email_body .= "Email: $email\n";
$email_body .= "Phone: $phone\n \n";
$email_body .= "message: \n $message";

if( mail( $reciever, "MailForm", $email_body) ) {
	echo "status=Message Sent";
}else {
	echo "status=Error Please Resend";
}
?>