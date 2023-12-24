import Map from './Map/Map';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import LeftPanel from './LeftPanel/LeftPanel';


function App() {
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
