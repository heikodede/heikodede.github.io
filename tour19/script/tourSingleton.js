var tourSingleton = (function () {

    // Instance stores a reference to the Singleton
    var instance;

    function init() {

        var prvt_mapInstance = mapSingleton.getInstance();
        var prvt_state = {
            paused: true,
            tram: {
                locationId: 0,
                correctDirection: true
            }
        };

        function prvt_nextTramStation() {
            if (!prvt_state.paused) {
                var nextId;
                if ((prvt_state.tram.correctDirection && prvt_state.tram.locationId < route.length - 1) || (!prvt_state.tram.correctDirection && prvt_state.tram.locationId == 0)) {
                    nextId = prvt_state.tram.locationId + 1;
                } else {
                    nextId = prvt_state.tram.locationId - 1;
                }

                prvt_mapInstance.flyTo({
                    center: route[prvt_state.tram.locationId],
                    lookAt: route[nextId]
                });
    
                do {
                    if (prvt_state.tram.locationId == route.length - 1) {
                        prvt_state.tram.correctDirection = false;
                    } else if (prvt_state.tram.locationId == 0) {
                        prvt_state.tram.correctDirection = true;
                    }
    
                    if (prvt_state.tram.correctDirection) {
                        prvt_state.tram.locationId++;
                    } else {
                        prvt_state.tram.locationId--;
                    }
                } while (route[prvt_state.tram.locationId].type != "stop");
            }
        }

        function prvt_togglePause(newVal) {
            if (typeof newVal == "undefined") {
                prvt_state.paused = !prvt_state.paused;
                $("#pauseBtn").toggleClass("paused");
            } else {
                alert("not implemented yet")
            }
        }

        function prvt_guideToEntryStop() {
            navigator.geolocation.getCurrentPosition(function(position){
                var myPos = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude 
                };
        
                var nearestStop = {
                    locationId: undefined,
                    item: undefined,
                    distance: undefined
                };
        
                route.forEach( (item, index) => {
                    if (item.type == "stop") {
                        if (typeof nearestStop.item == 'undefined') {
                            nearestStop.item = item;
                            nearestStop.locationId = index;
                            nearestStop.distance = distance(myPos.lat, myPos.lon, item.lat, item.lon);
                        } else {
                            if ( distance(myPos.lat, myPos.lon, item.lat, item.lon) < nearestStop.distance ) {
                                nearestStop.item = item;
                                nearestStop.locationId = index;
                                nearestStop.distance = distance(myPos.lat, myPos.lon, item.lat, item.lon);
                            }
                        }
                    }
                });
        
                tourInstance.state.tram.locationId = nearestStop.locationId;
                getRouting(myPos.lat, myPos.lon, nearestStop.item.lat, nearestStop.item.lon).then( (routeToStop) => {
                    //neue Layer mit Routenlinie

                    prvt_mapInstance.addLine({id: "routeToEntryStop", route: routeToStop.geometry.coordinates});
                    prvt_mapInstance.flyTo({
                        center: myPos,
                        lookAt: {
                            lon: routeToStop.geometry.coordinates[1][0],
                            lat: routeToStop.geometry.coordinates[1][1]
                        }
                    });
                });
        
        
            }, function(error) {
                alert("unable to retrieve location");
            });
        }

        return {
            // Public methods and variables
            //publicfuntion: prvt_myfunction,
            state: prvt_state,
            nextTramStation: prvt_nextTramStation,
            togglePause: prvt_togglePause,
            guideToEntryStop: prvt_guideToEntryStop
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