import { useRef } from 'react';
import './RoutePreferencesPanel.css'
import { useEffect, useState } from 'react';
import { gapi, loadClientAuth2 } from 'gapi-script';


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

  const G_CLIENT_ID = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID
  const G_API_ID = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
  const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';
  const [isLoadingGoogleDriveApi, setIsLoadingGoogleDriveApi] = useState(false);
  const [signedInUser, setSignedInUser] = useState(null);
  const [isFetchingGoogleDriveFiles, setIsFetchingGoogleDriveFiles] = useState(null);
  const [listDocumentsVisibility, setListDocumentsVisibility] = useState(null);

  const updateSigninStatus = (isSignedIn) => {
    if (isSignedIn) {
      // Set the signed in user
      console.log(gapi.auth2.getAuthInstance().currentUser)
      setSignedInUser(gapi.auth2.getAuthInstance().currentUser.le);
      setIsLoadingGoogleDriveApi(false);
      // list files if user is authenticated
      listFiles();
    } else {
      // prompt user to sign in
      handleAuthClick();
    }
  };
  
   /**
   * List files.
   */
  const listFiles = (searchTerm = null) => {
    setIsFetchingGoogleDriveFiles(true);
    gapi.client.drive.files
      .list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
        q: searchTerm,
      })
      .then(function (response) {
        setIsFetchingGoogleDriveFiles(false);
        setListDocumentsVisibility(true);
        const res = JSON.parse(response.body);
        console.log(res);
      });
  };

  /**
   *  Sign in the user upon button click.
   */
  const handleAuthClick = (event) => {
    gapi.auth2.getAuthInstance().signIn();
  };

  const initClient = () => {
    setIsLoadingGoogleDriveApi(true);
    gapi.client
      .init({
        apiKey: G_API_ID,
        clientId: G_CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      })
      .then(
        function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        },
        function (error) {}
      );
  };  

  const clickHandler = (event) => {
    const id = event.target.id;
    if (id === 'shareEmailButton') {
      props.setShow(!props.show);
    } else if (id === 'shareStravaButton') {
      console.log('strava');
      props.setShowStrava(!props.showStrava)
    } else if (id === 'shareGoogleDriveButton') {
      console.log('googleDrive');
      gapi.load('client:auth2', initClient);
    }
  };

  return (
    <div className="share-panel__preferences">
      <div className="share-panel__preferences__preference">
        <div className='button-list'>
          <button id='shareEmailButton' type='button' className='share-panel__button'>Email</button>
          <button id='shareStravaButton' type='button' className='share-panel__button'>Strava Activity</button>
          <button id='shareGoogleDriveButton' type='button' className='share-panel__button' onClick={(e) => clickHandler(e)}>Google Drive</button>
        </div>
      </div>
    </div>
  )
}

export default SharePanel;