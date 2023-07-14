import Map from './Map/Map';
import './App.css';
import ElevationChart from './ElevationChart/ElevationChart';
import { useState } from 'react';

function App() {

  const [coordinates, setCoordinates] = useState([]);
  const [summary, setSummary] = useState({});

  return (
    <div>
      <Map 
        coordinates={coordinates}
        setCoordinates={setCoordinates}
        setSummary={setSummary}
      />
      <ElevationChart
        coordinates={coordinates}
        summary={summary}
      />
    </div>
  );
}

export default App;
