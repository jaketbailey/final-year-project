import RoutePreferencesPanel from "../src/RoutePreferencesPanel/RoutePreferencesPanel";
import { render, act } from "@testing-library/react";

describe("RoutePreferencesPanel", () => {
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


        const component = render(
            <RoutePreferencesPanel
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