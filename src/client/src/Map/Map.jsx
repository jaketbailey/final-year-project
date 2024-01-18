import L from "leaflet";
import { LayersControl, MapContainer, TileLayer, Marker, Popup, LayerGroup, Polygon, FeatureGroup } from 'react-leaflet'
import RoutingMachine from './RoutingMachine';
import { useEffect, useState, useRef, createRef } from 'react';
import RoutePreferencesPanel from '../RoutePreferencesPanel/RoutePreferencesPanel';
import Modal from '../Modal/Modal';
import ElevationChart from '../ElevationChart/ElevationChart';
import { gapi } from 'gapi-script';
import { onDrawCreated } from "./drawHelpers";
import { EditControl } from "react-leaflet-draw";

/**
 * @component Map
 * @description Creates an Open Street Map component with a route planning engine
 * @param {*} props 
 * @returns Map component
 */
const Map = (props) => {
  const chartRef = useRef(null);
  const control = useRef(null);
  const roundTripMode = useRef(false);
  const routerConfig = useRef({
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
        },
  )
  
  const [categories, setCategories] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat: 50.798908, lng: -1.091160});
  const [coordinates, setCoordinates] = useState([]);
  const [waypoints, setWaypoints] = useState([]);
  const [summary, setSummary] = useState({});
  const [map, setMap] = useState(null);
  const [geoJSON, setGeoJSON] = useState(null);
  const [gpx, setGPX] = useState(null);
  const [avoidFeatures, setAvoidFeatures] = useState([]);
  const [instructions, setInstructions] = useState([]);
  
  const [show, setShow] = useState(false);
  const [showStrava, setShowStrava] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  const [showHazard, setShowHazard] = useState(false);
  const [hazardID, setHazardID] = useState('');
  const [showHazardReport, setShowHazardReport] = useState(false);
  
  const [emailData, setEmailData] = useState({});
  const [stravaData, setStravaData] = useState({});
  const [googleData, setGoogleData] = useState({});
  const [hazardData, setHazardData] = useState({});
  const [hazard, setHazard] = useState({});

  const [stravaAccessToken, setStravaAccessToken] = useState(null);
  const [keyPOI, setKeyPOI] = useState(null);
  const [keyPOIMarkers, setKeyPOIMarkers] = useState([]);
  const [hazardAreas, setHazardAreas] = useState([]);
  const [segmentDistance, setSegmentDistance] = useState(0);
  
  const OpenCycleAPIKey = import.meta.env.VITE_OPEN_CYCLE_MAP_API_KEY;
  const StravaKeyPairId = import.meta.env.VITE_STRAVA_HEATMAP_KEY_PAIR_ID;
  const StravaPolicy = import.meta.env.VITE_STRAVA_HEATMAP_POLICY;
  const StravaSignature = import.meta.env.VITE_STRAVA_HEATMAP_SIGNATURE;
  const FoursquareAPIKey = import.meta.env.VITE_FOURSQUARE_API_KEY;

  useEffect(() => {
    console.log(waypoints)
    if (waypoints.length > 0) {
      localStorage.setItem('waypoints', JSON.stringify(waypoints));
      localStorage.setItem('roundTripMode', roundTripMode.current);
    }

    console.log(routerConfig.current)
    if (localStorage.getItem('routerConfig') !== null) {
      routerConfig.current = JSON.parse(localStorage.getItem('routerConfig'));
    } else {
      localStorage.setItem('routerConfig', JSON.stringify(routerConfig.current))
    }

    if (localStorage.getItem('roundTripDistance') === null) {
      localStorage.setItem('roundTripDistance', 10);
    }
  },[waypoints, roundTripMode.current])

  // useEffect(() => {
  //   const wpts = JSON.parse(localStorage.getItem('waypoints'));
  //   if (wpts !== null) {
  //     const alertRes = confirm('Load previous route?'); 
  //     setLoadRoute(alertRes);
  //   }
  // }, [])

  /**
   * Calculate the great-circle distance between two points on the Earth's surface
   * using their latitude and longitude coordinates.
   *
   * @function getDistance
   * @param {Object} coords1 - Object with 'lat' and 'lon' properties for the first point.
   * @param {Object} coords2 - Object with 'lat' and 'lon' properties for the second point.
   * @returns {number} Distance in kilometers.
   */
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

  /**
   * Sets a route waypoint at the specified coordinates. If 'to' is provided, the final waypoint
   * is replaced with new coordinates. Otherwise, a new waypoint is added along the route, and its
   * position is determined based on the distance between existing waypoints.
   * @function setRouteWaypoint
   * @param {Object} coords - Coordinates object with 'lat' and 'lon' properties for the new waypoint.
   * @param {boolean} [to=false] - Optional flag indicating if the new waypoint should replace the final one.
   */
  const setRouteWaypoint = (coords, to) => {
    const currentWaypoints = control.current._plan._waypoints;
    
    // Check if to boolean is present, final element in waypoint array is replaced with new coordinates
    if (to) {
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
    control.current.spliceWaypoints(spliceIndex,0, L.latLng(coords))
  }

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch('/api/categories');
      const res = await response.json();
      setCategories(res);
    }

    fetchCategories();
  },[])

  useEffect(() => {
    if (map) {
      map.on("moveend" , () => {
        setMapCenter(map.getCenter());
      });
    }
  }, [map])

  useEffect(() => {
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

    /**
     * Asynchronously fetches hazard areas from the server based on the provided map center coordinates and radius.
     * Creates map elements (Polygon or Marker) for each hazard and adds them to the hazards array.
     * Logs the fetched data and creates map elements with associated popups.
     * 
     * @async
     * @function fetchHazardAreas
     * @returns {Promise<void>} A Promise that resolves after hazards are fetched and processed.
     */
    const fetchHazardAreas = async () => {
      const radiusMiles = 5;
      const convertCoords = (coordinates) => {
        const arr = [];
        for (const coord of coordinates) {
          arr.push([coord.Latitude, coord.Longitude]);
        }
        return arr;
      }
      const url = `/api/hazards?latitude=${mapCenter.lat}&longitude=${mapCenter.lng}&radius=${radiusMiles}`;
      const response = await fetch(url);
      const res = await response.json();
      const hazards = [];

      let icon = L.icon({
        iconUrl: '/img/routing/hazard.svg',
        iconSize: [30, 110],
        iconAnchor: [15, 68],
        popupAnchor: [-3, -76],
      });

      let color = '#FFBF00';
      
      for (const hazard of res) {
        if (hazard.Properties[0].Key === 'cycling_infrastructure') {
          icon = L.icon({
            iconUrl: '/img/routing/cycling_infrastructure.svg',
            iconSize: [30, 110],
            iconAnchor: [15, 68],
            popupAnchor: [-3, -76],
          });

          color = '#038546';
        }
        let hazardType = hazard.Properties[0].Key

        let date = Date.parse(hazard.Date);
        date = new Date(date);
        const formattedDate = date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric'
        });

        hazardType = hazardType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        if (hazard.Geometry.Type === "Polygon") {
          hazards.push(
            <Polygon
              pathOptions={{color: color}} 
              positions={convertCoords(hazard.Geometry.Coordinates)}
            >
              <Popup>
                  <h3>{hazardType}</h3>
                  <p>
                    Description: {hazard.Properties[0].Value}<br/>
                    Danger Risk: {hazard.Properties[1].Value}<br/>
                    Date Reported: {formattedDate}
                  </p>
                  <button className="popup reportHazard" id={`reportHazard-${hazard.ID}`} onClick={(e) => {
                    setShowHazardReport(!showHazardReport)
                    setHazardID(e.target.id.split('-')[1])
                  }}>Report Error</button>
                  <button className="popup" id={`hazardRepeat-${hazard.ID}`}>Report as a reoccurring Hazard</button>
              </Popup>
            </Polygon>
          )
        } 
        else if (hazard.Geometry.Type ==="Point") {
          hazards.push(
            <Marker 
              position={[hazard.Geometry.Coordinates[0].Latitude, hazard.Geometry.Coordinates[0].Longitude]}
              icon={icon}
            >
              <Popup>
                <h3>{hazardType}</h3>
                <p>
                  Description: {hazard.Properties[0].Value}<br/>
                  Danger Risk: {hazard.Properties[1].Value}<br/>
                  Date Reported: {formattedDate}
                </p>
                <button id={`reportHazard-${hazard.ID}`} className="popup" onClick={(e) => {
                  setShowHazardReport(!showHazardReport)
                  setHazardID(e.target.id.split('-')[1])
                }}>Report Error</button>
                <button id={`hazardRepeat-${hazard.ID}`} className="popup">Report as a reoccurring Hazard</button>
              </Popup>
            </Marker>
          )
        }
      }
      setHazardAreas(hazards);
    }
    
    fetchHazardAreas();
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
        <FeatureGroup>
          <EditControl
            position='topleft'
            draw={{
                circle: false,
                circlemarker: false,
                rectangle: false,
            }}
            edit={{
              remove: false,
              edit: false,
            }}
            onCreated={(e) => onDrawCreated(e, setHazard, setShowHazard)}
          />
        </FeatureGroup>
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
              url={`https://heatmap-external-c.strava.com/tiles-auth/ride/hot/{z}/{x}/{y}.png?Key-Pair-Id=${StravaKeyPairId}&Policy=${StravaPolicy}&Signature=${StravaSignature}`}
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
          <LayersControl.Overlay name="Hazard Areas">
            <LayerGroup>
              {hazardAreas}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
        <RoutingMachine
          setCoordinates={setCoordinates}
          setWaypoints={setWaypoints}
          summary={summary}
          setSummary={setSummary}
          setGeoJSONLink={props.setGeoJSONLink} 
          setGeoJSON={setGeoJSON}
          setGPXLink={props.setGPXLink} 
          setGPX={setGPX}
          control={control}
          map={props.map}
          setInstructions={setInstructions}
          chartRef={chartRef}
          setSegmentDistance={setSegmentDistance}
          roundTripMode={roundTripMode}
          routerConfig={routerConfig}
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
        showGoogle={showGoogle} 
        setShowGoogle={setShowGoogle}
        gapi={gapi}
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
      <Modal 
        id='ShareGoogleModal' 
        show={showGoogle} 
        setShow={setShowGoogle} 
        modalTitle='Save to Google Drive'
        type='google'
        setGoogleData={setGoogleData}
        googleData={googleData}
        instructions={instructions}
        coordinates={coordinates}
        gapi={gapi}
        gpx={gpx}
        geoJSON={geoJSON}
      />
      <Modal 
        id='AddHazardModal' 
        show={showHazard} 
        setShow={setShowHazard} 
        modalTitle='Add Hazard'
        type='hazard'
        setHazardData={setHazardData}
        hazardData={hazardData}
        hazard={hazard}
        categories={categories}
      />
      <Modal 
        id='AddHazardReportModal' 
        show={showHazardReport} 
        setShow={setShowHazardReport} 
        modalTitle='Report a Hazard Error'
        type='hazardReport'
        hazardID={hazardID}
      />
    </div>
  )
}

export default Map;