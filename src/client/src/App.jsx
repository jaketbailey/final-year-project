import Map from './Map/Map';
import WeatherPanel from './WeatherPanel/WeatherPanel';
import './App.css';
import ElevationChart from './ElevationChart/ElevationChart';
import { useEffect, useRef, useState } from 'react';
import OptionsPanel from './OptionsPanel/OptionsPanel';
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

  useEffect(() => {
    console.log(avoidFeatures)
    fetch('/api/ping')
  }, [avoidFeatures]);

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
      />
      
      <OptionsPanel 
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
      />
      
    </div>
  );
}

export default App;
