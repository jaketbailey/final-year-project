import Map from './Map/Map';
import './App.css';
import ElevationChart from './ElevationChart/ElevationChart';
import { useState } from 'react';

function App() {

  const [coordinates, setCoordinates] = useState([]);
  const [summary, setSummary] = useState({});
  const [map, setMap] = useState(null);

  return (
    <div>
      <Map 
        coordinates={coordinates}
        setCoordinates={setCoordinates}
        setSummary={setSummary}
        setMap={setMap}
      />
      <ElevationChart
        coordinates={coordinates}
        summary={summary}
        mapRef={map}
      />
    </div>
  );
}

export default App;
