import { useEffect } from 'react'
import './Modal.css'

/**
 * @function Modal
 * @description Universal modal component
 * @param {*} props 
 * @returns Modal component
 */
const Modal = (props) => {
  if (!props.show) {
    return null
  }

  const handleClick = (type) => {
    if (type === "strava") {
      const activityName = document.querySelector('#input-activity-name').value;
      const startDate = Date.parse(document.querySelector('#input-start').value);
      const avgSpeed = document.querySelector('#input-speed').value;
      props.setStravaData({
        name: activityName,
        start: startDate,
        speed: avgSpeed,
      })
      console.log('strava activity clicked')
      return;
    }

    const buttonUpdate = (text) => {
        const sendBtn = document.querySelector('#send-email');
        sendBtn.classList.add('fail')
        sendBtn.textContent = text
        setTimeout(() => {
          sendBtn.classList.remove('fail');
          sendBtn.textContent = 'Send';
        },1000);
        return;
    }

    const validateEmail = (email) => {
      return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    };  

    const emailData = {
      to: document.querySelector('#input-to').value,
      filename: document.querySelector('#input-filename').value,
      includeGPX: document.querySelector('#input-gpx').checked,
      includeGeoJSON: document.querySelector('#input-geojson').checked
    }

    // Input validation in the below 3 if statements.

    if(!validateEmail(emailData.to)) {
      buttonUpdate('Invalid Email Address');
      return;
    }

    if(emailData.filename.trim() === '') {
      buttonUpdate('Filename is blank');
      return;
    }

    if(!emailData.includeGPX && !emailData.includeGeoJSON) {
      buttonUpdate('File Type not selected');
      return;
    }

    // Sets the email data after input validation which is used within the SharePanel component
    props.setEmailData(emailData)
  }

  useEffect(() => {
    let button;
    if (props.type === "email") {
      button = document.querySelector('#send-email');
    } else if (props.type === "strava") {
      button = document.querySelector('#create-activity-btn');
    } 
    button.addEventListener('click', () => {handleClick(props.type)});
  }, [])


  /**
   * @function getContent
   * @description Used to get the content based on the type of modal being used
   * @returns Modal Content
   */
  const getContent = () => {
    if (props.type === 'email') {
      return (
        <div>
          <div className='block'>
          <label htmlFor='input-to'>To</label>
          <input id='input-to' name='input-to' type='text' placeholder='example@myport.ac.uk'/>
          </div>
          <div className='block'>
          <label htmlFor='input-filename'>Filename</label>
          <input id='input-filename' name='input-filename' type='text' placeholder='myroute'/>
          </div>
          <div className='block'>
          <label htmlFor='input-gpx'>Include GPX?</label>
          <input id='input-gpx' name='input-gpx'type='checkbox'/>
          <label htmlFor='input-geojson'>Include GeoJSON?</label>
          <input id='input-geojson' name='input-geojson'type='checkbox'/>
          </div>
          <button id='send-email' className='share'>Send</button>
        </div>
      )
    } else if (props.type === 'strava') {
      const today = new Date().toLocaleDateString('en-gb')
      return (
        <div>
          <div className='block'>
          <label htmlFor='input-activity-name'>Activity Name</label>
          <input id='input-activity-name' name='input-activity-name' type='text' placeholder='myactivity'/>
          </div>
          <div className='block'>
          <label htmlFor='input-start'>Start Date & Time</label>
          <input id='input-start' name='input-start' type='datetime-local' max={today}/>
          </div>
          <div className='block'>
          <label htmlFor='input-speed'>Average Speed (km/h) </label>
          <input id='input-speed' name='input-speed' type='number' placeholder="24.0" min="5.0" max="39.0"/>
          </div>
          <button id='create-activity-btn' className='share'>Create Activity</button>
        </div>
      )
    }
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title2">{props.modalTitle}</h3>
        </div>
        <div className="modal-body">
          {getContent()}
        </div>
        <div className="modal-footer">
          <button className="close" onClick={() => props.setShow(!props.show)}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default Modal;