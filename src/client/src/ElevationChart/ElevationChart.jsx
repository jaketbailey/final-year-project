import { useEffect, useRef, useState } from 'react';
import './ElevationChart.css'
import { Chart as ChartJS, registerables} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

import L from 'leaflet';
ChartJS.register(...registerables, zoomPlugin);

/**
 * @function ElevationChart
 * @description Creates a chart of the elevation profile of the route
 * @param {*} props 
 * @returns ElevationChart component
 */
const ElevationChart = (props) => {

  const dataRef = useRef([]);
  const localMapRef = useRef(null);
  
  useEffect(() => {
    
    let circle = new L.circle();

    /**
     * @function onHover
     * @description When hovering over a point on the chart, a circle is drawn on the map at the corresponding coordinate
     * @param {*} event 
     * @param {*} chartElement 
     * @returns false if no coordinate is found
     */
    const onHover = (event, chartElement) => {
      if (event.type === 'mouseout') {
        onHoverOut(event, chartElement);
        return;
      } 
      localMapRef.current.removeLayer(circle);
      const coordinate = getCoordinate(chartElement);
      if (!coordinate) return;
      circle = L.circle([coordinate.lat, coordinate.lng], {radius: 100, color: "#C70039"}).addTo(localMapRef.current);
    }

    const onHoverOut = (event, chartElement) => {
      localMapRef.current.removeLayer(circle);
    }

    /**
     * @function onClick
     * @description When clicking on a point on the chart, the map will fly to the corresponding coordinate
     * @param {*} event 
     * @param {*} chartElement 
     * @returns false if no coordinate is found
     */
    const onClick = (event, chartElement) => {
      console.log(chartElement)
      const coordinate = getCoordinate(chartElement);
      if (!coordinate) return;
      localMapRef.current.flyTo([coordinate.lat, coordinate.lng], 15);
    }

    const onZoomComplete = ({chart}) => {
      const {min, max} = chart.scales.x;
      console.log(chart.scales.x)
      const coordinates = getCoordinate([], [min, max])
      localMapRef.current.flyToBounds(coordinates)
    }
  
    /**
     * @function getCoordinate
     * @description Gets the coordinate from the dataRef based on the index of the chartElement
     * @param {*} chartElement 
     * @returns coordinate object if chartElement exists, otherwise returns false
     */
    const getCoordinate = (chartElement, minMax) => {
      if (minMax) {
        const coordinates = [[dataRef.current[minMax[0]]],[dataRef.current[minMax[1]]]]
        return coordinates;
      }
      if (!chartElement[0]) return;
      const index = chartElement[0].index;
      const coordinate = dataRef.current[index];
      return coordinate;
    }

    /**
     * @function getData
     * @description Sets a local reference to the current coordinates and creates an array of altitudes
     * @returns Array of altitudes from the coordinates array
     */
    const getData = () => {
      dataRef.current = props.coordinates;
      return props.coordinates.map((coordinate) => {
      if (!localMapRef.current) {
        localMapRef.current = props.mapRef;
      }
        return coordinate.alt;
      })
    }
    
    /**
     * @constant data
     * @description Sets the data for the chart
     */
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
          'rgba(215, 76, 116, 0.6)'
        //   // 'rgba(148, 221, 188, 0.6)'
        ],
        fill: 'start',
      }]
    }

    /**
     * Try to get the chart instance and update the data
     * If the chart does not exist, create a new chart
     */
    try {
      const chartInstance = ChartJS.getChart('elevation-chart');
      props.chartRef.current = chartInstance;
      chartInstance.data = data;
      chartInstance.update();
    } catch (error) {
      console.log(error)
      /**
       * @constant chartInstance
       * @description Creates a new chart instance
       * @returns ChartJS instance
       * @see https://www.chartjs.org/docs/latest/
       */
      const chartInstance = new ChartJS(document.getElementById('elevation-chart'), {
        type: 'line',
        data: data,
        options: {
          animation: false,
          pointRadius: 0,
          hoverRadius: 5,
          onHover: onHover,
          onClick: onClick,
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
          },
          plugins: {
            legend: {
              display: false,
            },
            zoom: {
              zoom: {
                drag: {
                  enabled: true,
                  backgroundColor: "rgba(245, 40, 145, 0.8)",
                  borderColor: "rgba(255, 20, 255, 0.8)",
                  modifierKey: 'ctrl',
                },
                onZoomComplete: (chart) => {onZoomComplete(chart)},
                // wheel: {
                //   enabled: true,
                // },
                // pinch: {
                //   enabled: true
                // },
                mode: 'x',
              },
              pan: {
                enabled: true,
                mode: 'x',
              },
              limits: {
                x: {
                  min: 0,
                  max: props.summary.totalDistance,
                },
              },
            },
          },
        },
      });

      props.chartRef.current = chartInstance;
      chartInstance.update();
    }
  }, [props.coordinates, props.summary.totalDistance, props.mapRef])

  /**
   * @constant showChart
   * @description Sets the display of the chart
   */
  const [showChart, setShowChart] = useState(true);

  useEffect(() => {
    const chart = document.getElementById('main-chart');
    const showBtn = document.getElementById('elev-chart-show');
    /**
     * @type {HTMLButtonElement}
     * @listens showBtn#click
     * @description Toggles the display of the chart
     */
    showBtn.addEventListener('click', () => {
      setShowChart(!showChart);
    })
    if (showChart) {
      chart.style.height = "11rem"
      chart.style.paddingBottom = "2rem"
      showBtn.innerText = 'Hide Elevation Chart';
    } else {
      chart.style.height = "0px"
      chart.style.paddingBottom = "0px"
      showBtn.innerText = 'Show Elevation Chart';
    }
  }, [showChart])

  return (
    <div className="chart-container">
      <div className="chart-btns">
        <button id="elev-chart-show" className="btn btn-primary">Show</button>
      </div>
      <div id="main-chart">
        <button className="btn btn-primary" onClick={() => {
          props.chartRef.current.resetZoom();
          props.chartRef.current.update();
        }}>Reset Zoom</button>
        <canvas id="elevation-chart" className="chart"></canvas>
      </div>
    </div>
  )
}

export default ElevationChart;