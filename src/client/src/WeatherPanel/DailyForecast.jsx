

const DailyForecast = (props) => {

  class DailyItem {
    constructor(day) {
      this.date = new Date(day.dt * 1000);
      this.temp = Math.round(day.temp.day - 273.15);
      this.icon = day.weather[0].icon;
      this.desc = day.weather[0].main;
    }     
  }

  console.log(props.daily)

  const forecastArray = [];

  if (!props.daily) return;

  for (const [i, day] of props.daily.entries()) {
    if (i !== 0) {
      const dailyItem = new DailyItem(day);
      console.log(dailyItem);
      forecastArray.push(<DailyItem key={i} day={day} />);
    }
  }

  return (
    <div>
      <h1>This Week's Forecast</h1>
    </div>
  )
}

export default DailyForecast;