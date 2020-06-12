// Converts from degrees to radians.
function toRadians(degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
function toDegrees(radians) {
    return radians * 180 / Math.PI;
}

function bearing(startLat, startLng, destLat, destLng){
    startLat = toRadians(startLat);
    startLng = toRadians(startLng);
    destLat = toRadians(destLat);
    destLng = toRadians(destLng);

    y = Math.sin(destLng - startLng) * Math.cos(destLat);
    x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    brng = Math.atan2(y, x);
    brng = toDegrees(brng);
    return (brng + 360) % 360;
}

function distance(lat1, lon1, lat2, lon2) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	} else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344 * 1000;
		return dist;
	}
}

function getRouting(startLat, startLon, destLat, destLon) {
    return new Promise((resolve, reject) => {
        var apiUrl = "https://api.mapbox.com/directions/v5/mapbox/walking/";
        apiUrl = apiUrl + startLon + "," + startLat + ";" + destLon + "," + destLat;
        apiUrl = apiUrl + "?alternatives=false&geometries=geojson&steps=true&access_token=pk.eyJ1IjoiaGVpa29kZSIsImEiOiJjazRlNmpkYTIwOXRiM25vM3o0bnpkcDUwIn0.n5uKXIwegkQnozYiCbmEIw";
    
        $.getJSON(apiUrl, function( data ) {
            if (data.code == "Ok") {
                resolve(data.routes[0]);
            } else {
                reject("error");
            }
        });
    });
}