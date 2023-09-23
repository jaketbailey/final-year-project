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
        setSummary={props.setSummary}
        setGeoJSONLink={props.setGeoJSONLink} 
        setGeoJSON={props.setGeoJSON}
        setGPXLink={props.setGPXLink} 
        setGPX={props.setGPX}
        control={props.control}
        dateTime={props.dateTime}
      />
    </MapContainer>
  )
}

export default Map;