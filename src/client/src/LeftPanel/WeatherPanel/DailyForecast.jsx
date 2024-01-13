import './DailyForecast.css'

/**
 * Functional component representing the daily weather forecast for the upcoming week.
 * It displays information for each day, including the day name, date, weather icon, temperature range, and weather condition.
 * The weather data is provided as props and is fetched from the OpenWeatherMap API.
 *
 * @component DailyForecast
 * @param {object} props - The properties passed to the component.
 * @param {Array} props.daily - An array containing daily weather forecast data.
 * @returns {JSX.Element} JSX representing the daily weather forecast.
 */
const DailyForecast = (props) => {
  const getDayString = (index) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[index];
  }

  const DailyItem = (props) => {
    const getFullDate = () => {
      const date = new Date(props.day.dt * 1000);
      return (
        <>
            {getDayString(date.getDay())}
            <br/>
            {`${date.getDate()}/${date.getMonth() + 1}`}
        </>
      )
    }

    const getIcon = () => {
      return <img src={`/img/openweathermap/${props.day.weather[0].icon}.svg`} height={'0.5rem'}/>
    }

    return(
      <div id={`daily-item-${props.id}`} className="daily-item">
          <div className="daily-details">{getFullDate()}</div>
          <div className="daily-details">{getIcon()}</div>
          <div className="daily-details">{`${Math.round(props.day.temp.min - 273.15)}-${Math.round(props.day.temp.max - 273.15)}`}°C</div>
          <div className="daily-details">{props.day.weather[0].main}</div>
      </div>
    )
  }

  const forecastArray = [];

  if (!props.daily) return;

  for (const [i, day] of props.daily.entries()) {
    if ((i > 0) && (i < 7)) {
      forecastArray.push(<DailyItem id={i} day={day} />);
    }
  }

  return (
    <div>
      <h1>This Week's Forecast</h1>
      <div className="week-forecast">
        {forecastArray}
      </div>
    </div>
  )
}

export default DailyForecast;