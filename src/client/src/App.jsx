import Map from './Map/Map';
import WeatherPanel from './WeatherPanel/WeatherPanel';
import './App.css';
import ElevationChart from './ElevationChart/ElevationChart';
import { useState } from 'react';
import OptionsPanel from './OptionsPanel/OptionsPanel';

function App() {
  const [coordinates, setCoordinates] = useState([]);
  const [summary, setSummary] = useState({});
  const [map, setMap] = useState(null);
  const [geoJSONLink, setGeoJSONLink] = useState(null);
  const [gpxLink, setGPXLink] = useState(null);

  return (
    <div>
      <Map 
        coordinates={coordinates}
        setCoordinates={setCoordinates}
        setSummary={setSummary}
        setMap={setMap}
        setGeoJSONLink={setGeoJSONLink}
        setGPXLink={setGPXLink} 
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
    </div>
  );
}

export default App;
