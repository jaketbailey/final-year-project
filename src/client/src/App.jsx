import Map from './Map/Map';
import WeatherPanel from './WeatherPanel/WeatherPanel';
import './App.css';
import ElevationChart from './ElevationChart/ElevationChart';
import { useEffect, useRef, useState } from 'react';
import OptionsPanel from './OptionsPanel/OptionsPanel';
import RoutePreferencesPanel from './RoutePreferencesPanel/RoutePreferencesPanel';

function App() {
  const control = useRef(null);
  const [coordinates, setCoordinates] = useState([]);
  const [summary, setSummary] = useState({});
  const [map, setMap] = useState(null);
  const [geoJSONLink, setGeoJSONLink] = useState(null);
  const [gpxLink, setGPXLink] = useState(null);
  const [avoidFeatures, setAvoidFeatures] = useState([]);

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
        setGPXLink={setGPXLink}
        control={control}
        avoidFeatures={avoidFeatures}
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
        setAvoidFeatures={setAvoidFeatures}
        avoidFeatures={avoidFeatures}
        control={control}
      />
    </div>
  );
}

export default App;
