<?php

  $executionStartTime = microtime(true) / 1000;
  $url='https://api.openweathermap.org/data/2.5/onecall?lat='. $_REQUEST['lat'] . '&lon=' . $_REQUEST['lng'] .'&exclude=hourly,minutely,alerts,current&units=metric&appid=4ef2716ffdcebe56f05f86c5c6adb952';
    
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['weatherForcast'] = $decode;
	
	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output); 

?>