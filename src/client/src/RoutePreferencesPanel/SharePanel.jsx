import { useRef, useState } from 'react';
import './RoutePreferencesPanel.css'
import { useEffect } from 'react';

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
  const routeGeoJSON = useRef(props.geoJSONBlob);
  const routeGPX = useRef(props.gpxBlob);

  useEffect(() => {
    console.log('update to route')
    routeGeoJSON.current = props.geoJSONBlob;
    routeGPX.current = props.gpxBlob;
    console.log(routeGPX)
    console.log(routeGeoJSON)

    message.current = {
      to: 'up2002753@myport.ac.uk',
      from: 'up2002753@myport.ac.uk',
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
  }, [props.geoJSONBlob, props.gpxBlob]);

  useEffect(() => {
    const shareEmailButton = document.querySelector('#shareEmailButton');
    shareEmailButton.addEventListener('click', clickHandler);
  }, []);

  // const getContentFromURL = (URL, type) => {
  //   try {
  //     const reader = new FileReader();
  //     reader.readAsText(URL);
  //     reader.onload = function(event){
  //       if (type === 'geojson') {
  //         routeGeoJSON.current = event.target.result;
  //       } else if (type === 'gpx') {
  //         routeGPX.current = event.target.result;
  //       }
  //     }
  //   }
  //   catch (err) {
  //     console.log(err);
  //   }
  // }

  // getContentFromURL(props.geoJSONBlob, 'geojson');
  // getContentFromURL(props.gpxBlob, 'gpx');
  
  // useEffect(() => {
    
  // }, [routeGeoJSON.current, routeGPX.current])

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
  
  const clickHandler = (event) => {
    const id = event.target.id;
    if (id === 'shareEmailButton') {
      console.log('email');
      sendEmail();
    };
  };

  // useEffect(() => {

  // }, []);

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