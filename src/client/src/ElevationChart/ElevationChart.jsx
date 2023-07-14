import { useEffect } from 'react';
import './ElevationChart.css'
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

const ElevationChart = (props) => {

  useEffect(() => {
    const data = {
      labels: props.coordinates.map((coordinate, index) => index),
      datasets: [{
        label: 'Elevation',
        data: props.coordinates.map((coordinate) => coordinate.alt),
        backgroundColor: [
          'rgba(131, 103, 199, 0.2)',
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
              beginAtZero: true
            }
          }
        }
      });
      chartInstance.update();
    }
  }, [props.coordinates])

  return (
    <div className="chart-container">
      <canvas id="elevation-chart">

      </canvas>
    </div>
  )
}

export default ElevationChart;