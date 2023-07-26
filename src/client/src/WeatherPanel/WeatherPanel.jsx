
import { useEffect, useState } from 'react';
import './WeatherPanel.css'

const WeatherPanel = () => {
  const [weather, setWeather] = useState([])
  const [icon, setIcon] = useState('')
  const [showWeather, setShowWeather] = useState(false);
  const [geoLocation, setGeoLocation] = useState({});

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setGeoLocation(position.coords)
    })
  }, [])

  const API_KEY = 'cd23bb1d782fea9749efa44fa624ad6f'

  /**
   * @function getCurrentWeather
   * @description Fetches the current weather from the OpenWeatherMap API
   * @returns {Promise<void>}
   * @async
   */
  const getCurrentWeather = async (currentGeoLocation) => {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${currentGeoLocation.latitude}&lon=${currentGeoLocation.longitude}&appid=${API_KEY}`)
    const data = await response.json()
    setWeather(data)
  }

  // Show/hide the weather panel
  useEffect(() => {
    const weatherPanel = document.querySelector('.weather-panel__body__left')
    if (showWeather) {
      weatherPanel.style.width = 'auto'
      weatherPanel.style.height = 'auto'
    } else {
      weatherPanel.style.width = '0'
      weatherPanel.style.height = '0'
    }
  }, [showWeather])

  // Fetch the weather on page load
  useEffect(() => {
    console.log(geoLocation)
    getCurrentWeather(geoLocation);
  }, [geoLocation])
  
  // Set the weather icon
  useEffect(() => {
    if (!weather.weather) return
    setIcon(`/img/openweathermap/${weather.weather[0].icon}.svg`)
  }, [weather])

  const checkWeather = () => {
    if (!weather.weather) return;
    return (
      <>
      <div className="weather-panel__header">
        <h1>
          {weather.name} Weather 
        </h1>
      </div>
      <div className='panel-body'>
      <img src={icon} alt="weather icon" />
      <p>
        <span>Current Conditions:</span>
        <span>{weather.weather[0].main}</span>
      </p>
      <p>
        <span>Temperature:</span>
        <span>{Math.round(weather.main.temp - 273.15)}°C</span>
      </p>
      <p>
        <span>Feels like:</span>
        <span>{Math.round(weather.main.feels_like - 273.15)}°C</span>
      </p>
      <p>
        <span>Humidity:</span>
        <span>{weather.main.humidity}%</span></p>
      <p>
        <span>Wind Speed:</span>
        <span>{weather.wind.speed}mph</span></p>
      <p>
        <span>Wind Direction:</span>
        <span>{weather.wind.deg}°</span></p>
      </div>
      </>
    )
  }

  return (
    <div className='weather-container'>
      <div className='weather-panel'>
        <div className="weather-panel__body">
          <button onClick={() => setShowWeather(!showWeather)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" fill="currentColor" class="bi bi-sun" viewBox="0 0 16 16"> <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/> </svg>
          </button>
          <div className="weather-panel__body__left">
            {checkWeather()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherPanel;