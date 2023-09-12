import { useRef } from 'react';
import './RoutePreferencesPanel.css'
import { useEffect } from 'react';
import { act } from '@testing-library/react';

const SharePanel = (props) => {
  useEffect(() => {
    const sharePanelContainer = document.querySelector('.share-panel__preferences');
    if (props.showPanel) {
      sharePanelContainer.style.width = 'auto';
      sharePanelContainer.style.height = 'auto';
    } else {
      sharePanelContainer.style.width = '0';
      sharePanelContainer.style.height = '0';
    }
  }, [props.showPanel]);

  const message = useRef(null);
  const activity = useRef(null);
  const routeGeoJSON = useRef(props.geoJSON);
  const routeGPX = useRef(props.gpx);

  useEffect(() => {
    console.log('update to route')
    routeGeoJSON.current = props.geoJSON;
    routeGPX.current = props.gpx;
    console.log(routeGPX)
    console.log(routeGeoJSON)

    message.current = {
      to: 'joe.mcneil1996@hotmail.co.uk',
      from: 'jake@jaketbailey.co.uk',
      subject: 'Route',
      text: 'Planned Route using the UP2002753 Route Planner',
      attachments: [
        {
          content: routeGeoJSON.current,
          filename: 'route.geojson',
          type: 'application/geojson',
          disposition: 'attachment'
        },
        {
          content: routeGPX.current,
          filename: 'route.gpx',
          type: 'application/gpx+xml',
          disposition: 'attachment'
        }
      ]
    }
    console.log(message)

    activity.current = {
      name: 'Up2002753 Route Planner',
      type: 'Ride',
      start_date_local: '2022-04-25T10:00:00Z',
      elapsed_time: 0,
      route: routeGPX.current,
    };
    console.log(activity)

  }, [props.geoJSON, props.gpx]);

  useEffect(() => {
    const shareEmailButton = document.querySelector('#shareEmailButton');
    shareEmailButton.addEventListener('click', clickHandler);
    const shareStravaButton = document.querySelector('#shareStravaButton');
    shareStravaButton.addEventListener('click', clickHandler);
  }, []);

  const sendEmail = async () => {
    if (message.current === null) {
      return;
    }

    const body = JSON.stringify(message.current);
    console.log(body);
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body,
    });
    const res = await response.json();
    console.log(res);
  }

  const createStravaActivity = async () => {
    if (activity.current  === null) {
      return;
    }

    const body = JSON.stringify(activity.current);
    console.log('heheheeleo')
    console.log(activity.current)
    console.log(body);
    const response = await fetch('/api/create-strava-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body,
    });
    const res = await response.json();
    console.log(res);
  
  }
  
  const clickHandler = (event) => {
    const id = event.target.id;
    if (id === 'shareEmailButton') {
      console.log('email');
      sendEmail();
    } else if (id === 'shareStravaButton') {
      console.log('strava');
      createStravaActivity()
    }
  };

  return (
    <div className="share-panel__preferences">
      <div className="share-panel__preferences__preference">
        <div className='button-list'>
          <button id='shareEmailButton' type='button' className='share-panel__button'>Email</button>
          <button id='shareStravaButton' type='button' className='share-panel__button'>Strava Activity</button>
        </div>
      </div>
    </div>
  )
}

export default SharePanel;