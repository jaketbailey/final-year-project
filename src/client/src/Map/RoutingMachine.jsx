import L from 'leaflet';
import { createControlComponent } from '@react-leaflet/core';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import '@gegeweb/leaflet-routing-machine-openroute/dist/leaflet-routing-openroute.min.js'

import './Map.css'

const createRoutingMachineLayer = (props) => {
  // const router = L.Routing.osrmv1({
  //   serviceUrl: 'http://localhost:5000/route/v1',
  //   profile: 'bike',
  //   useHints: false,
  // })

  const apiKey = "5b3ce3597851110001cf624804aafa7570224300b37f2f457b2d5438";
  const router = new L.Routing.OpenRouteService(apiKey, {
    timeout: 30 * 1000, // 30",
        format: "json",                           // default, gpx not yet supported
        host: "https://api.openrouteservice.org", // default if not setting
        service: "directions",                    // default (for routing) 
        api_version: "v2",                        // default
        profile: "cycling-road",                  // default
        routingQueryParams: {
            attributes: [
                "avgspeed",
                "percentage",
            ],
            language: "en",
            maneuvers: "true",
            preference: "recommended",
            elevation: "true",
        },
  })


  const instance = L.Routing.control({
    router,
    waypoints: [
      L.latLng(50.798908,-1.091160),
      L.latLng(50.789560,-1.055250)
    ],
    lineOptions: {
      styles: [{color: '#8367C7', opacity: 1, weight: 3}]
    },
    altLineOptions: {
      styles: [{opacity: 0.5, weight: 3}]
    },
    routeWhileDragging: false,
    show: true,
    draggableWaypoints: true,
    addWaypoints: true,
    fitSelectedRoutes: false,
    showAlternatives: true,
    geocoder: L.Control.Geocoder.nominatim(),
    collapsible: true,
  });

  instance.on('routesfound', (e) => {
    const routes = e.routes;
    const summary = routes[0].summary;
    alert(routes);
    console.log(routes);
    console.log(`Total ascent: ${summary.totalAscend} m`);
    console.log(`Total descent: ${summary.totalDescend} m`);
  });

  return instance;
}

const RoutingMachine = createControlComponent(createRoutingMachineLayer);

export default RoutingMachine;