import './OptionsPanel.css';

const OptionsPanel = (props) => {
    const saveGeoJSON = (type) => {
        props.geoJSONLink.click();
    }

    return (
        <div className="options-panel__container">
            <div className="options-panel">
               <div> 
                    <button className="options-panel__button" onClick={saveGeoJSON} >
                         <img src="/img/save-route/geojson-file.svg" alt="Save Route as GeoJSON" title="Save Route as GeoJSON"/>    
                    </button>
                    <button className="options-panel__button" onClick={saveGeoJSON} >
                         <img src="/img/save-route/gpx-file.svg" alt="Save Route as GPX" title="Save Route as GPX"/>    
                    </button> 
                </div> 
            </div>
        </div>
    )
}

export default OptionsPanel;