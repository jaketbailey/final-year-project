import { useEffect, useState } from 'react';
import './RoutePreferencesPanel.css'
import 'leaflet-routing-machine';
import SharePanel from './SharePanel';

/**
 * @function RoutePreferencesPanel
 * @description Creates a panel for the user to select route preferences
 * @param {*} props
 * @returns RoutePreferencesPanel component
 */
const RoutePreferencesPanel = (props) => {
  const [showPanel, setShowPanel] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [avoidFeatures, setAvoidFeatures] = useState([]);

  useEffect(() => {
    const checkboxes = document.querySelectorAll('.checkbox-input');
    for (const checkbox of checkboxes) {
      checkbox.addEventListener('change', (event) => {
        if (event.target.checked) {
          setAvoidFeatures(avoidFeatures => [...avoidFeatures, event.target.value]);
        } else {
          setAvoidFeatures(avoidFeatures => avoidFeatures.filter(feature => feature !== event.target.value));
        }
      });
    }
  }, []);

  useEffect(() => {
    if (props.control.current === null) {
      return;
    }
    const filterAvoidFeatures = [...new Set(avoidFeatures)];
    props.control.current.getRouter().options.routingQueryParams.options.avoid_features = filterAvoidFeatures;
    props.control.current.route();
  }, [avoidFeatures]);

  const togglePanel = () => {
    setShowPanel(!showPanel);
  }

  const toggleSharePanel = () => {
    setShowSharePanel(!showSharePanel);
  }

  const saveGeoJSON = () => {
    props.geoJSONLink.click();
  }

  const saveGPX = () => {
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
        <button className="route-preferences-panel__button" onClick={toggleSharePanel} >
          Share
        </button>
        <div className="route-preferences-panel__preferences">
          <div className="route-preferences-panel__preferences__preference">
            <p>Avoid:</p>
            <div className='checkbox-list'>
              <div className='checkbox-item'>
                <input type='checkbox' className="checkbox-input" id='avoidSteps' name='Steps' value='steps' />
                <label className='checkbox-label' htmlFor='avoidSteps'>Steps</label>
              </div>
              <div className='checkbox-item'>
                <input type='checkbox' className="checkbox-input"  id='avoidFerries' name='Ferries' value='ferries' />
                <label className='checkbox-label' htmlFor='avoidFerries'>Ferries</label>
              </div>
              <div className='checkbox-item'>
                <input type='checkbox' className="checkbox-input"  id='avoidFords' name='Fords' value='fords' />
                <label className='checkbox-label' htmlFor='avoidFords'>Fords</label>
              </div>
            </div>
          </div>
        </div>
        <SharePanel 
          geoJSONBlob={props.geoJSONBlob} 
          gpxBlob={props.gpxBlob} 
          showPanel={showSharePanel}
        />
      </div>
  );
}

export default RoutePreferencesPanel;