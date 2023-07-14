import Map from './Map/Map';
import './App.css';
import ElevationChart from './ElevationChart/ElevationChart';
import { useState } from 'react';

function App() {

  const [coordinates, setCoordinates] = useState([])

  return (
    <div>
      <Map 
        coordinates={coordinates}
        setCoordinates={setCoordinates}
      />
      <ElevationChart
        coordinates={coordinates}
      />
    </div>
  );
}

export default App;
