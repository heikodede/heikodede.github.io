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
};

function findNearestStops(position, amount) {
    var allStops = [];
    //add all stops with distance
    route.forEach( (item, index) => {
        if (item.type == "stop") {
            allStops.push({
                locationId: index,
                item: item,
                distance: distance(position.lat, position.lon, item.lat, item.lon)
            });
        }
    });

    //sort stops by ascending distance
    allStops.sort( (a,b) => {
        return a.distance - b.distance;
    });

    //get three stops with lowest distance
    var nearestStops = [];
    for (var i=0; i<amount; i++) {
        nearestStops.push(allStops[i]);
    };
    return nearestStops;
}

function routeToNearestStop(position) {
    return new Promise((resolve, reject) => {
        nearestStops = findNearestStops(position, 3);
        var routingPromiseArray = [];
        nearestStops.forEach( (nearestStop) => {
            routingPromiseArray.push( getRouting(position.lat, position.lon, nearestStop.item.lat, nearestStop.item.lon) );
        });

        Promise.all(routingPromiseArray).then((topRoutes) => {
            //routen und stops zusammenfuehren, anschließend nach Distanz aufsteigend sortieren und kleinste Distanz zurückgeben
            var stopsAndRoutes = [];
            for (var i = 0; i < nearestStops.length; i++) {
                stopsAndRoutes.push({stop: nearestStops[i], route: topRoutes[i]})
            } 

            stopsAndRoutes.sort( (a,b) => {
                return a.route.distance - b.route.distance;
            });
            resolve(stopsAndRoutes[0]);
        });
    });
} 

