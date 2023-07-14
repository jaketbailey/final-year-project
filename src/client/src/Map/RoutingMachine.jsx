import L from 'leaflet';
import { createControlComponent } from '@react-leaflet/core';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import '@gegeweb/leaflet-routing-machine-openroute/dist/leaflet-routing-openroute.min.js'
import Openrouteservice from 'openrouteservice-js'

import './Map.css'

const createRoutingMachineLayer = (props) => {
  
  const apiKey = "5b3ce3597851110001cf624804aafa7570224300b37f2f457b2d5438";
  const router = new L.Routing.OpenRouteService(apiKey, {
    timeout: 30 * 1000, // 30",
        format: "json",                          
        host: "https://api.openrouteservice.org",
        service: "directions",                   
        api_version: "v2",                       
        profile: "cycling-road",                 
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
      styles: [{color: '#3454D1', opacity: 1, weight: 3}]
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
    containerClassName: 'routing-container',
  });

  instance.on('routesfound', (e) => {
    const routes = e.routes;
    props.setCoordinates(routes[0].coordinates);
    props.setSummary(routes[0].summary);
    console.log(routes);
  });

  return instance;
}

const RoutingMachine = createControlComponent(createRoutingMachineLayer);

export default RoutingMachine;