import { LayersControl, MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet'
import RoutingMachine from './RoutingMachine';
import { useEffect, useState, useRef } from 'react';
import { getGPX, createStravaActivity } from './routeHelpers';
import RoutePreferencesPanel from '../RoutePreferencesPanel/RoutePreferencesPanel';
import Modal from '../Modal/Modal';
import ElevationChart from '../ElevationChart/ElevationChart';



/**
 * @function Map
 * @description Creates an Open Street Map component with a route planning engine
 * @param {*} props 
 * @returns Map component
 */
const Map = (props) => {
  const control = useRef(null);
  const [mapCenter, setMapCenter] = useState({lat: 50.798908, lng: -1.091160});
  const [coordinates, setCoordinates] = useState([]);
  const [summary, setSummary] = useState({});
  const [map, setMap] = useState(null);
  const [geoJSON, setGeoJSON] = useState(null);
  const [gpx, setGPX] = useState(null);
  const [avoidFeatures, setAvoidFeatures] = useState([]);
  const [stravaData, setStravaData] = useState({});
  const [instructions, setInstructions] = useState([]);
  const [show, setShow] = useState(false);
  const [showStrava, setShowStrava] = useState(false);
  const [emailData, setEmailData] = useState({});
  const [stravaAccessToken, setStravaAccessToken] = useState(null);
  const [keyPOI, setKeyPOI] = useState(null);
  const [keyPOIMarkers, setKeyPOIMarkers] = useState([]);
  
  const OpenCycleAPIKey = import.meta.env.VITE_OPEN_CYCLE_MAP_API_KEY;
  const StravaKeyPairId = import.meta.env.VITE_STRAVA_HEATMAP_KEY_PAIR_ID;
  const StravaPolicy = import.meta.env.VITE_STRAVA_HEATMAP_POLICY;
  const StravaSignature = import.meta.env.VITE_STRAVA_HEATMAP_SIGNATURE;
  const FoursquareAPIKey = import.meta.env.VITE_FOURSQUARE_API_KEY;

  useEffect(() => {
    if (map) {
        map.on("moveend" , () => {
          setMapCenter(map.getCenter());
        })
      }
  }, [map])

  useEffect(() => {
    const radius = 8046 // 5 miles
    const categories = 19009 // Hotels
    const getPOI = async () => {
      const url = `https://api.foursquare.com/v3/places/search?ll=${mapCenter.lat}%2C${mapCenter.lng}&radius=${radius}&categories=${categories}`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: FoursquareAPIKey
        }
      };

      const response = await fetch(url, options);
      const res = await response.json();
      setKeyPOI(res);
    }
    getPOI();
  }, [mapCenter])

  useEffect(() => {
    const accommodationIcon = L.icon({
      iconUrl: '/img/routing/accommodation.svg',
      iconSize: [30, 110],
      iconAnchor: [15, 68],
      popupAnchor: [-3, -76],
    });

    if (keyPOI) {
      console.log(keyPOI);
      const markerArr = [];
      for (const POI of keyPOI.results) {
        markerArr.push(
          <Marker 
            position={[POI.geocodes.main.latitude, POI.geocodes.main.longitude]} 
            key={POI.fsq_id}
            icon={accommodationIcon}
            >
            <Popup>
              <h3>{POI.name}</h3>
              <ul>
                <li>Open: {POI.closed_bucket}</li>
                <li>{POI.location.address}</li>
                <li>{POI.location.locality}</li>
                <li>{POI.location.region}</li>
                <li>{POI.location.postcode}</li>
              </ul>
            </Popup>
          </Marker>
        )
      }
      console.log(markerArr)
      setKeyPOIMarkers(markerArr);
    }
  }, [keyPOI])

  return (
    <div className='map-outer'>

      <MapContainer 
        id="map" 
        center={[50.798908,-1.091160]} 
        zoom={13} 
        scrollWheelZoom={true}
        zoomControl={true}
        ref={setMap}
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
          <LayersControl.Overlay name="Key POI - Acommodation">
            <LayerGroup>
              {keyPOIMarkers} 
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
        <RoutingMachine
          setCoordinates={setCoordinates}
          setSummary={setSummary}
          setGeoJSONLink={props.setGeoJSONLink} 
          setGeoJSON={setGeoJSON}
          setGPXLink={props.setGPXLink} 
          setGPX={setGPX}
          control={control}
          setInstructions={setInstructions}
        />
      </MapContainer>

      <ElevationChart
        coordinates={coordinates}
        summary={summary}
        mapRef={map}
      />
      <RoutePreferencesPanel
        geoJSONLink={props.geoJSONLink} 
        gpxLink={props.gpxLink}
        geoJSON={geoJSON} 
        gpx={gpx}
        setAvoidFeatures={setAvoidFeatures}
        avoidFeatures={avoidFeatures}
        control={control}
        show={show}
        setShow={setShow}
        showStrava={showStrava}
        setShowStrava={setShowStrava}
        emailData={emailData}
        stravaData={stravaData}
        stravaAccessToken={stravaAccessToken}
        setStravaAccessToken={setStravaAccessToken}
      />
      <Modal 
        id='ShareEmailModal' 
        show={show} 
        setShow={setShow} 
        modalTitle='Share route by email'
        type='email'
        setEmailData={setEmailData}
      />
      <Modal 
        id='ShareStravaModal' 
        show={showStrava} 
        setShow={setShowStrava} 
        modalTitle='Create Strava Activity'
        type='strava'
        setStravaData={setStravaData}
        stravaData={stravaData}
        instructions={instructions}
        coordinates={coordinates}
        stravaAccessToken={stravaAccessToken}
      />
    </div>
  )
}

export default Map;