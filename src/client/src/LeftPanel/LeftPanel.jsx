import './LeftPanel.css';
import WeatherPanel from './WeatherPanel/WeatherPanel';

const LeftPanel = (props) => {

    return (
        <div className="left-panel__container">
            <div className="left-panel">
                <WeatherPanel/>
                <div className="map-legend">
                <h1 className='legend'>Map Legend</h1>
                    <div><img src="/img/routing/waypoint.svg" className="panelImg"/></div>
                    <div>Route Waypoints</div><hr/>
                    <div><img src="/img/routing/hazard.svg" className="panelImg"/></div>
                    <div>Hazards</div><hr/>
                    <div><img src="/img/routing/attractions.svg" className="panelImg"/></div>
                    <div>POI - Attractions</div><hr/>
                    <div><img src="/img/routing/accommodation.svg" className="panelImg"/></div>
                    <div>POI - Accommodation</div><hr/>
                </div>
            </div> 
        </div>
    )
}

export default LeftPanel;