import WeatherPanel from '../src/WeatherPanel/WeatherPanel';
import { render, act } from '@testing-library/react';
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

describe('WeatherPanel', () => {
    it('should render correctly', async () => {
        const fetchMock = jest
            .spyOn(global, 'fetch') 
            .mockImplementation(() =>
                Promise.resolve({ json: () => Promise.resolve([]) })
            );

        // Mock getCurrentPosition and watchPosition using Object.defineProperty
        const mockGeolocation = {
            getCurrentPosition: jest.fn(),
            watchPosition: jest.fn()
        };
        Object.defineProperty(global.navigator, 'geolocation', {
            value: mockGeolocation,
            writable: true
        });

        global.fetch = fetchMock;

        let component;
        await act(() => {
            component = render(<WeatherPanel />);
        })
        expect(component).toMatchSnapshot();
    });
});