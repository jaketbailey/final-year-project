import { useEffect, useState } from 'react';
import './ElevationChart.css'
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

const ElevationChart = (props) => {
  
  useEffect(() => {
    const data = {
      // labels: props.coordinates.map((coordinate, index) => index),
      labels: props.coordinates.map((coordinate, index) => {
        const distance = props.summary.totalDistance;
        const kmDistance = ((Math.round((index / props.coordinates.length) * distance))/1000); // Distance in km
        const label = Math.round(kmDistance * 100) / 100
        return label;
      }),
      datasets: [{
        label: 'Elevation',
        spanGaps: true,
        pointRadius: 0,
        data: props.coordinates.map((coordinate) => coordinate.alt),
        backgroundColor: [
          'rgba(148, 221, 188, 0.6)'
          
        ],
        fill: 'start',
      }]
    }

    try {
      const chartInstance = ChartJS.getChart('elevation-chart');
      chartInstance.data = data;
      chartInstance.update();
    } catch (error) {
      console.log(error)
      const chartInstance = new ChartJS(document.getElementById('elevation-chart'), {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Elevation (m)'
              }
            },
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Distance (km)'
              },
              ticks: {
                autoSkip: true,
                maxTicksLimit: 20
              }
            }
          }
        }
      });
      chartInstance.update();
    }
  }, [props.coordinates, props.summary.totalDistance])

  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const chart = document.getElementById('main-chart');
    const showBtn = document.getElementById('elev-chart-show');
    const container = document.querySelector('.chart-container');
    showBtn.addEventListener('click', () => {
      setShowChart(!showChart);
    })
    if (showChart) {
      chart.style.display = 'block';
      showBtn.innerText = 'Hide Elevation Chart';
    } else {
      chart.style.display = 'none';
      showBtn.innerText = 'Show Elevation Chart';
    }
  }, [showChart])

  return (
    <div className="chart-container">
      <div className="chart-btns">
        <button id="elev-chart-show" className="btn btn-primary">Show</button>
      </div>
      <div id="main-chart">
        <canvas id="elevation-chart" className="chart"></canvas>
      </div>
    </div>
  )
}

export default ElevationChart;