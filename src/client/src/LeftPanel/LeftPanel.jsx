import './LeftPanel.css';
import WeatherPanel from './WeatherPanel/WeatherPanel';


/**
 * Functional component representing the left panel of the application.
 * It includes a weather panel and a map legend.
 *
 * @component
 * @param {object} props - The properties passed to the component.
 * @returns {JSX.Element} JSX representing the left panel.
 */
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
                    <div><img src="/img/routing/cycling_infrastructure.svg" className="panelImg"/></div>
                    <div>Cycling Infrastructure</div><hr/>
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