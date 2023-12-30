import './LeftPanel.css';
import WeatherPanel from './WeatherPanel/WeatherPanel';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const LeftPanel = (props) => {
    const G_CLIENT_ID = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID

    return (
        <div className="left-panel__container">
            <div className="left-panel">
                <WeatherPanel/>
                <div className="map-legend">
                <h1 className='legend'>Map Legend</h1>
                    <div><img src="/img/routing/waypoint.svg" className="panelImg"/></div>
                    <div>Route Waypoints</div><hr/>
                    <div><img src="/img/routing/attractions.svg" className="panelImg"/></div>
                    <div>POI - Attractions</div><hr/>
                    <div><img src="/img/routing/accommodation.svg" className="panelImg"/></div>
                    <div>POI - Accommodation</div><hr/>
                </div>
                <div>
                    <GoogleOAuthProvider clientId={G_CLIENT_ID}>
                    <GoogleLogin
                        onSuccess={credentialResponse => {
                            // console.log(credentialResponse);
                            props.setGToken(credentialResponse);
                        }}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                    />
                    </GoogleOAuthProvider>
                </div>
            </div> 
        </div>
    )
}

export default LeftPanel;