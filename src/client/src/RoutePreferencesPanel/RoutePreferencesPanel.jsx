import { useEffect, useState } from 'react';
import './RoutePreferencesPanel.css'

const RoutePreferencesPanel = (props) => {
  const [showPanel, setShowPanel] = useState(false);

  const togglePanel = () => {
    setShowPanel(!showPanel);
  }

  const saveGeoJSON = () => {
    props.geoJSONLink.click();
  }

  const saveGPX = () => {
      console.log(props.gpxLink)
      props.gpxLink.click();
  }

  useEffect(() => {
    const routePreferencesPanelContainer = document.querySelector('.route-preferences-panel__preferences');
    if (showPanel) {
      routePreferencesPanelContainer.style.width = 'auto';
      routePreferencesPanelContainer.style.height = 'auto';
    } else {
      routePreferencesPanelContainer.style.width = '0';
      routePreferencesPanelContainer.style.height = '0';
    }
  }, [showPanel]);

  return (
      <div className="route-preferences-panel">
        <button className="route-preferences-panel__button" onClick={togglePanel}>
          Route Preferences 
        </button>
        <button className="route-preferences-panel__button" onClick={saveGeoJSON} >
          Export Route as GeoJSON
        </button>
        <button className="route-preferences-panel__button" onClick={saveGPX} >
          Export Route as GPX
        </button> 
        <div className="route-preferences-panel__preferences">
          <div className="route-preferences-panel__preferences__preference">
            <p>Avoid:</p>
            <div className='checkbox-list'>
              <div className='checkbox-item'>
                <input type='checkbox' id='avoidSteps' name='Steps' value='steps' />
                <label className='checkbox-label' htmlFor='avoidSteps'>Steps</label>
              </div>
              <div className='checkbox-item'>
                <input type='checkbox' id='avoidFerries' name='Ferries' value='ferries' />
                <label className='checkbox-label' htmlFor='avoidFerries'>Ferries</label>
              </div>
              <div className='checkbox-item'>
                <input type='checkbox' id='avoidFords' name='Fords' value='fords' />
                <label className='checkbox-label' htmlFor='avoidFords'>Fords</label>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default RoutePreferencesPanel;