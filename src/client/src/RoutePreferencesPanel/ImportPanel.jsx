import { useEffect, useState } from "react";

const ImportPanel = (props) => {

    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null);
  

    useEffect(() => {
        // console.log(props.showPanel)
        const panel = document.querySelector('.import-panel');
        if (panel) {
            if (props.showPanel) {
                panel.style.width = 'auto';
                panel.style.height = 'auto';
              } else {
                panel.style.width = '0';
                panel.style.height = '0';
              }
        }
    }, [props.showPanel])

    const extractWaypoints = (data) => {
        const wptArr = []
        const latLngs = [];
    
        if (fileType === 'gpx') {
          // Parse GPX data and extract latLngs of waypoints
          const wptArr = [];
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, 'text/xml');
          const waypoints = xmlDoc.querySelectorAll('wpt');
      
          waypoints.forEach((waypoint) => {
            const lat = parseFloat(waypoint.getAttribute('lat'));
            const lon = parseFloat(waypoint.getAttribute('lon'));
            latLngs.push(L.latLng(lat, lon));
            wptArr.push([lat, lon]);
          });
    
        } else if (fileType === 'geojson') {
          const geoJSON = JSON.parse(data);
          geoJSON.features.forEach((feature) => {
              const type = feature.geometry.type;
              const coordinates = feature.geometry.coordinates;
              if (type === 'Point') {
              latLngs.push(L.latLng(coordinates[1], coordinates[0]));
                wptArr.push([coordinates[1], coordinates[0]]);
              }
          });
        }
        localStorage.setItem('waypoints', wptArr)
        props.control.current.setWaypoints(latLngs);
      };
    
    
      const handleFileChange = (e) => {
        console.log(e.target.files)
        const file = e.target.files[0];
        const fileDetails = e.target.value.split('.')
        const type = fileDetails[fileDetails.length - 1];
        setFile(file);
        setFileType(type);
      }
    
      const handleFileUpload = (e) => {
        if (file !== null) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (fileType === 'geojson') {
              const currentFile = e.target.result;
              extractWaypoints(currentFile);
              return;
            } else if (fileType === 'gpx') {
              const currentFile = e.target.result;
              extractWaypoints(currentFile);
              return;
            }
          };
          
          reader.readAsText(file);
        }
      }

    return (
        <div className='import-panel'>
            <input className='importFileSelect' type='file' onChange={handleFileChange} />
            <button className='importFileBtn' onClick={handleFileUpload}>Load File</button>
        </div>
    )
}

export default ImportPanel;