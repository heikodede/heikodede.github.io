var isPaused = true;

$("#pauseBtn").click(function() {
	if ($("#pauseBtn").hasClass("paused")) {
		isPaused = false;
		$("#pauseBtn").removeClass("paused");
	} else {
		isPaused = true;
		$("#pauseBtn").addClass("paused");
	}
});

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
}

(function() {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.register("sw.js");
	}

	if (getUrlVars()["showUI"] == "false") {
		$("#bottomUI").hide();
	}
})();


(function() {
		mapboxgl.accessToken = 'pk.eyJ1IjoiaGVpa29kZSIsImEiOiJjazRlNmpkYTIwOXRiM25vM3o0bnpkcDUwIn0.n5uKXIwegkQnozYiCbmEIw';
		var map = new mapboxgl.Map({
			container: 'mapContainer',
			style: 'mapbox://styles/mapbox/dark-v10',
			center: [11.5761, 48.1371],
			zoom: 12,
			antialias: true
		});

		map.addControl(new mapboxgl.NavigationControl());

		map.addControl(
		new mapboxgl.GeolocateControl({
			positionOptions: {
				enableHighAccuracy: true
			},
			trackUserLocation: true
		})
        );
        
		map.on('load', function() {
			var routeCoordinates = [];

			route.forEach(function(item) {
				routeCoordinates.push([item.lon, item.lat]);
			});

			//neue Layer mit Routenlinie
			map.addLayer({
				id: 'route',
				type: 'line',
				source: {
					type: 'geojson',
					data: {
						type: 'Feature',
						properties: {},
						geometry: {
							type: 'LineString',
							coordinates: routeCoordinates
						}
					}
				},
				layout: {
					'line-join': 'round',
					'line-cap': 'round'
				},
				minzoom: 12,
				paint: {
					'line-color': 'rgba(66,133,244,0.3)',
					'line-width': 8
				}
			});

			var layers = map.getStyle().layers;

			var labelLayerId;
			for (var i = 0; i < layers.length; i++) {
				if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
					labelLayerId = layers[i].id;
					break;
				}
			}

			//neue Layer mit Objektdaten
			map.addLayer({
				id: '3d-buildings',
				source: 'composite',
				'source-layer': 'building',
				filter: ['==', 'extrude', 'true'],
				type: 'fill-extrusion',
				minzoom: 13,
				paint: {
					'fill-extrusion-color': '#666',
					'fill-extrusion-height': [
						'interpolate',
						['linear'],
						['zoom'],
						13,
						0,
						17,
						['get', 'height']
					],
					'fill-extrusion-base': [
						'interpolate',
						['linear'],
						['zoom'],
						13,
						0,
						17,
						['get', 'min_height']
					],
					'fill-extrusion-opacity': 0.6
				}
			},labelLayerId);

        });
        
        //Marker inkl. Popup bei Haltestellen hinzufügen
        routeStopsGeoJson.features.forEach(function(marker) {
            var el = document.createElement('div');
            el.className = 'stopMarker';

            new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML('<h3>' + marker.properties.title + '</h3>'))
                .addTo(map);
        });

        //Marker inkl. Popup bei POI hinzufügen
        poiGeoJson.features.forEach(function(marker) {
            var el = document.createElement('div');
            el.className = 'poiMarker';

            new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML('<h3>' + marker.properties.title + '</h3>'))
                .addTo(map);
        });
		
		$( document ).ready(function() {
			var currentStatus = {
				locationId: 0,
				correctDirection: true
			}
			
			setInterval(function() {

				if (!isPaused) {
					var nextId;
					if ((currentStatus.correctDirection && currentStatus.locationId < route.length - 1) || (!currentStatus.correctDirection && currentStatus.locationId == 0)) {
						nextId = currentStatus.locationId + 1;
					} else {
						nextId = currentStatus.locationId - 1;
					}

					var bearingAngle = bearing(route[currentStatus.locationId].lat, route[currentStatus.locationId].lon, route[nextId].lat, route[nextId].lon);

					console.log(currentStatus.locationId + ": " + route[currentStatus.locationId].name + "; Next: " + nextId);
					console.log("Bearing: " + bearingAngle);
					console.log("------------");

					map.flyTo({
						center: [
							route[currentStatus.locationId].lon,
							route[currentStatus.locationId].lat
						],
						pitch: 60,
						bearing: bearingAngle,
						zoom: 18
					});

					do {
						if (currentStatus.locationId == route.length - 1) {
							currentStatus.correctDirection = false;
						} else if (currentStatus.locationId == 0) {
							currentStatus.correctDirection = true;
						}

						if (currentStatus.correctDirection) {
							currentStatus.locationId++;
						} else {
							currentStatus.locationId--;
						}
					} while (route[currentStatus.locationId].type != "stop");
				}

			}, 5000);

	  });
})();