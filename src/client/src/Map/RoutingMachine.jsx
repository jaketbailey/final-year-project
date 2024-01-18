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
  let roundTripLen = 10000;
  const defaultConfig = {
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
      continue_straight: true,
      options: {
          avoid_features: ['ferries']
      },
      language: "en",
      maneuvers: "true",
      preference: "recommended",
      elevation: "true",
  };
  // let roundTripMode = localStorage.getItem('roundTripMode');

  const API_KEY = import.meta.env.VITE_ROUTING_MACHINE_API_KEY
  const router = new L.Routing.OpenRouteService(API_KEY, {
    timeout: 30 * 1000, // 30",
        format: "json",                          
        host: "https://api.openrouteservice.org",
        service: "directions",                   
        api_version: "v2",                       
        profile: "cycling-regular",                 
        routingQueryParams: props.routerConfig.current
  })

  // const router = new L.Routing.OpenRouteService(API_KEY, JSON.parse(localStorage.getItem('routerConfig')))

  function updateTime(select, input) {
    if (!input.value) {
      return;
    };
    //convert hours-minutes into seconds
    const time = input.value.split(':')
    const hours = parseInt(time[0]) * 3600
    const minutes = parseInt(time[1]) * 60
    const secondsTime = hours + minutes
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
    L.DomUtil.create('br', '', container);
    L.DomUtil.create('br', '', container);
    const outerDiv = L.DomUtil.create('div', 'timeControls', container);
    const select = L.DomUtil.create('select', '', outerDiv);
    const leaveTime = L.DomUtil.create('option', '', select);
    const arriveTime = L.DomUtil.create('option', '', select);
    select.setAttribute('id', 'select-time-dropdown')
    select.setAttribute('style', 'width: 45%; height: 1.65rem')
    leaveTime.textContent = 'Leave Time';
    arriveTime.textContent = 'Arrive Time';
    
    const input = L.DomUtil.create('input', '', outerDiv);
    input.setAttribute('id', 'select-time-input')
    input.setAttribute('type', 'time');
    input.setAttribute('style', 'width: 45%; height: 1.60rem')

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

  /**
   * Toggle the display of additional waypoints and controls for adding/removing waypoints.
   *
   * @param {boolean} checked - Whether the toggle is checked or not.
   */
  const removeAddWaypoints = (checked, container) => {
    const waypointInputs = container.querySelectorAll('.leaflet-routing-geocoder');
    const waypointRemoveButtons = container.querySelectorAll('.leaflet-routing-remove-waypoint');
    const waypointMarkers = container.querySelectorAll('.leaflet-marker-icon');

    const addWaypointBtn = container.querySelector('.leaflet-routing-add-waypoint');
    const reverseRouteBtn = container.querySelector('.leaflet-routing-reverse-waypoints'); 
    
    addWaypointBtn.style.display = checked ? 'none' : 'block';
    reverseRouteBtn.style.display = checked ? 'none' : 'block';

    const styles = [{color: '#C70039 ', opacity: 1, weight: 4}]
    instance.updateLineOptions(!checked, styles);

    waypointInputs.forEach((input, index) => {
      if (index > 0) {
        input.style.display = checked ? 'none' : 'block';
      }
    });

    waypointRemoveButtons.forEach((btn, index) => {
      btn.style.display = checked ? 'none' : 'block';
    });
  
    waypointMarkers.forEach((marker, index) => {
      if (index > 0) {
        marker.style.display = checked ? 'none' : 'block';
      }
    });
  }
  
  /**
 * Switch between round trip mode and regular mode, enabling/disabling round trip options.
 *
 * @param {boolean} checked - Whether the round trip toggle is checked or not.
 * @param {HTMLElement} roundTripDistanceInput - The input element for round trip distance.
 */
  const switchModes = (checked, roundTripDistanceInput) => {
    console.log('checked', checked)
    if (!checked) {
        // Remove round trip options
        roundTripDistanceInput.setAttribute('disabled', 'true');
        console.log(instance.getRouter())

        if (instance.getRouter().options.routingQueryParams.options.round_trip) {
          delete instance.getRouter().options.routingQueryParams.options.round_trip;
          instance.setWaypoints(JSON.parse(localStorage.getItem('waypoints')));
          console.log(instance.getRouter().options.routingQueryParams)
          localStorage.setItem('routerConfig', JSON.stringify(instance.getRouter().options.routingQueryParams))
          instance.route();
          instance.draggableWaypoints = true;
        }
      } else {
        // Add round trip options
        roundTripDistanceInput.removeAttribute('disabled');
        const wpts = instance.getWaypoints();
        const waypoints = [wpts[0], wpts[0]];
        instance.setWaypoints(waypoints);
        instance.getRouter().options.routingQueryParams.options.round_trip = {
          length: roundTripLen,
          points: 5,
          seed:5
        };
        console.log(instance.getRouter().options.routingQueryParams)
        localStorage.setItem('routerConfig', JSON.stringify(instance.getRouter().options.routingQueryParams))
        instance.route();
        instance.draggableWaypoints = false;
      }
  }

  /**
 * Create and initialize a round trip toggle control in the specified container.
 *
 * @param {HTMLElement} container - The container element in which the round trip toggle will be created.
 * @returns {Array} An array containing label and input elements of the round trip toggle.
 */
  function createRoundTripToggle(container) {
    const outerDiv = L.DomUtil.create('div', 'roundTripControls', container)
    const label = L.DomUtil.create('label', '', outerDiv);
    const input = L.DomUtil.create('input', '', outerDiv);
    label.setAttribute('for', 'round-trip-toggle');
    label.textContent = 'Round Trip';
    // label.setAttribute('style', 'margin: 0.5rem, 0.5rem')
    input.setAttribute('id', 'round-trip-toggle');
    input.setAttribute('type', 'checkbox');
    
    console.log(input.checked)
    const distanceLabel = L.DomUtil.create('label', '', outerDiv);
    const roundTripDistanceInput = L.DomUtil.create('input', '', outerDiv);
    distanceLabel.setAttribute('for', 'round-trip-distance-input');
    distanceLabel.textContent = 'Distance (km)';
    distanceLabel.setAttribute('style', 'margin-left: 0.5rem')
    roundTripDistanceInput.setAttribute('id', 'round-trip-distance-input');
    roundTripDistanceInput.setAttribute('type', 'number');
    roundTripDistanceInput.setAttribute('min', '2');
    roundTripDistanceInput.setAttribute('max', '200');
    roundTripDistanceInput.setAttribute('step', '1');
    roundTripDistanceInput.setAttribute('value', localStorage.getItem('roundTripDistance'));
    roundTripDistanceInput.setAttribute('style', 'width: 5rem; height: 1.60rem')
    roundTripDistanceInput.setAttribute('disabled', 'true');

    if (localStorage.getItem('roundTripMode') === 'true') {
      input.setAttribute('checked', 'true');
      roundTripDistanceInput.removeAttribute('disabled');
      removeAddWaypoints(localStorage.getItem('roundTripMode'), container);
    } else {
      input.removeAttribute('checked');
    }

    if (props.roundTripMode.current) {
      instance.getRouter().options.routingQueryParams.options.round_trip = {
        length: roundTripLen,
        points: 5,
        seed:5
      };
      instance.getRouter().route();
    }
    
    input.addEventListener('change', (e) => {
      props.roundTripMode.current = e.target.checked;
      
      switchModes(e.target.checked, roundTripDistanceInput);
      removeAddWaypoints(e.target.checked, document);
    });
    
    roundTripDistanceInput.addEventListener('change', (e) => {
      localStorage.setItem('roundTripDistance', e.target.value);
      roundTripLen = parseInt(e.target.value) * 1000;
      instance.getRouter().options.routingQueryParams.options.round_trip.length = roundTripLen;
      instance.route();
    });  
    return [label, input];
  }

  const Plan = L.Routing.Plan.extend({
    createGeocoders: function() { 
      const container = L.Routing.Plan.prototype.createGeocoders.call(this);
      createTimeInput(container);
      createRoundTripToggle(container);
      return container;
    }
  });

  let wpts = JSON.parse(localStorage.getItem('waypoints'));
  console.log(wpts)
  if (wpts === null) {
    wpts = [
      [50.798061,-1.060741],
      [50.780372,-1.073965],
    ];
    props.setWaypoints(wpts);
  } else {
    const loadRoute = confirm('Load previous route?'); 
    if (loadRoute === true) {
      const planWaypoints = [];
      for (const wpt of wpts) {
        planWaypoints.push(L.latLng(wpt[0], wpt[1]));
      }
      wpts = planWaypoints;
    } else {
      localStorage.setItem('routerConfig', JSON.stringify(defaultConfig));
      props.routerConfig.current = defaultConfig;
      wpts = [
        [50.798061,-1.060741],
        [50.780372,-1.073965],
      ];
    }
    props.setWaypoints(wpts);
  }

  
  const plan = new Plan(wpts, {
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
      console.log(i,n)
      if (i === 0 || i === n - 1) {
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
      } else {
        return null;
      }
    }
  });

  const Control = L.Routing.Control.extend({
    updateLineOptions: function (addWaypoints, styles) {
      this.options.lineOptions.addWaypoints = addWaypoints;
      this.options.lineOptions.styles = styles;
      return this;
    }
  });

  const instance = new Control({
    router,
    plan,
    collapsible: false,
    lineOptions: {
      styles: [{color: '#C70039 ', opacity: 1, weight: 4}],
      addWaypoints: true
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
    let wpts = instance.getWaypoints();
    console.log(wpts)
    
    if (wpts[1].latLng === null && props.roundTripMode === true) {
      const waypoints = [wpts[0], wpts[0]]
      instance.setWaypoints(waypoints);
      const tempArr = [wpts[0].latLng.lat, wpts[0].latLng.lng]
      props.setWaypoints([tempArr]);
      return
    } else {
      wpts = instance.getWaypoints();
      if (wpts.length > 0) {
        const tempArr = [];
        for (const wpt of wpts) {
          tempArr.push([wpt.latLng.lat, wpt.latLng.lng]);
        }
        props.setWaypoints(tempArr);
      }
      return;
    }

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