<?php

$executionStartTime = microtime(true) / 1000;
$countryCode = $_REQUEST['country'];

$url = 'https://restcountries.com/v3.1/alpha/' . $countryCode;

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";

$output['currency'] = null;

// Check if the response is not empty and has the expected structure
if (!empty($decode) && isset($decode[0]["currencies"])) {
    $currencyData = reset($decode[0]["currencies"]);
    
    if ($currencyData) {
        $output['currency']['name'] = $currencyData['name'];
        $output['currency']['symbol'] = $currencyData['symbol'];
    }
}

$output['data'] = isset($decode[0]) ? $decode[0] : null;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>
