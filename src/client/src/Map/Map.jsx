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
  const chartRef = useRef(null);
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
  const [segmentDistance, setSegmentDistance] = useState(0);
  
  const OpenCycleAPIKey = import.meta.env.VITE_OPEN_CYCLE_MAP_API_KEY;
  const StravaKeyPairId = import.meta.env.VITE_STRAVA_HEATMAP_KEY_PAIR_ID;
  const StravaPolicy = import.meta.env.VITE_STRAVA_HEATMAP_POLICY;
  const StravaSignature = import.meta.env.VITE_STRAVA_HEATMAP_SIGNATURE;
  const FoursquareAPIKey = import.meta.env.VITE_FOURSQUARE_API_KEY;

  const getDistance = (coords1, coords2) => {
    const deg2rad = (deg) => {
      return deg * (Math.PI/180)
    }

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(coords2.lat-coords1.lat);
    const dLon = deg2rad(coords2.lon-coords1.lon);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(coords1.lat)) * Math.cos(deg2rad(coords2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  }

  const setRouteWaypoint = (coords, to) => {
    const currentWaypoints = control.current._plan._waypoints;
    
    // Check if to boolean is present, final element in waypoint array is replaced with new coordinates
    if (to) {
      console.log(currentWaypoints)
      const length = currentWaypoints.length;
      control.current.spliceWaypoints(length-1,1, L.latLng(coords))
      return;
    }

    // Otherwise, the waypoint is classed as via, therefore the distance between points along the route is calculated and new coordinates are spliced into the array at the relevant index
    let previousDistance = 0;
    let spliceIndex = 0;
    currentWaypoints.forEach((waypoint, index) => {
      if (index === 0) {
        previousDistance = getDistance(waypoint, coords, index, previousDistance);
        spliceIndex = index + 1;
      } else {
        const currentDistance = getDistance(waypoint, coords, index, previousDistance);
        if (currentDistance < previousDistance) {
          previousDistance = currentDistance;
          if (index === currentWaypoints.length - 1) {
            spliceIndex = index - 1;
          } else {
            spliceIndex = index;
          }
        } else {
          previousDistance = currentDistance;
        }
      }
    })
    console.log(spliceIndex)
    control.current.spliceWaypoints(spliceIndex,0, L.latLng(coords))
  }

  useEffect(() => {
    if (map) {
        map.on("moveend" , () => {
          setMapCenter(map.getCenter());
        })
      }
  }, [map])

  useEffect(() => {
    // const radius = 8046 // 5 miles
    const radius = 48280 // 5 miles
    const accommodation = 19009
    const attractions = 16000
    const getPOI = async () => {
      const url = `https://api.foursquare.com/v3/places/search?ll=${mapCenter.lat}%2C${mapCenter.lng}&radius=${radius}&categories=${accommodation},${attractions}&limit=30`;
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
    if (keyPOI) {
      const markerArr = {
        accommodation: [],
        attractions: [],
      };
      for (const POI of keyPOI.results) {
        const category = (POI.categories[0].id.toString()).slice(0,2);
        const closed = POI.closed_bucket.match(/[A-Z][a-z]+/g).join(' ');
        if (category === '19') {
          const icon = L.icon({
            iconUrl: '/img/routing/accommodation.svg',
            iconSize: [30, 110],
            iconAnchor: [15, 68],
            popupAnchor: [-3, -76],
          });

          markerArr.accommodation.push(
            <Marker 
              position={[POI.geocodes.main.latitude, POI.geocodes.main.longitude]} 
              key={POI.fsq_id}
              icon={icon}
              >
              <Popup>
                <h3 className='popup'>{POI.name}</h3>
                <ul className='popup'>
                  <li>Open: {closed}</li>
                  <li>{POI.location.address}</li>
                  <li>{POI.location.locality}</li>
                  <li>{POI.location.region}</li>
                  <li>{POI.location.postcode}</li>
                </ul>
                <button className='popup' onClick={() => {
                  setRouteWaypoint({lat: POI.geocodes.main.latitude, lng: POI.geocodes.main.longitude})
                }}>
                  Route Via
                </button>
                <button className='popup' onClick={() => {
                  setRouteWaypoint({lat: POI.geocodes.main.latitude, lng: POI.geocodes.main.longitude}, true)
                }}>
                  Route To
                </button>
              </Popup>
            </Marker>
          )
        } else if (category === '16') {
          const icon = L.icon({
            iconUrl: '/img/routing/attractions.svg',
            iconSize: [30, 110],
            iconAnchor: [15, 68],
            popupAnchor: [-3, -76],
          });

          markerArr.attractions.push(
            <Marker 
              position={[POI.geocodes.main.latitude, POI.geocodes.main.longitude]} 
              key={POI.fsq_id}
              icon={icon}
              >
              <Popup>
                <h3>{POI.name}</h3>
                <ul className='popup'>
                  <li>Open: {closed}</li> 
                  <li>{POI.location.address}</li>
                  <li>{POI.location.locality}</li>
                  <li>{POI.location.region}</li>
                  <li>{POI.location.postcode}</li>
                </ul>
                <button className='popup' onClick={() => {
                  setRouteWaypoint({lat: POI.geocodes.main.latitude, lng: POI.geocodes.main.longitude})
                }}>
                  Route Via
                </button>
                <button className='popup' onClick={() => {
                  setRouteWaypoint({lat: POI.geocodes.main.latitude, lng: POI.geocodes.main.longitude}, true)
                }}>
                  Route To
                </button>
              </Popup>
            </Marker>
          )
        }
      }
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
              {keyPOIMarkers.accommodation} 
            </LayerGroup>
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Key POI - Attractions">
            <LayerGroup>
              {keyPOIMarkers.attractions} 
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
        <RoutingMachine
          setCoordinates={setCoordinates}
          summary={summary}
          setSummary={setSummary}
          setGeoJSONLink={props.setGeoJSONLink} 
          setGeoJSON={setGeoJSON}
          setGPXLink={props.setGPXLink} 
          setGPX={setGPX}
          control={control}
          setInstructions={setInstructions}
          chartRef={chartRef}
          setSegmentDistance={setSegmentDistance}
        />
      </MapContainer>

      <ElevationChart
        chartRef={chartRef}
        coordinates={coordinates}
        summary={summary}
        mapRef={map}
        segmentDistance={segmentDistance}
        setSegmentDistance={setSegmentDistance}
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