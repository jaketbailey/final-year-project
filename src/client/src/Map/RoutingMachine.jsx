import L from 'leaflet';
import { createControlComponent } from '@react-leaflet/core';
import 'leaflet-routing-machine';

const createRoutingMachineLayer = (props) => {
  const instance = L.Routing.control({
    waypoints: [
      L.latLng(50.798908,-1.091160),
      L.latLng(50.7833823,-1.0888348),
      L.latLng(50.789560,-1.055250)
    ],
    lineOptions: {
      styles: [{color: '#8367C7', opacity: 1, weight: 3}]
    },
    routeWhileDragging: false,
    show: false,
    draggableWaypoints: true,
    addWaypoints: false,
    fitSelectedRoutes: true,
    showAlternatives: true,
  });
  return instance;
}

const RoutingMachine = createControlComponent(createRoutingMachineLayer);

export default RoutingMachine;