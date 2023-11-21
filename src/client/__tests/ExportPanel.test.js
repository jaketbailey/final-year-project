import { render } from "@testing-library/react";
import ExportPanel from "../src/ExportPanel/ExportPanel";

describe('Export Panel', () => {
    it('Should render successfully', () => {
        const geoJSONLink = '';
        const gpxLink = ''; 
        
        const component = render(
            <ExportPanel 
                geoJSONLink={geoJSONLink} 
                gpxLink={gpxLink}
            />
        );

        expect(component).toMatchSnapshot();
    })
})