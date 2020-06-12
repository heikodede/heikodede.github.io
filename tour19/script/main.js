var tourInstance = tourSingleton.getInstance();

$("#bottomUI > button").click(function() {
	tourInstance.guideToEntryStop();
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