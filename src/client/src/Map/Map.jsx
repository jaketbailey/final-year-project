import { LayersControl, MapContainer, TileLayer } from 'react-leaflet'
import RoutingMachine from './RoutingMachine';
import { useEffect, useState } from 'react';
import { getGPX, createStravaActivity } from './routeHelpers';

/**
 * @function Map
 * @description Creates an Open Street Map component with a route planning engine
 * @param {*} props 
 * @returns Map component
 */
const Map = (props) => {
  const OpenCycleAPIKey = import.meta.env.VITE_OPEN_CYCLE_MAP_API_KEY;
  const StravaKeyPairId = import.meta.env.VITE_STRAVA_HEATMAP_KEY_PAIR_ID;
  const StravaPolicy = import.meta.env.VITE_STRAVA_HEATMAP_POLICY;
  const StravaSignature = import.meta.env.VITE_STRAVA_HEATMAP_SIGNATURE;
  return (
    <MapContainer 
      id="map" 
      center={[50.798908,-1.091160]} 
      zoom={13} 
      scrollWheelZoom={true}
      zoomControl={true}
      ref={props.setMap}
    >
      <LayersControl position='topleft'>
        <LayersControl.BaseLayer checked name="CyclOSM">
          <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. Tiles style by <a href="https://www.cyclosm.org/">CyclOSM</a> hosted by <a href="https://openstreetmap.fr/">Open Street Map France</a>.'
          url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
        />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Open Cycle Map">
          <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. Tiles courtesy of <a href="https://www.thunderforest.com/">Andy Allan</a>.'
          url={`https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=${OpenCycleAPIKey}`}
        />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Open Street Map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.Overlay name="Strava Heatmap">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={`https://heatmap-external-a.strava.com/tiles-auth/ride/hot/{z}/{x}/{y}.png?Key-Pair-Id=${StravaKeyPairId}&Policy=${StravaPolicy}&Signature=${StravaSignature}`}
            opacity="0.5"
          />
        </LayersControl.Overlay>
      </LayersControl>
      <RoutingMachine
        setCoordinates={props.setCoordinates}
        setSummary={props.setSummary}
        setGeoJSONLink={props.setGeoJSONLink} 
        setGeoJSON={props.setGeoJSON}
        setGPXLink={props.setGPXLink} 
        setGPX={props.setGPX}
        control={props.control}
        setInstructions={props.setInstructions}
      />
    </MapContainer>
  )
}

export default Map;