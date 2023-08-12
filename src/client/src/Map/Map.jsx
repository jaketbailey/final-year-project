import { MapContainer, TileLayer } from 'react-leaflet'
import RoutingMachine from './RoutingMachine';
import { useEffect, useState } from 'react';

/**
 * @function Map
 * @description Creates an Open Street Map component with a route planning engine
 * @param {*} props 
 * @returns Map component
 */
const Map = (props) => {
  const [instructions, setInstructions] = useState([]); 
  const [geoJSON, setGeoJSON] = useState(null);
  useEffect(() => {
    console.log(props.coordinates)
  }, [props.coordinates])


  return (
    <MapContainer 
      id="map" 
      center={[50.798908,-1.091160]} 
      zoom={13} 
      scrollWheelZoom={true}
      zoomControl={true}
      ref={props.setMap}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RoutingMachine
        setCoordinates={props.setCoordinates}
        coordinates={props.coordinates}
        setSummary={props.setSummary}
        setInstructions={setInstructions}
        instructions={instructions}
        setGeoJSON={setGeoJSON} 
      />
    </MapContainer>
  )
}

export default Map;