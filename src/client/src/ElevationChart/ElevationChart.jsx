import { useEffect } from 'react';
import './ElevationChart.css'
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

const ElevationChart = (props) => {
  
  useEffect(() => {
    const data = {
      // labels: props.coordinates.map((coordinate, index) => index),
      labels: props.coordinates.map((coordinate, index) => {
        const distance = props.summary.totalDistance;
        const label = (Math.round((index / props.coordinates.length) * distance))/1000; // Distance in km
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

  return (
    <div className="chart-container">
      <canvas id="elevation-chart"></canvas>
    </div>
  )
}

export default ElevationChart;