import ElevationChart from '../src/ElevationChart/ElevationChart'
import { render } from '@testing-library/react'
import Chart from 'chart.js'

describe('ElevationChart', () => {
    it('renders without crashing', () => {
        const coordinates = [47.6062, -122.3321]
        const summary = {
            totalDistance: 0,
        }
        const map = {
            current: {
            }
        }

        const mockChart = jest.spyOn(Chart, 'Chart').mockImplementation(() => {
            return {
                destroy: jest.fn(),
                update: jest.fn(),
                getChart: jest.fn(),
            }
        })

        global.chartInstance = mockChart;

        const component = render(
            <ElevationChart 
                coordinates={coordinates}
                summary={summary}
                mapRef={map}
            />
        );

        expect(component).toMatchSnapshot();
    })
});