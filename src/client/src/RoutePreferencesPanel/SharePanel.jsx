import { useRef } from 'react';
import './RoutePreferencesPanel.css'
import { useEffect, useState } from 'react';
import { SimpleMapScreenshoter } from 'leaflet-simple-map-screenshoter';
import { findFurthestCoordinates } from '../Map/routeHelpers';

/**
 * @component SharePanel
 * @description Share Panel is a sub-component of RoutePreferencesPanel which provides the share functionality of the application.
 * @param {*} props 
 * @returns SharePanel component
 */
const SharePanel = (props) => {

  const screenshotter = useRef(null);
  const socialShare = useRef(null);
  const [mapScreenshotBlob, setMapScreenshotBlob] = useState(null);
  const [mapScreenshotUrl, setMapScreenshotUrl] = useState(null);

  const initScreenshotter = () => {
    if(props.map) {
      const snapshotOptions = {
        hideElementsWithSelectors: [
          ".leaflet-control-container",
          ".leaflet-dont-include-pane",
          "#snapshot-button"
        ],
        hidden: true
      };
      
      // Add screenshotter to map
      screenshotter.current = (new SimpleMapScreenshoter(snapshotOptions));
      screenshotter.current.addTo(props.map);
    }
  }

  useEffect(() => {
    // Load the Facebook SDK asynchronously
    const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
    const loadFacebookSDK = () => {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: FB_APP_ID,
          autoLogAppEvents: true,
          xfbml: true,
          version: 'v19.0',
        });
      };

      // Load the SDK asynchronously
      (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    loadFacebookSDK();
  },[])

  useEffect(() => {
    if(mapScreenshotBlob) {

      const dataURLtoFile = (dataurl, filename) => {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[arr.length - 1]), 
            n = bstr.length, 
            u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
      }
    
      const uploadImage = async () => {
        try {
          const mapScreenshotFile = dataURLtoFile(mapScreenshotBlob, 'mapScreenshot.png');
          const formData = new FormData();
          formData.append('image', mapScreenshotFile);
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if(!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
          }
    
          const { filename } = await response.json();
    
          setMapScreenshotUrl(`http://dissertation.jaketbailey.co.uk:8080${filename}`);
          console.log('Image Upload Successful');
        } catch (error) {
          console.error('Image Upload Failed:', error);
        }
      }
      uploadImage();
    }
  },[mapScreenshotBlob])
  
  useEffect(() => {
    const shareFacebook = () => {
      if (mapScreenshotUrl) {
        FB.ui({
          method: 'share',
          display: 'popup',
          href: mapScreenshotUrl,
        }, function(response){
          console.log(response)
        });
      }
    }
    const text = encodeURIComponent('Check out this route I planned!');
    const url = encodeURIComponent(mapScreenshotUrl);

    const shareTwitter = () => {
    
      const twitterShareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    
      // Open the Twitter share dialog in a new tab
      window.open(twitterShareUrl, '_blank');
    };

    const shareReddit = () => {
      const redditShareUrl = `https://www.reddit.com/submit?url=${url}&title=${text}`;
    
      // Open the Reddit submission form in a new tab
      window.open(redditShareUrl, '_blank');
    };

    //share map screenshot to facebook
    if (socialShare.current === "facebook") {
      shareFacebook();
    } else if (socialShare.current === "x") {
      shareTwitter();
    } else if (socialShare.current === "reddit") {
      shareReddit();
    }
  },[mapScreenshotUrl])

  useEffect(() => {
    console.log(props.map)
    initScreenshotter()
  }, [props.map])

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
    const shareStravaButton = document.querySelector('#shareStravaButton');
    shareStravaButton.addEventListener('click', clickHandler);

    return () => {
      shareEmailButton.removeEventListener('click', clickHandler);
      shareStravaButton.removeEventListener('click', clickHandler);
    }
  }, []);

  /**
   * @function sendEmail
   * @description Parses the data object and converts to a JSON string to be sent as in the 
   * body of the POST request to the back-end GIN server to call SENDGRID to send the email.
   * @param {*} data 
   * @returns 
   */
  const sendEmail = async (data) => {
    if (data.to === undefined) {
      return;
    }

    const body = JSON.stringify(data);

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
    if (props.stravaAccessToken === null) {
      createActivityButton.disabled = true;
      return;
    }

    createActivityButton.disabled = false;
    return;
  }, [props.stravaAccessToken]);

  useEffect(() => {
    const googleShare = document.querySelector('#shareGoogleDriveButton');
    if (props.GLoginLogout === true) {
      googleShare.disabled = false;
    } else {
      googleShare.disabled = true;
    }
  }, [props.GLoginLogout]);

  const createFiles = async (type = 'GPX') => {
    
  const file = new Blob([props.gpx], {type: 'text/xml'});
    const metadata = {
      'name': 'test.gpx',
      'mimeType': 'application/gpx',
      "parents": ['root']
    };

    console.log(props.gapi)
    const accessToken = props.gapi.auth.getToken().access_token;
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
      method: 'POST',
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
      body: form,
    });
    const res = await response.json();
    console.log(res);
  }

  const screenshotMap = () => {
    // Set the map bounds to the specified bounding box
    let bounds;
    const roundTripMode = localStorage.getItem('roundTripMode');
    if(roundTripMode === 'true') {
      const coords = props.control.current._routes[0].coordinates
      const parsedCoords = [];
      for (const coord of coords) {
        parsedCoords.push([coord.lat, coord.lng])
      }
      bounds = findFurthestCoordinates(parsedCoords);
    } else {
      bounds = JSON.parse(localStorage.getItem('waypoints'))
    }
    props.map.fitBounds(bounds);

    // Wait for a short time to allow the map to adjust to the new bounds
    setTimeout(() => {
      console.log(screenshotter)
      screenshotter
        .current.takeScreen("image")
        .then((image) => {
          // Create a Blob from the data URL
          setMapScreenshotBlob(image);
          // return fetch(image).then((res) => res.blob());
        })
        .catch((e) => {
          alert(e.toString());
        });
    }, 500); // Adjust the delay time as needed
  }

  const clickHandler = (event) => {
    const id = event.target.id;
    if (id === 'shareEmailButton') {
      props.setShow(!props.show);
    } else if (id === 'shareStravaButton') {
      console.log('strava');
      props.setShowStrava(!props.showStrava)
    } else if (id === 'shareGoogleDriveButton') {
      console.log('google-drive');
      props.setShowGoogle(!props.showGoogle)      
    } else if (id === 'shareFacebookButton') {
      socialShare.current = "facebook";
      screenshotMap();
    } else if (id === 'shareXButton') {
      socialShare.current = "x";
      screenshotMap();
    } else if (id === 'shareRedditButton') {
      socialShare.current = "reddit";
      screenshotMap();
    }
  };

  return (
    <div className="share-panel__preferences">
      <div className="share-panel__preferences__preference">
        <div className='button-list'>
          <button id='shareEmailButton' type='button' className='share-panel__button'>Email</button>
          <button id='shareStravaButton' type='button' className='share-panel__button'>Strava Activity</button>
          <button id='shareGoogleDriveButton' type='button' className='share-panel__button' onClick={(e) => clickHandler(e)}>Google Drive</button>
          <button id='shareFacebookButton' type='button' className='share-panel__button' onClick={(e) => clickHandler(e)}>Facebook</button>
          <button id='shareXButton' type='button' className='share-panel__button' onClick={(e) => clickHandler(e)}>X/Twitter</button>
          <button id='shareRedditButton' type='button' className='share-panel__button' onClick={(e) => clickHandler(e)}>Reddit</button>
        </div>
      </div>
    </div>
  )
}

export default SharePanel;