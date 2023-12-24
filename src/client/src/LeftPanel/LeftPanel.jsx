import './LeftPanel.css';
import WeatherPanel from './WeatherPanel/WeatherPanel';

const LeftPanel = (props) => {
    return (
        <div className="left-panel__container">
            <div className="left-panel">
                <WeatherPanel/>
            </div> 
        </div>
    )
}

export default LeftPanel;