import L from 'leaflet';
import { createControlComponent } from '@react-leaflet/core';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import '@gegeweb/leaflet-routing-machine-openroute/dist/leaflet-routing-openroute.min.js'

import './Map.css'

/**
 * @function createRoutingMachineLayer
 * @description Creates a route planning engine using the OpenRouteService API
 * @see https://openrouteservice.org/dev/#/api-docs/v2/directions/{profile}/get
 * @param {*} props 
 * @returns RoutingMachineLayer instance
 */
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

  const getGeoJSON = (instructions, coordinates) => {
    const formatter = new L.Routing.Formatter();
    const instructionPts = {
      type: 'FeatureCollection',
      features: []
    };

    for (const instruction of instructions) {
      const g = {
        type: 'Point',
        coordinates: [coordinates[instruction.index].lng, coordinates[instruction.index].lat],
      }

      const p = {
        instruction: formatter.formatInstruction(instruction),
      };

      instructionPts.features.push({
        geometry: g,
        type: 'Feature',
        properties: p,
      });
    }
    
    for (const [index, coordinate] of coordinates.entries()) {
      let g; 
      
      if (index === 0) {
        g = {
          type: 'LineString',
          coordinates: [coordinate.lng, coordinate.lat],
        };
      } else {        
        g = {
          type: 'LineString',
          coordinates: [[coordinates[index-1].lng, coordinates[index-1].lat], [coordinate.lng, coordinate.lat]],
        };
      }
      instructionPts.features.push({
        geometry: g,
        type: 'Feature',
        properties: {},
      });
    }
    
    return instructionPts;
  }

  const exportGeoJSON = (geoJSON) => {
    const data = JSON.stringify(geoJSON);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'route.geojson';
    link.href = url;
    link.click();
  }

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
    routes[0].name = 'Route Summary';
    const geoJSON = getGeoJSON(routes[0].instructions, routes[0].coordinates); 
    console.log(geoJSON);
    exportGeoJSON(geoJSON);
  });

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