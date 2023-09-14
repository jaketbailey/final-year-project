import { useEffect } from 'react'
import './Modal.css'

const Modal = (props) => {
  if (!props.show) {
    return null
  }

  const handleClick = () => {
    console.log('clicked')
    props.setEmailData({
      to: document.querySelector('#input-to').value,
      filename: document.querySelector('#input-filename').value,
      includeGPX: document.querySelector('#input-gpx').checked,
      includeGeoJSON: document.querySelector('#input-geojson').checked
    })
  }

  useEffect(() => {
    const button = document.querySelector('#send-email')
    button.addEventListener('click', handleClick)
  }, [])

  const getContent = () => {
    if (props.type === 'email') {
      return (
        <div>
          <label htmlFor='input-to'>To</label>
          <input id='input-to' name='input-to' type='text' placeholder='example@myport.ac.uk'/> <br/>
          <label htmlFor='input-filename'>Filename</label>
          <input id='input-filename' name='input-filename' type='text' placeholder='myroute'/><br/>
          <label htmlFor='input-gpx'>Include GPX?</label>
          <input id='input-gpx' name='input-gpx'type='checkbox'/><br/>
          <label htmlFor='input-geojson'>Include GeoJSON?</label>
          <input id='input-geojson' name='input-geojson'type='checkbox'/><br/>
          <button id='send-email' className='share'>Send</button>
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
          <button className="share" onClick={() => props.setShow(!props.show)}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default Modal;