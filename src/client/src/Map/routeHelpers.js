import { useEffect } from "react";
import { useMap } from "react-leaflet";


/**
   * @function getGeoJSON
   * @param {Array} instructions 
   * @param {Array} coordinates 
   * @description Creates a GeoJSON object from the route instructions and coordinates
   * @returns GeoJSON object
   */
export const getGeoJSON = (instructions, coordinates) => {
  const formatter = new L.Routing.Formatter();
  const instructionPts = {
    type: 'FeatureCollection',
    features: []
  };

  for (const instruction of instructions) {
    const g = {
      type: 'Point',
      coordinates: [coordinates[instruction.index].lng, coordinates[instruction.index].lat],
    }

    const p = {
      instruction: formatter.formatInstruction(instruction),
    };

    instructionPts.features.push({
      geometry: g,
      type: 'Feature',
      properties: p,
    });
  }
  
  for (const [index, coordinate] of coordinates.entries()) {
    let g; 
    
    if (index === 0) {
      g = {
        type: 'LineString',
        coordinates: [coordinate.lng, coordinate.lat],
      };
    } else {        
      g = {
        type: 'LineString',
        coordinates: [[coordinates[index-1].lng, coordinates[index-1].lat], [coordinate.lng, coordinate.lat]],
      };
    }
    instructionPts.features.push({
      geometry: g,
      type: 'Feature',
      properties: {},
    });
  }
  
  return instructionPts;
}

/**
 * @function exportGPX
 * @param {Object} geoJSON
 * @description Exports the GeoJSON object as a .geojson file
 * @returns null
 */
export const exportGPX = (gpx, setGPX, setGPXLink) => { 
  const blob = new Blob([gpx], {type: 'text/xml'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'route.gpx';
  link.href = url;
  setGPX(gpx);
  setGPXLink(link);
}

const distanceBetweenCoords = (coordinate1, coordinate2) => {
  const R = 6371; // km
  const dLat = (coordinate2.lat - coordinate1.lat) * Math.PI / 180;
  const dLon = (coordinate2.lng - coordinate1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coordinate1.lat * Math.PI / 180) * Math.cos(coordinate2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return d;
}

/**
 * @function getGPX
 * @param {Array} instructions
 * @param {Array} coordinates
 * @description Creates a GPX file from the route instructions and coordinates
 * @returns GPX file
 * @see https://www.topografix.com/GPX/1/1/
 */
export const getGPX = (instructions, coordinates, stravaData) => {
  const formatter = new L.Routing.Formatter();
  const currentTime = new Date().toISOString();
  let gpx = '<?xml version="1.0" encoding="UTF-8"?>\n';
  gpx += '<gpx version="1.1" creator="Cycling Route Planner" xmlns="http://www.topografix.com/GPX/1/1">\n';
  
  // Add waypoints for each instruction
  for (const instruction of instructions) {
    gpx += `  <wpt lat="${coordinates[instruction.index].lat}" lon="${coordinates[instruction.index].lng}">\n`;
    gpx += `    <name>${formatter.formatInstruction(instruction)}</name>\n`;
    gpx += `  </wpt>\n`;
  }
  // Add tracks for each coordinate
  gpx += `  <trk>\n    <trkseg>\n`;

  if (stravaData) {
    const previousCoords = {};
    let distance = 0;
    let time;
    for (const [index, coordinate] of coordinates.entries()) {
      if (index === 0) {
        previousCoords.lat = coordinate.lat;
        previousCoords.lng = coordinate.lng;
      } else {
        distance += distanceBetweenCoords(previousCoords, coordinate);
        time = distance / stravaData.speed;
        previousCoords.lat = coordinate.lat;
        previousCoords.lng = coordinate.lng;
      }

      if (time !== undefined){
        //get seconds from hours
        const hours = Math.trunc(time);
        const minutes = Math.trunc((time - hours) * 60);
        const seconds = Math.trunc((time - hours - (minutes / 60)) * 3600);

        console.log(stravaData.start)
        const startDate = new Date(stravaData.start);
        startDate.setHours(startDate.getHours() + hours);
        startDate.setMinutes(startDate.getMinutes() + minutes);
        startDate.setSeconds(startDate.getSeconds() + seconds);
        const timeElapsed = startDate.toISOString();
        
        gpx += `      <trkpt lat="${coordinate.lat}" lon="${coordinate.lng}">\n`;
        gpx += `        <ele>${coordinate.alt}</ele>\n`;
        gpx += `        <time>${timeElapsed}</time>\n`;
        gpx += '      </trkpt>\n';
      }
    }
  } else {
    for (const coordinate of coordinates) {
      gpx += `      <trkpt lat="${coordinate.lat}" lon="${coordinate.lng}">\n`;
      gpx += `        <ele>${coordinate.alt}</ele>\n`;
      gpx += `        <time>${currentTime}</time>\n`;
      gpx += '      </trkpt>\n';
    }
  }
  gpx += `    </trkseg>\n  </trk>\n`;
  gpx += '</gpx>';
  return gpx;
}

/**
 * @function exportGeoJSON
 * @param {Object} geoJSON
 * @description Exports the GeoJSON object as a .geojson file
 * @returns null
 */
export const exportGeoJSON = (geoJSON, setGeoJSON, setGeoJSONLink) => {
  const data = JSON.stringify(geoJSON);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'route.geojson';
  link.href = url;
  setGeoJSON(data);
  setGeoJSONLink(link); 
}

export const createStravaActivity = async (gpx, stravaData, stravaAccessToken) => {
  console.log('create func called')

  if (stravaAccessToken === null) {
    return;
  }
  console.log(stravaData)
  if (stravaData === null) {
    return;
  }

  const body = {
    'access_token': stravaAccessToken.access_token,
    'name': stravaData.name,
    'type': 'Ride',
    'start_date_local': new Date(stravaData.start).toISOString(),
    'route': gpx,
  }

  console.log('activity here')
  console.log(body)
  const response = fetch('/api/create-strava-activity', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const res = await response;
  console.log(res)
  
  const createActivityBtn = document.querySelector('#create-activity-btn');
  if (res.status === 200) {
    console.log('Successfully created activity')
    createActivityBtn.classList.add('success');
    createActivityBtn.textContent = 'Activity Created';
  }
  if (res.status === 404) {
    console.log('Failed');
    createActivityBtn.classList.add('fail');
    createActivityBtn.textContent = 'Activity not created';
  }
  setTimeout(() => {
    createActivityBtn.classList.remove('success');
    createActivityBtn.classList.remove('fail');
    createActivityBtn.textContent = 'Create Activity';
  }, 1000);
}

const calculateDistance = (coord1, coord2) => {
  const deltaX = coord2[0] - coord1[0];
  const deltaY = coord2[1] - coord1[1];
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

export const findFurthestCoordinates = (coordinates) => {
  let maxDistance = 0;
  let furthestCoords = [];

  for (let i = 0; i < coordinates.length; i++) {
    for (let j = i + 1; j < coordinates.length; j++) {
      const distance = calculateDistance(coordinates[i], coordinates[j]);

      if (distance > maxDistance) {
        maxDistance = distance;
        furthestCoords = [coordinates[i], coordinates[j]];
      }
    }
  }

  return furthestCoords;
}

export const convertRouteToGarminJSON = (route) => {
  const activity = localStorage.getItem('vehicleType');
  if(activity) {
    const activityTypes = {
      'cycling-road': 'ROAD_CYCLING',
      'cycling-regular': 'OTHER',
      'cycling-mountain': 'MOUNTAIN_BIKING' ,
      'cycling-electric': 'OTHER',
      'foot-walking': 'RUNNING'
    }
  
    // convert ORS vehicle type to Garmin activity type
    const garminActivity = activityTypes[activity];
  
  // RUNNING, HIKING, OTHER, MOUNTAIN_BIKING, TRAIL_RUNNING, ROAD_CYCLING, GRAVEL_CYCLING
  
    // Extract distance, elevation gain, and loss from the route
    const distance = route.summary.totalDistance;
    const elevationGain = route.summary.totalAscend;
    const elevationLoss = route.summary.totalDescend;
  
    // Extract geoPoints from the route
    const geoPoints = route.coordinates.map(coord => {
        return {
            latitude: coord.lat,
            longitude: coord.lng,
            elevation: coord.alt
        };
    });
  
    // Define other properties
    const coordinateSystem = "WGS84";
  
    // Construct the final JSON object
    const jsonObject = {
        // courseId,
        distance,
        elevationGain,
        elevationLoss,
        geoPoints,
        garminActivity,
        coordinateSystem
    };
    console.log(jsonObject)
    return jsonObject;
  }
}
