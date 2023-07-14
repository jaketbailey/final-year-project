import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import RoutingMachine from './RoutingMachine';
import { useEffect, useState } from 'react';

const Map = () => {
  const [coordinates, setCoordinates] = useState([])

  useEffect(() => {
    console.log(coordinates)
  }, [coordinates])

  return (
    <MapContainer 
      id="map" 
      center={[50.798908,-1.091160]} 
      zoom={13} 
      scrollWheelZoom={true}
      zoomControl={false}
    >
      
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomleft" />
      <RoutingMachine
        setCoordinates={setCoordinates}
      />
    </MapContainer>
  )
}

export default Map; 