<?php

$serverName = "waterqwiz.database.windows.net";
$userName = "waterqwiz";
$password = "BCIT_Jacob";
$dbName = "WaterQwiz";
$mysqli = new mysqli($serverName, $userName, $password, $dbName);

$tempArray = array();
if ($result = $mysqli->query("SELECT name, score FROM leaderboard ORDER BY score DESC")) {

	while($row = $result->fetch_array(MYSQL_ASSOC)) {
		$myArray[] = $row;
	}
	echo json_encode($myArray);
}

$result->close();
$mysqli->close();

?>
