var mapSingleton = (function () {

    // Instance stores a reference to the Singleton
    var instance;

    function init() {

        var prvt_map;
        var prvt_state = {
            defaultLayers: {
                buildings3d: false,
                controls: false
            }
        };

        function prvt_addBuildings3d() {
            prvt_state.defaultLayers.buildings3d = true;

            var layers = prvt_map.getStyle().layers;
            var labelLayerId;
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                    labelLayerId = layers[i].id;
                    break;
                }
            }

            prvt_map.addLayer({
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
        }

        function prvt_addControls() {
            prvt_state.defaultLayers.controls = true;
            prvt_map.addControl(new mapboxgl.NavigationControl());
            prvt_map.addControl(
                new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    trackUserLocation: true
                })
            );
        }

        function prvt_addLine(settings) {
            //Vorbehandeln von Koordinaten
            var finalCoords;
            if (settings.transform == true) {
                finalCoords = [];
                settings.route.forEach((item) => {
                    finalCoords.push([item.lon, item.lat]);
                });
            } else {
                finalCoords = settings.route;
            }

            //neue Layer mit Routenlinie
            prvt_map.addLayer({
                id: settings.id,
                type: 'line',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: finalCoords
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
        }

        function prvt_addPOIs(settings) {
            //Marker inkl. Popup hinzufügen
            settings.geoJson.features.forEach(function(marker) {
                var el = document.createElement('div');
                el.className = settings.className;

                new mapboxgl.Marker(el)
                    .setLngLat(marker.geometry.coordinates)
                    .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                        .setHTML('<h3>' + marker.properties.title + '</h3>'))
                    .addTo(prvt_map);
            });
        }

        function prvt_flyTo(settings) {
            var bearingAngle = bearing(settings.center.lat, settings.center.lon, settings.lookAt.lat, settings.lookAt.lon);
            prvt_map.flyTo({
                center: [
                    settings.center.lon,
                    settings.center.lat
                ],
                pitch: 60,
                bearing: bearingAngle,
                zoom: 18
            });
        }

        //create new map when init
        (function(){
            mapboxgl.accessToken = 'pk.eyJ1IjoiaGVpa29kZSIsImEiOiJjazRlNmpkYTIwOXRiM25vM3o0bnpkcDUwIn0.n5uKXIwegkQnozYiCbmEIw';
            prvt_map = new mapboxgl.Map({
                container: 'mapContainer',
                style: 'mapbox://styles/mapbox/dark-v10',
                center: [11.5761, 48.1371],
                zoom: 12,
                antialias: true
            });

            prvt_map.on('load', function() {
                prvt_addBuildings3d();
                prvt_addControls();
                prvt_addLine({id: "tramRoute", route: route, transform: true});
                prvt_addPOIs({geoJson: routeStopsGeoJson, className: 'stopMarker'});
                prvt_addPOIs({geoJson: poiGeoJson, className: 'poiMarker'});
            });
        })();

        return {
            // Public methods and variables
            addLine: prvt_addLine,
            flyTo: prvt_flyTo
        };

    };

    return {
        // Get the Singleton instance if one exists
        // or create one if it doesn't
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };

})();