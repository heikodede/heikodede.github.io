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
            prvt_mapInstance.updateLocation().then( (position) => {
                routeToNearestStop(position).then( (nearestStop) => {
                    tourInstance.state.tram.locationId = nearestStop.stop.locationId;
                    prvt_mapInstance.addLine({id: "routeToEntryStop", route: nearestStop.route.geometry.coordinates, unique: true});
                    prvt_mapInstance.flyTo({
                        center: position,
                        lookAt: {
                            lon: nearestStop.route.geometry.coordinates[1][0],
                            lat: nearestStop.route.geometry.coordinates[1][1]
                        }
                    });
                });
            });
        }

        return {
            // Public methods and variables
            //publicfuntion: prvt_myfunction,
            state: prvt_state,
            nextTramStation: prvt_nextTramStation,
            togglePause: prvt_togglePause,
            guideToEntryStop: prvt_guideToEntryStop,
            updateLocation: prvt_mapInstance.updateLocation
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