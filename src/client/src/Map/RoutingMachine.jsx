import L from 'leaflet';
import { createControlComponent } from '@react-leaflet/core';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
// import '@gegeweb/leaflet-routing-machine-openroute/dist/leaflet-routing-openroute.js'
import '../leaflet-routing-machine-openroute/dist/jtb-leaflet-routing-openroute.js'
import './Map.css'
import { useMap } from 'react-leaflet';
import { getGPX, exportGPX, getGeoJSON, exportGeoJSON } from './routeHelpers'

/**
 * @function createRoutingMachineLayer
 * @description Creates a route planning engine using the OpenRouteService API
 * @see https://openrouteservice.org/dev/#/api-docs/v2/directions/{profile}/get
 * @param {*} props 
 * @returns RoutingMachineLayer instance
 */
const createRoutingMachineLayer = (props) => {
  let map = useMap();
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
                round_trip: {
                  length: 10000,
                  points: 5
                }
            },
            language: "en",
            maneuvers: "true",
            preference: "recommended",
            elevation: "true",
        },
  })

  function updateTime(select, input) {
    if (!input.value) {
      return;
    };
    //convert hours-minutes into seconds
    const time = input.value.split(':')
    const hours = parseInt(time[0]) * 3600
    const minutes = parseInt(time[1]) * 60
    const secondsTime = hours + minutes
    console.log(secondsTime)
    console.log(props.summary)
    let leaveArrive,
      seconds;
    if (select.value === 'Leave Time') {
      seconds = Math.round(secondsTime + props.summary.totalTime)
      leaveArrive = 'Leave';
    } else if (select.value === 'Arrive Time'){
      seconds = Math.round(secondsTime - props.summary.totalTime)
      leaveArrive = 'Arrive';
    } else {
      return;
    };
    const finalHours = Math.floor(seconds / 3600);
    const finalMinutes = Math.floor((seconds - finalHours * 3600) / 60);
    const finalTime = `${finalHours}:${finalMinutes}`;
    console.log(`${leaveArrive} Time is ${finalTime}`);
    const leafletRoutingAlt = document.querySelector('.leaflet-routing-alt');
    const h3 = document.createElement('h3');
    
    if (leaveArrive === 'Leave') {
      h3.textContent = `Expected arrival time: ${finalTime}`;
    } else {
      h3.textContent = `Approximate leave time: ${finalTime}`;
    }

    if (leafletRoutingAlt.childNodes[2].nodeName === 'H3') {
      leafletRoutingAlt.removeChild(leafletRoutingAlt.childNodes[2]);
    };
    leafletRoutingAlt.insertBefore(h3, leafletRoutingAlt.childNodes[2]);
  }

  function createTimeInput(container) {
    console.log(container)
    const select = L.DomUtil.create('select', '', container);
    const leaveTime = L.DomUtil.create('option', '', select);
    const arriveTime = L.DomUtil.create('option', '', select);
    select.setAttribute('id', 'select-time-dropdown')
    select.setAttribute('style', 'width: 6rem; height: 1.65rem')
    leaveTime.textContent = 'Leave Time';
    arriveTime.textContent = 'Arrive Time';
    
    const input = L.DomUtil.create('input', '', container);
    input.setAttribute('id', 'select-time-input')
    input.setAttribute('type', 'time');
    input.setAttribute('style', 'width: 5rem; height: 1.60rem')

    // Add listeners
    select.addEventListener('change', (e) => {
      const inputData = document.querySelector('#select-time-input');
      updateTime(e.target, inputData);
    })

    input.addEventListener('change', (e) => {
      const selectData = document.querySelector('#select-time-dropdown');
      updateTime(selectData, e.target);
    })

    return input;
  }

  const Plan = L.Routing.Plan.extend({
    createGeocoders: function() {
      const container = L.Routing.Plan.prototype.createGeocoders.call(this);
      createTimeInput(container);
      return container;
    }
  });

  const plan = new Plan([
      L.latLng(50.798908,-1.091160),
      L.latLng(50.789560,-1.055250)
    ], {
    routeWhileDragging: false,
    show: true,
    draggableWaypoints: true,
    addWaypoints: true,
    reverseWaypoints: true,
    waypointMode: 'snap',
    fitSelectedRoutes: false,
    showAlternatives: true,
    geocoder: L.Control.Geocoder.nominatim(),
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

  const instance = L.Routing.control({
    router,
    plan,
    collapsible: false,
    lineOptions: {
      styles: [{color: '#C70039 ', opacity: 1, weight: 4}]
    },
    altLineOptions: {
      styles: [{opacity: 0.5, weight: 3}]
    },
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
    setTimeout(() => {
      props.chartRef.current.resetZoom();
      props.chartRef.current.update();
    }, 500);
  });

  instance.on('waypointschanged', (e) => {
    const wpts = instance.getWaypoints();
    if (wpts[1].latLng !== null) {
      return;
    }
    wpts.pop();
    console.log(e)
    console.log(wpts)
    console.log(instance)
    instance.getRouter().route(wpts, (error, routes) => {
      console.log(error)
      console.log(routes)
      console.log(map)

      if (!error) {
          // Handle the routes here
          if(map) {
            const routeLayer = L.layerGroup().addTo(map)
            const routePolyline = new L.Routing.line(routes[0], {options: {color: '#C70039 ', opacity: 1, weight: 4}});

            routePolyline.addTo(routeLayer);
          }
      } else {
        console.error(error)
      }
    });      
  })

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