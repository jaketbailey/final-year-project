import Map from './Map/Map';
import WeatherPanel from './WeatherPanel/WeatherPanel';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import LeftPanel from './LeftPanel/LeftPanel';


function App() {
  // const control = useRef(null);
  // const [coordinates, setCoordinates] = useState([]);
  // const [summary, setSummary] = useState({});
  // const [map, setMap] = useState(null);
  // const [geoJSON, setGeoJSON] = useState(null);
  // const [gpxLink, setGPXLink] = useState(null);
  // const [gpx, setGPX] = useState(null);
  // const [avoidFeatures, setAvoidFeatures] = useState([]);
  // const [stravaData, setStravaData] = useState({});
  // const [instructions, setInstructions] = useState([]);
  // const [show, setShow] = useState(false);
  // const [showStrava, setShowStrava] = useState(false);
  // const [emailData, setEmailData] = useState({});
  // const [stravaAccessToken, setStravaAccessToken] = useState(null)

  const [gpxLink, setGPXLink] = useState(null);
  const [geoJSONLink, setGeoJSONLink] = useState(null);

  return (
    <div>
      <div className='main-flex'>
        <LeftPanel 
          geoJSONLink={geoJSONLink} 
          gpxLink={gpxLink}
        />
        <Map 
          setGeoJSONLink={setGeoJSONLink}
          setGPXLink={setGPXLink}
        />
      </div>
      
    </div>
  );
}

export default App;
