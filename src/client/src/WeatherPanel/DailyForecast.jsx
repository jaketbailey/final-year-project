import './DailyForecast.css'

const DailyForecast = (props) => {

  const DailyItem = (props) => {
    const getFullDate = () => {
      const date = new Date(props.day.dt * 1000);
      console.log(date)
      return `${date.getDate()}/${date.getMonth() + 1}`
    }

    const getIcon = () => {
      return <img src={`/img/openweathermap/${props.day.weather[0].icon}.svg`} height={'0.5rem'}/>
    }

    return(
      <div id={`daily-item-${props.id}`} className="daily-item">
          <div className="daily-details">{getFullDate()}</div>
          <div className="daily-details">{getIcon()}</div>
          <div className="daily-details">{Math.round(props.day.temp.day - 273.15)}°C</div>
          <div className="daily-details">{props.day.weather[0].main}</div>
      </div>
    )
  }

  console.log(props.daily)

  const forecastArray = [];

  if (!props.daily) return;

  for (const [i, day] of props.daily.entries()) {
    console.log(i)
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