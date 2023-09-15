import { useRef } from 'react';
import './RoutePreferencesPanel.css'
import { useEffect } from 'react';

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

  const clickHandler = (event) => {
    const id = event.target.id;
    if (id === 'shareEmailButton') {
      props.setShow(!props.show);
    };
  };

  return (
    <div className="share-panel__preferences">
      <div className="share-panel__preferences__preference">
        <div className='checkbox-list'>
          <button id='shareEmailButton' type='button' className='share-panel__button'>Email</button>
        </div>
      </div>
    </div>
  )
}

export default SharePanel;