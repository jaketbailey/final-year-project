import LeftPanel from "../src/LeftPanel/LeftPanel";
import { render } from "@testing-library/react";
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

describe("LeftPanel", () => {
    it("should render", () => {
        const geoJSONLink = "";
        const gpxLink = "";
        const setAvoidFeatures = jest.fn();
        const avoidFeatures = [];
        const control = {current: {
            getRouter: jest.fn(() => ({
                getFeatures: jest.fn(() => []),
                options: {
                    routingQueryParams: {
                        options: {
                            avoid_features: []
                        },
                    },
                }
            })),
            route: jest.fn(),
        }};

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

        const component = render(
            <LeftPanel
                geoJSONLink={geoJSONLink} 
                gpxLink={gpxLink}
                setAvoidFeatures={setAvoidFeatures}
                avoidFeatures={avoidFeatures}
                control={control}
            />
        );

        expect(component).toMatchSnapshot();
    });
});