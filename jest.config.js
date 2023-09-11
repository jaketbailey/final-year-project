/** @returns {Promise<import('jest').Config>} */
module.exports = async () => {
  return {
    verbose: true,
    moduleNameMapper: {
      "\\.(scss|sass|css)$": "identity-obj-proxy",
      "react-leaflet": "<rootDir>/src/client/__tests/__mocks__/reactLeafletMock.js",
      "leaflet-routing-machine": "<rootDir>/src/client/__tests/__mocks__/leafletRoutingMachineMock.js"
    }
  };
};