import L from 'leaflet';
import { createControlComponent } from '@react-leaflet/core';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import '@gegeweb/leaflet-routing-machine-openroute/dist/leaflet-routing-openroute.min.js'
import './Map.css'
import { useEffect } from 'react';

/**
 * @function createRoutingMachineLayer
 * @description Creates a route planning engine using the OpenRouteService API
 * @see https://openrouteservice.org/dev/#/api-docs/v2/directions/{profile}/get
 * @param {*} props 
 * @returns RoutingMachineLayer instance
 */
const createRoutingMachineLayer = (props) => {
  // const apiKey = "5b3ce3597851110001cf624804aafa7570224300b37f2f457b2d5438";
  const apiKey = "5b3ce3597851110001cf6248b6ff7d6cab1c42b0a902f23e68a53ce6";
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
            options: {
                avoid_features: [],
            },
            language: "en",
            maneuvers: "true",
            preference: "recommended",
            elevation: "true",
        },
  })

  /**
   * @function getGeoJSON
   * @param {Array} instructions 
   * @param {Array} coordinates 
   * @description Creates a GeoJSON object from the route instructions and coordinates
   * @returns GeoJSON object
   */
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

  /**
   * @function exportGPX
   * @param {Object} geoJSON
   * @description Exports the GeoJSON object as a .geojson file
   * @returns null
   */
  const exportGPX = (gpx) => { 
    const blob = new Blob([gpx], {type: 'text/xml'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'route.gpx';
    link.href = url;
    props.setGPX(gpx);
    props.setGPXLink(link);
  }

  /**
   * @function getGPX
   * @param {Array} instructions
   * @param {Array} coordinates
   * @description Creates a GPX file from the route instructions and coordinates
   * @returns GPX file
   * @see https://www.topografix.com/GPX/1/1/
   */
  const getGPX = (instructions, coordinates) => {
    const formatter = new L.Routing.Formatter();
    const currentTime = new Date().toISOString();
    let gpx = '<?xml version="1.0" encoding="UTF-8"?>\n';
    gpx += '<gpx version="1.1" creator="Cycling Route Planner" xmlns="http://www.topografix.com/GPX/1/1">\n';

    // Add waypoints for each instruction
    for (const instruction of instructions) {
      gpx += `  <wpt lat="${coordinates[instruction.index].lat}" lon="${coordinates[instruction.index].lng}">\n`;
      gpx += `    <name>${formatter.formatInstruction(instruction)}</name>\n`;
      gpx += `  </wpt>\n`;
    }

    // Add tracks for each coordinate
    gpx += `  <trk>\n    <trkseg>\n`;
    for (const coordinate of coordinates) {
      gpx += `      <trkpt lat="${coordinate.lat}" lon="${coordinate.lng}">\n`;
      gpx += `        <ele>${coordinate.alt}</ele>\n`;
      gpx += `        <time>${currentTime}</time>\n`;
      gpx += '      </trkpt>\n';
    }
    gpx += `    </trkseg>\n  </trk>\n`;
    gpx += '</gpx>';
    return gpx;
  }

  /**
   * @function exportGeoJSON
   * @param {Object} geoJSON
   * @description Exports the GeoJSON object as a .geojson file
   * @returns null
   */
  const exportGeoJSON = (geoJSON) => {
    const data = JSON.stringify(geoJSON);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'route.geojson';
    link.href = url;
    props.setGeoJSON(data);
    props.setGeoJSONLink(link); 
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
    console.log(props.dateTime);
    console.log('datetime')
    const gpx = getGPX(routes[0].instructions, routes[0].coordinates);
    exportGeoJSON(geoJSON);
    exportGPX(gpx);
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