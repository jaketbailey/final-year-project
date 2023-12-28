import L from 'leaflet';
import { createControlComponent } from '@react-leaflet/core';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
// import '@gegeweb/leaflet-routing-machine-openroute/dist/leaflet-routing-openroute.js'
import '../leaflet-routing-machine-openroute/dist/jtb-leaflet-routing-openroute.js'
import './Map.css'
import { getGPX, exportGPX, getGeoJSON, exportGeoJSON } from './routeHelpers'

/**
 * @function createRoutingMachineLayer
 * @description Creates a route planning engine using the OpenRouteService API
 * @see https://openrouteservice.org/dev/#/api-docs/v2/directions/{profile}/get
 * @param {*} props 
 * @returns RoutingMachineLayer instance
 */
const createRoutingMachineLayer = (props) => {
  const API_KEY = import.meta.env.VITE_ROUTING_MACHINE_API_KEY
  const router = new L.Routing.OpenRouteService(API_KEY, {
    timeout: 30 * 1000, // 30",
        format: "json",                          
        host: "https://api.openrouteservice.org",
        service: "directions",                   
        api_version: "v2",                       
        profile: "cycling-regular",                 
        routingQueryParams: {
            attributes: [
                "avgspeed",
                "percentage",
              ],
            extra_info: [
                "steepness",
                "suitability",
                "surface",
                "waycategory",
                "waytype"
            ],
            options: {
                avoid_features: [],
            },
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
      styles: [{color: '#C70039 ', opacity: 1, weight: 4}]
    },
    altLineOptions: {
      styles: [{opacity: 0.5, weight: 3}]
    },
    routeWhileDragging: false,
    show: true,
    draggableWaypoints: true,
    addWaypoints: true,
    waypointMode: 'connect',
    fitSelectedRoutes: false,
    showAlternatives: true,
    geocoder: L.Control.Geocoder.nominatim(),
    collapsible: false,
    containerClassName: 'routing-container',
    createMarker: function (i, waypoint, n) {
      const marker = L.marker(waypoint.latLng, {
        draggable: true,
        bounceOnAdd: false,
        bounceOnAddOptions: {
          duration: 1000,
          height: 800,
          function() {
            (bindPopup(myPopup).openOn(map))
          }
        },
        icon: L.icon({
          iconUrl: '/img/routing/waypoint.svg',
          iconSize: [30, 110],
          iconAnchor: [15, 68],
          popupAnchor: [-3, -76],
        })
      });
      return marker;
    }

  });

  instance.on('routesfound', (e) => {
    const routes = e.routes;
    props.setCoordinates(routes[0].coordinates);
    props.setInstructions(routes[0].instructions);
    props.setSummary(routes[0].summary);
    routes[0].name = 'Route Summary';
    const geoJSON = getGeoJSON(routes[0].instructions, routes[0].coordinates); 
    const gpx = getGPX(routes[0].instructions, routes[0].coordinates);
    exportGeoJSON(geoJSON, props.setGeoJSON, props.setGeoJSONLink);
    exportGPX(gpx, props.setGPX, props.setGPXLink);
  });

  props.control.current = instance;

  return instance;
}

/**
 * @function RoutingMachine
 * @description Creates a React component from the RoutingMachineLayer instance
 * @param {*} props
 * @returns RoutingMachine component 
 */
const RoutingMachine = createControlComponent(createRoutingMachineLayer);

export default RoutingMachine;