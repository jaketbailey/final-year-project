import { useRef, useState } from 'react';
import './RoutePreferencesPanel.css'
import { useEffect } from 'react';
import Modal from '../Modal/Modal';

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
    console.log(routeGPX)
    console.log(routeGeoJSON)

    message.current = {
      to: '',
      from: 'jake@jaketbailey.co.uk',
      subject: 'Route',
      text: 'Planned Route using the UP2002753 Route Planner',
      attachments: [
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
  }, [props.geoJSON, props.gpx]);

  useEffect(() => {
    message.current.to = props.data.to;
    message.current.attachments[0].filename = `${props.data.filename}.geojson`;
    message.current.attachments[1].filename = `${props.data.filename}.gpx`;
    console.log('hello message')
    console.log(message.current)
    sendEmail();
  },[props.data]);

  useEffect(() => {
    const shareEmailButton = document.querySelector('#shareEmailButton');
    shareEmailButton.addEventListener('click', clickHandler);
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

  const hideEmailModal = () => {
    const modal = document.querySelector('.modal');
    modal.style.display = 'none';
  }
  
  // const [show, setShow] = useState(false);

  const clickHandler = (event) => {
    const id = event.target.id;
    if (id === 'shareEmailButton') {
      console.log('email');
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