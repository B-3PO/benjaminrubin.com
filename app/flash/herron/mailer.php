<?php
$name = $_POST['fName'];
$email = trim($_POST['fEmail']);
$phone = $_POST['fPhone'];
$message = $_POST['fMessage'];

$reciever = "ben@benjaminrubin.com";

$email_body = "Name: $name\n";
$email_body .= "Email: $email\n";
$email_body .= "Phone: $phone\n";
$email_body .= "message: \n $message";

if( mail( $reciever, "Webiste Contact Form", $email_body) ) {
	echo "status=Message Sent"; 
}else {
	echo "status=Error Please Resend";
}
?>