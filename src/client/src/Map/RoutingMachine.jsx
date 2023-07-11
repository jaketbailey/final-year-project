import L from 'leaflet';
import { createControlComponent } from '@react-leaflet/core';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';

const createRoutingMachineLayer = (props) => {
  const router = L.Routing.osrmv1({
    serviceUrl: 'http://localhost:5000/route/v1',
    profile: 'bike',
    useHints: false,
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
    show: false,
    draggableWaypoints: true,
    addWaypoints: true,
    fitSelectedRoutes: false,
    showAlternatives: true,
    geocoder: L.Control.Geocoder.nominatim(),
  });
  return instance;
}

const RoutingMachine = createControlComponent(createRoutingMachineLayer);

export default RoutingMachine;