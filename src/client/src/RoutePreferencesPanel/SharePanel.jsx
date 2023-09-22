import { useRef } from 'react';
import './RoutePreferencesPanel.css'
import { useEffect, useState } from 'react';
import { act } from '@testing-library/react';
import { create } from 'eslint-plugin-react/lib/rules/button-has-type';

/**
 * @function SharePanel
 * @description Share Panel is a sub-component of RoutePreferencesPanel which provides the share functionality of the application.
 * @param {*} props 
 * @returns SharePanel component
 */
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

    // Sets the email message with the corresponding route data
    message.current = {
      to: '',
      from: 'jake@jaketbailey.co.uk',
      subject: 'Route',
      text: 'Planned Route using the UP2002753 Route Planner',
      attachments:[
        {
          content: routeGeoJSON.current,
          filename: '',
          type: 'application/geojson',
          disposition: 'attachment'
        },
        {
          content: routeGPX.current,
          filename: '',
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
    if (!props.data) {
      return;
    }

    // Updates the filenames for the route data to be emailed
    message.current.to = props.data.to;
    message.current.attachments[0].filename = `${props.data.filename}.geojson`;
    message.current.attachments[1].filename = `${props.data.filename}.gpx`;
    
    // Creates a local copy of the message to add/remove attachments depending on the user input
    const backup = {}
    backup.to = message.current.to;
    backup.from = message.current.from;
    backup.subject = message.current.subject;
    backup.text = message.current.text;
    backup.attachments = [];

    if (!props.data.includeGPX) {
      backup.attachments.push(message.current.attachments[0])
    }

    if(!props.data.includeGeoJSON) {
      backup.attachments.push(message.current.attachments[1])
    }

    if(props.data.includeGeoJSON && props.data.includeGPX) {
      backup.attachments.push(message.current.attachments[0])
      backup.attachments.push(message.current.attachments[1])
    }

    sendEmail(backup);
  },[props.data]);

  useEffect(() => {
    const shareEmailButton = document.querySelector('#shareEmailButton');
    shareEmailButton.addEventListener('click', clickHandler);
    const shareStravaButton = document.querySelector('#shareStravaButton');
    shareStravaButton.addEventListener('click', clickHandler);
  }, []);

  /**
   * @function sendEmail
   * @description Parses the data object and converts to a JSON string to be sent as in the 
   * body of the POST request to the back-end GIN server to call SENDGRID to send the email.
   * @param {*} data 
   * @returns 
   */
  const sendEmail = async (data) => {
    if (data === null) {
      return;
    }

    const body = JSON.stringify(data);
    console.log(body);
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body,
    });

    // Checks the HTTP status code and updates the style of the send button based on whether the email was sent successfully
    const res = await response.json();
    if(res.response.StatusCode === 202 || res.response.StatusCode === 202) {
      const sendBtn = document.querySelector('#send-email');
      sendBtn.classList.add('success');
      sendBtn.textContent = 'Email Sent';
      setTimeout(() => {
        sendBtn.classList.remove('success');
        sendBtn.textContent = 'Send';
      }, 1000)
    } else {
      console.log(res);
    }
  }

  useEffect(() => {
    const createActivityButton = document.querySelector('#shareStravaButton');
    console.log(props.stravaAccessToken)
    if (props.stravaAccessToken === null) {
      createActivityButton.disabled = true;
      return;
    }

    createActivityButton.disabled = false;
    createActivityButton.addEventListener('click', createStravaActivity);
    return;
  }, [props.stravaAccessToken]);

  const createStravaActivity = async () => {
    if (activity.current  === null) {
      return;
    }

    if (props.stravaAccessToken === null) {
      return;
    }

    const body = {
      'access_token': props.stravaAccessToken.access_token,
      'name': activity.current.name,
      'type': activity.current.type,
      'start_date_local': activity.current.start_date_local,
      'elapsed_time': activity.current.elapsed_time,
      'route': activity.current.route,
    }
    console.log('activity here')
    console.log(body)
    const response = fetch('/api/create-strava-activity', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const res = await response.json();
    console.log(res)
    console.log(activity.current)
    
  }

  const clickHandler = (event) => {
    const id = event.target.id;
    if (id === 'shareEmailButton') {
      props.setShow(!props.show);
    } else if (id === 'shareStravaButton') {
      console.log('strava');
      props.setShowStrava(!props.showStrava)
      // createStravaActivity()
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