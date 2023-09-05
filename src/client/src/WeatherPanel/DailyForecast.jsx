

const DailyForecast = (props) => {

  const DailyItem = (props) => {
    const getFullDate = () => {
      const date = new Date(props.day.dt * 1000);
      return `${date.getDay()}/${date.getMonth()}`
    }
    return(
      <div id={`daily-item-${props.id}`} className="daily-item">
          <div>{getFullDate()}</div>
          <div>{Math.round(props.day.temp.day - 273.15)}°C</div>
          <div>{props.day.weather[0].icon}</div>
          <div>{props.day.weather[0].main}</div>
      </div>
    )
  }

  console.log(props.daily)

  const forecastArray = [];

  if (!props.daily) return;

  for (const [i, day] of props.daily.entries()) {
    if (i !== 0) {
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