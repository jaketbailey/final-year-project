import Map from './Map/Map';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import LeftPanel from './LeftPanel/LeftPanel';


function App() {
  const [GToken, setGToken] = useState(null);

  useEffect(() => {
    if (GToken) {
      console.log(GToken);
    }
  }, [GToken]);

  return (
    <div>
      <div className='main-flex'>
        <LeftPanel 
          setGToken={setGToken}
        />
        <Map/>
      </div>
      
    </div>
  );
}

export default App;
