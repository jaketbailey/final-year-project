import Map from './Map/Map';
import WeatherPanel from './WeatherPanel/WeatherPanel';
import './App.css';
import ElevationChart from './ElevationChart/ElevationChart';
import { useEffect, useRef, useState } from 'react';
import ExportPanel from './ExportPanel/ExportPanel';
import RoutePreferencesPanel from './RoutePreferencesPanel/RoutePreferencesPanel';
import Modal from './Modal/Modal';

function App() {
  const control = useRef(null);
  const [coordinates, setCoordinates] = useState([]);
  const [summary, setSummary] = useState({});
  const [map, setMap] = useState(null);
  const [geoJSONLink, setGeoJSONLink] = useState(null);
  const [geoJSON, setGeoJSON] = useState(null);
  const [gpxLink, setGPXLink] = useState(null);
  const [gpx, setGPX] = useState(null);
  const [avoidFeatures, setAvoidFeatures] = useState([]);
  const [show, setShow] = useState(false);
  const [showStrava, setShowStrava] = useState(false);
  const [emailData, setEmailData] = useState({});
  const [stravaData, setStravaData] = useState({});
  const [stravaAccessToken, setStravaAccessToken] = useState(null)
  const [instructions, setInstructions] = useState([]);

  useEffect(() => {
    fetch('/api/ping')
  }, []);

  return (
    <div>
      <Map 
        coordinates={coordinates}
        setCoordinates={setCoordinates}
        setSummary={setSummary}
        setMap={setMap}
        setGeoJSONLink={setGeoJSONLink}
        setGeoJSON={setGeoJSON}
        setGPXLink={setGPXLink}
        setGPX={setGPX}
        control={control}
        avoidFeatures={avoidFeatures}
        stravaData={stravaData}
        instructions={instructions}
        setInstructions={setInstructions}
      />
      
      <ExportPanel 
        geoJSONLink={geoJSONLink} 
        gpxLink={gpxLink}
      />
      <ElevationChart
        coordinates={coordinates}
        summary={summary}
        mapRef={map}
      />
      <WeatherPanel />
      <RoutePreferencesPanel
        geoJSONLink={geoJSONLink} 
        gpxLink={gpxLink}
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
  );
}

export default App;
