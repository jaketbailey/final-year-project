import { useEffect, useRef, useState } from 'react';
import './ElevationChart.css'
import { Chart as ChartJS, registerables} from 'chart.js';
import L from 'leaflet';
ChartJS.register(...registerables);

const ElevationChart = (props) => {

  const dataRef = useRef([]);
  const localMapRef = useRef(null);
  
  useEffect(() => {

    let circle = new L.CircleMarker();

    const onHover = (event, chartElement) => {
      localMapRef.current.removeLayer(circle);
      const coordinate = getCoordinate(chartElement);
      if (!coordinate) return;
      circle = L.circle([coordinate.lat, coordinate.lng], {radius: 100}).addTo(localMapRef.current);
    }
  
    const getCoordinate = (chartElement) => {
      if (!chartElement[0]) return;
      const index = chartElement[0].index;
      const coordinate = dataRef.current[index];
      return coordinate;
    }

    const getData = () => {
      dataRef.current = props.coordinates;
      return props.coordinates.map((coordinate) => {
      if (!localMapRef.current) {
        localMapRef.current = props.mapRef;
      }
        return coordinate.alt;
      })
    }

    const data = {
      labels: props.coordinates.map((coordinate, index) => {
        const distance = props.summary.totalDistance;
        const kmDistance = ((Math.round((index / props.coordinates.length) * distance))/1000); // Distance in km
        const label = Math.round(kmDistance * 100) / 100
        return label;
      }),
      datasets: [{
        label: 'Elevation',
        spanGaps: true,
        data: getData(),
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
          pointRadius: 0,
          hoverRadius: 0,
          onHover: onHover,
          interaction: {
            mode: 'index',
            intersect: false,

          },
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
        },
        plugins: {
          
        },
      });
      chartInstance.update();
    }
  }, [props.coordinates, props.summary.totalDistance, props.mapRef])

  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const chart = document.getElementById('main-chart');
    const showBtn = document.getElementById('elev-chart-show');
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