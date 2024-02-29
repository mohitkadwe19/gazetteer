<?php

// Define the execution start time
$executionStartTime = microtime(true) / 1000;

// Check if the 'country' parameter is set in the request
if (isset($_REQUEST['country'])) {
    // If 'country' parameter is set, proceed with the API call
    $url = 'http://api.geonames.org/wikipediaSearchJSON?formatted=true&q=airport&country=' . $_REQUEST['country'] . '&maxRows=100&username=naska&style=full';

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
    $output['geonames'] = $decode['geonames'];
} else {
    // If 'country' parameter is not set, return an error response
    $output['status']['code'] = "400";
    $output['status']['name'] = "Bad Request";
    $output['status']['description'] = "Country parameter is missing in the request";
}

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>
