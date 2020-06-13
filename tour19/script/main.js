var tourInstance = tourSingleton.getInstance();

$("#bottomUI > button").click(function() {
	tourInstance.guideToEntryStop();
    setInterval(function() {
		tourInstance.guideToEntryStop();
	}, 10000);
	
	
    setInterval(function() {
		tourInstance.updateLocation();
    }, 100);
});


$("#pauseBtn").click(function() {
	tourInstance.togglePause();
});

//autoplay through stations
$( document ).ready(function() {
    setInterval(function() {
		tourInstance.nextTramStation();
    }, 5000);
});


//Booring technical stuff
	//ServiceWorker for PWA
	(function() {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.register("sw.js");
		}
	})();