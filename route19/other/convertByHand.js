function convertToGeoJson(route) {
    var newGeoJson = [];
    
    route.forEach(function(item) {
      newGeoJson.push([item.lon, item.lat]);
    });
    
    console.log(JSON.stringify(newGeoJson));
  }

  function round(number, decimal) {
    return Math.round(number * Math.pow(10, decimal)) / Math.pow(10, decimal);
  }
  
  function convertToRoute(geoJson, route) {
    var newRoute = [];
    geoJson.forEach(function(geoItem) {
      var routeMatch;
      route.forEach(function(routeItem) {
        if (round(geoItem[0],4) == round(routeItem.lon,4) && round(geoItem[1],4) == round(routeItem.lat,4) && routeItem.type == 'stop') {
          routeMatch = routeItem;
        }
      });
      
      if (routeMatch) {
        newRoute.push(routeMatch);
      } else {
        var newRouteItemObject = {
          type: "graph",
          lat: round(geoItem[1],5),
          lon: round(geoItem[0],5)
        }
        
        newRoute.push(newRouteItemObject);
      }
      
    });
    console.log(JSON.stringify(newRoute));
  }

  //Howto: Funktionen in DevConsole kopieren, korrekte Variablen erstellen und anschließend Funktion aufrufen
  
  //https://google-developers.appspot.com/maps/documentation/utils/geojson/
  //https://jsonformatter.org/