// Import necessary libraries
import L from 'leaflet';

const HERE_APP_ID = import.meta.env.VITE_HERE_API_APP_ID;
const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY;

// Define your custom Nominatim geocoder class
L.Control.NominatimGeocoder = L.Class.extend({
  options: {
    apiKey: HERE_API_KEY,
    lang: 'en-US',
    geocodingQueryParams: {},
  },

  initialize: function (options) {
    console.log('initgeocode')
    options
    L.Util.setOptions(this, options);
  },

  geocode: async function (query, cb, context) {
    const params = {
      q: query,
      apiKey: this.options.apiKey,
      lang: this.options.lang,
      ...this.options.geocodingQueryParams,
    };

    try {
      this.getJSON('https://revgeocode.search.hereapi.com/v1/geocode', params, function (data) {
        const results = [];
        console.log(data.items[0])
        const bbox = data.items[0].mapView;
        const bounds = L.latLngBounds([bbox.south, bbox.west], [bbox.north, bbox.east]);

        results.push({
          name: data.items[0].title,
          bbox: bounds,
          center: bounds.getCenter(),
          html: data.items[0].title,
          properties: data.items[0],
        });

        cb.call(context, results);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      cb.call(context, []); // Call callback with an empty array in case of an error
    }
  },

  reverse: async function (latlng, scale, cb, context) {
    const params = {
      apiKey: this.options.apiKey,
      at: `${latlng.lat},${latlng.lng}`,
      lang: this.options.lang,
      ...this.options.geocodingQueryParams,
    };
    
    setTimeout(() => {
      const wpts = JSON.parse(localStorage.getItem('waypoints'))
      if (wpts.length <= 6){
        console.log('do geocode')
        this.getJSON('https://revgeocode.search.hereapi.com/v1/revgeocode', params, function (data) {
          const results = [];
          console.log(data.items[0])
          const bbox = data.items[0].mapView;
          const bounds = L.latLngBounds([bbox.south, bbox.west], [bbox.north, bbox.east]);
  
          results.push({
            name: data.items[0].title,
            bbox: bounds,
            center: bounds.getCenter(),
            html: data.items[0].title,
            properties: data.items[0],
          });
  
          cb.call(context, results);
        });
      } else {
        console.log('do not geocode')
        cb.call(context, [])
      }
    }, 1000);

  },

  suggest: async function (text, cb, context) {
    const params = {
      q: text,
      apiKey: this.options.apiKey,
      lang: this.options.lang,
      ...this.options.geocodingQueryParams,
    };

    try {
      this.getJSON('https://autocomplete.search.hereapi.com/v1/geocode', params, function (data) {
        const suggestions = data.items.map(item => {
          console.log(item)
        const bbox = item.mapView;
          const bounds = L.latLngBounds([bbox.south, bbox.west], [bbox.north, bbox.east]);
          return {
            name: data.items[0].title,
            bbox: bounds,
            center: bounds.getCenter(),
            html: data.items[0].title,
            properties: data.items[0],
          };
        });
        cb.call(context, suggestions);
      });
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        cb.call(context, []); // Call callback with an empty array in case of an error
      }
    },


  getJSON: async function (url, params, callback) {
    const queryString = this.getParamString(params);
    const fullUrl = `${url}?${queryString}`;
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      callback(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  },

  getParamString: function (params) {
    // Helper function to build a query string from an object
    const pairs = [];
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }
    }
    return pairs.join('&');
  },
});

export default L.Control.NominatimGeocoder;