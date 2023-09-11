import { render } from "@testing-library/react";
import OptionsPanel from "../src/OptionsPanel/OptionsPanel";

describe('Options Panel', () => {
    it('Should render successfully', () => {
        const geoJSONLink = '';
        const gpxLink = ''; 
        
        const component = render(
            <OptionsPanel 
                geoJSONLink={geoJSONLink} 
                gpxLink={gpxLink}
            />
        );

        expect(component).toMatchSnapshot();
    })
})