import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import RoutingMachine from './RoutingMachine';

const Map = () => {
  return (
    <MapContainer center={[50.798908,-1.091160]} zoom={13} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RoutingMachine />
    </MapContainer>
  )
}

export default Map; 