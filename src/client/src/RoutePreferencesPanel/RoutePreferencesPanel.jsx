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
  const [stravaAuthCode, setStravaAuthCode] = useState(null)
 
  const deauthoriseStrava = async () => {
    const ACCESS_TOKEN = props.stravaAccessToken.access_token;
    const URL = `https://www.strava.com/oauth/deauthorize?access_token=${ACCESS_TOKEN}`
    const response = await fetch(URL, {
      method: 'POST',
    })
    const res = await response.json();;
    console.log(res)
    localStorage.removeItem('strava_auth_code');
    localStorage.removeItem('strava_access_token');
    setStravaAuthCode(null);
    props.setStravaAccessToken(null);
  }

  const getStravaAuthCode = () => {
    const stravaBtn = document.querySelector('#strava-login');
    if (stravaBtn.classList.contains('strava-logout')) {
      deauthoriseStrava();
      stravaBtn.textContent = 'Log in to Strava'
      stravaBtn.classList.remove('strava-logout');
      return;
    }
    const CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_STRAVA_REDIRECT_URI;
    const SCOPE = 'activity:read_all,activity:write';
    // Redirect to get auth code
    const URL = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}`
    window.location.href = URL;
  }

  useEffect(() => {
    if (stravaAuthCode === null) {
      localStorage.removeItem('strava_auth_code');
      return;
    }
    getStravaAccessToken();
  }, [stravaAuthCode]);

  const getStravaAccessToken = async () => {
    const CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID;
    const CLIENT_SECRET = import.meta.env.VITE_STRAVA_CLIENT_SECRET;
    const CODE = stravaAuthCode.code;
    const GRANT_TYPE = 'authorization_code';
    const URL = `https://www.strava.com/api/v3/oauth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${CODE}&grant_type=${GRANT_TYPE}`
    
    const response = await fetch(URL, {
      method: 'POST',
    });
    const res = await response.json();
    if (res.message === 'Bad Request') {
      getStravaAuthCode();
      return;
    }
    props.setStravaAccessToken(res);
    localStorage.setItem('strava_access_token', JSON.stringify(res));
    return;
  } 

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

    const stravaAccessToken = JSON.parse(localStorage.getItem('strava_access_token'));
    if (stravaAccessToken) {
      props.setStravaAccessToken(stravaAccessToken);
      const stravaBtn = document.querySelector("#strava-login");
      if (stravaBtn !== null) {
        stravaBtn.innerText = 'Log out of Strava';
        stravaBtn.classList.add('strava-logout');
      }
      return;
    }

    const pathname = window.location.pathname;
    if (pathname === '/exchange_token') {
      const params = (new URL(document.location)).searchParams;
      console.log(params)
      localStorage.setItem('strava_auth_code', params.get('code'))
      if (params.get('error')) {
        console.log(params.get('error'))
        return;
      }
      const stravaBtn = document.querySelector("#strava-login");
      if (stravaBtn !== null) {
        stravaBtn.innerText = 'Log out of Strava';
        stravaBtn.classList.add('strava-logout');
      }
      const code = {
         code: params.get('code'),
         scope: params.get('scope'),
      }

      localStorage.setItem('strava_auth_code', JSON.stringify(code));
      setStravaAuthCode(code);
      return;
    }
    return;
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
        <button id="strava-login" className="route-preferences-panel__button" onClick={getStravaAuthCode}>
          Log in to Strava 
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
          geoJSON={props.geoJSON} 
          gpx={props.gpx} 
          showPanel={showSharePanel}
          setShow={props.setShow}
          show={props.show}
          setShowStrava={props.setShowStrava}
          showStrava={props.showStrava}
          data={props.emailData}
          stravaAccessToken={props.stravaAccessToken}
          stravaData={props.stravaData}
        />
      </div>
  );
}

export default RoutePreferencesPanel;