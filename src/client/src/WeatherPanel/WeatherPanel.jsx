
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
    // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${currentGeoLocation.latitude}&lon=${currentGeoLocation.longitude}&appid=${API_KEY}`)
    // const data = await response.json()
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${currentGeoLocation.latitude}&lon=${currentGeoLocation.longitude}&appid=${API_KEY}`)
    const data = await response.json()
    console.log(data)
    setWeather(data)
  }

  const getWindDirectionIcon = (windDirection) => {
    if (windDirection >= 0 && windDirection <= 22.5) {
      return 'N ↑'
    } else if (windDirection > 22.5 && windDirection <= 67.5) {
      return 'NE ↗'
    } else if (windDirection > 67.5 && windDirection <= 112.5) {
      return 'E →'
    } else if (windDirection > 112.5 && windDirection <= 157.5) {
      return 'SE ↘'
    } else if (windDirection > 157.5 && windDirection <= 202.5) {
      return 'S ↓'
    } else if (windDirection > 202.5 && windDirection <= 247.5) {
      return 'SW ↙'
    } else if (windDirection > 247.5 && windDirection <= 292.5) {
      return 'W ←'
    } else if (windDirection > 292.5 && windDirection <= 337.5) {
      return 'NW ↖'
    } else if (windDirection > 337.5 && windDirection <= 360) {
      return 'N ↑'
    }
  }

  const getUVIndexIcon = (uvIndex) => {
    let uvIndexIcon = ''
    if (uvIndex >= 0 && uvIndex < 2) {
      uvIndexIcon = '/img/all/uv-index-1.svg'
    } else if (uvIndex >= 2 && uvIndex < 3) {
      uvIndexIcon = '/img/all/uv-index-2.svg'
    } else if (uvIndex >= 3 && uvIndex < 4) {
      uvIndexIcon = '/img/all/uv-index-3.svg'
    } else if (uvIndex >= 4 && uvIndex < 5) {
      uvIndexIcon = '/img/all/uv-index-4.svg'
    } else if (uvIndex >= 5 && uvIndex < 6) {
      uvIndexIcon = '/img/all/uv-index-5.svg'
    } else if (uvIndex >= 6 && uvIndex < 7) {
      uvIndexIcon = '/img/all/uv-index-6.svg'
    } else if (uvIndex >= 7 && uvIndex < 8) {
      uvIndexIcon = '/img/all/uv-index-7.svg'
    } else if (uvIndex >= 8 && uvIndex < 9) {
      uvIndexIcon = '/img/all/uv-index-8.svg'
    } else if (uvIndex >= 9 && uvIndex < 10) {
      uvIndexIcon = '/img/all/uv-index-9.svg'
    } else if (uvIndex >= 10 && uvIndex < 11) {
      uvIndexIcon = '/img/all/uv-index-10.svg'
    } else {
        uvIndexIcon = '/img/all/uv-index-11.svg'
    }
    return uvIndexIcon
  }

  const getWindBeaufort = (windSpeed) => {
    let beaufort = 0
    if (windSpeed >= 0 && windSpeed <= 0.2) {
      beaufort = 0
    } else if (windSpeed > 0.2 && windSpeed <= 1.5) {
      beaufort = 1
    } else if (windSpeed > 1.5 && windSpeed <= 3.3) {
      beaufort = 2
    } else if (windSpeed > 3.3 && windSpeed <= 5.4) {
      beaufort = 3
    } else if (windSpeed > 5.4 && windSpeed <= 7.9) {
      beaufort = 4
    } else if (windSpeed > 7.9 && windSpeed <= 10.7) {
      beaufort = 5
    } else if (windSpeed > 10.7 && windSpeed <= 13.8) {
      beaufort = 6
    } else if (windSpeed > 13.8 && windSpeed <= 17.1) {
      beaufort = 7
    } else if (windSpeed > 17.1 && windSpeed <= 20.7) {
      beaufort = 8
    } else if (windSpeed > 20.7 && windSpeed <= 24.4) {
      beaufort = 9
    } else if (windSpeed > 24.4 && windSpeed <= 28.4) {
      beaufort = 10
    } else if (windSpeed > 28.4 && windSpeed <= 32.6) {
      beaufort = 11
    } else if (windSpeed > 32.6) {
      beaufort = 12
    }
    return `/img/all/wind-beaufort-${beaufort}.svg`
  }

  const getTemperatureIcon = (temperature) => {
    let temperatureIcon = ''
    if (temperature >= 0 && temperature <= 15) {
      temperatureIcon = '/img/all/thermometer-colder.svg'
    } else if (temperature > 15) {
      temperatureIcon = '/img/all/thermometer-warmer.svg'
    }
    return temperatureIcon
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
    if (!weather.current) return
    setIcon(`/img/openweathermap/${weather.current.weather[0].icon}.svg`)
  }, [weather])

  const checkWeather = () => {
    if (!weather.current) return;
    return (
      <>
      <div className="weather-panel__header">
        <h1>
          Weather 
        </h1>
      </div>
      <div className='panel-body'>
      <img src={icon} alt="weather icon" />
      <img src={getWindBeaufort(weather.current.wind_speed)} alt="beaufort"/>
      <img src={getTemperatureIcon(Math.round(weather.current.temp - 273.15))} alt="temperature"/>
      <img src={getUVIndexIcon(weather.current.uvi)} alt="uvi"/>
      <p>
        <span>Current Conditions:</span>
        <span>{weather.current.weather[0].main}</span>
      </p>
      <p>
        <span>Temperature:</span>
        <span>{Math.round(weather.current.temp - 273.15)}°C</span>
      </p>
      <p>
        <span>Feels like:</span>
        <span>{Math.round(weather.current.feels_like - 273.15)}°C</span>
      </p>
      <p>
        <span>Humidity:</span>
        <span>{weather.current.humidity}%</span></p>
      <p>
        <span>Wind Speed:</span>
        <span>{weather.current.wind_speed}mph</span></p>
      <p>
        <span>Wind Direction:</span>
        <span>{getWindDirectionIcon(weather.current.wind_deg)}</span>
      </p>
      <p>
        <span>UV Index:</span>
        <span>{weather.current.uvi}</span>
      </p>
      </div>
      </>
    )
  }

  return (
    <div className='weather-container'>
      <div className='weather-panel'>
        <div className="weather-panel__body">
          <button onClick={() => setShowWeather(!showWeather)}>
            <img src="/img/all/clear-day.svg" alt="weather button" />
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