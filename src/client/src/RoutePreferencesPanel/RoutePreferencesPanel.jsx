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
            <label htmlFor="preference">Preference</label>
            <select name="preference" id="preference">
              <option value="fastest">Fastest</option>
              <option value="shortest">Shortest</option>
              <option value="recommended">Recommended</option>
            </select>
          </div>
          <div className="route-preferences-panel__preferences__elevation">
            <label htmlFor="elevation">Elevation</label>
            <select name="elevation" id="elevation">
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        </div>
      </div>
  );
}

export default RoutePreferencesPanel;