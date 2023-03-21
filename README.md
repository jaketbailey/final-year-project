# Cycling Route Planner

The idea is to create a Web Application which will be a cycling route planner.

I came up with this idea as I was thinking back to when I planned the route to cycle Land’s End to John O’Groats, and at the time, I couldn’t find a sufficient application to allow for a quicker route planning solution for the whole ride, including stops across the journey.

I was forced to plot the route end manually and export that to a GPX file to load up on a GPS Mapping application on my phone and create printouts of route instructions. This task that should’ve been quick and simple was a rather tenuous and lengthy process and a lot of research on which roads to take and which were safer along our chosen route. 

My plan for this application is to solve most if not all of the issues I faced in 2016 and create an application with a good balance of route customisation and automated route planning which would’ve been perfect for mine, and I imagine many people’s needs.

It will plot the routes using OpenStreetMap and OSRM (Open Source Routing Machine). I plan on considering a range of different data to determine the route which will be plotted. 

The data being:

- Location of Accommodation
    - Allow user to enter location of their accommodation that wish to stay at along the route.
    - The routing engine will plan routes which are within a certain radius of these locations.
    - User selectable radius, allowing them to customise 1 mile, 2 mile radius etc.
- A Hazard Index
    - This will be compiled of user-entered data into a separate page of the web application with a location and hazard type based on the OSM Hazards categories [https://wiki.openstreetmap.org/wiki/Category:Hazards](https://wiki.openstreetmap.org/wiki/Category:Hazards) stored in a PSQL database.
    - It will also be compiled of data collected from different APIs
        - OpenWeatherMap Road Risk API [https://openweathermap.org/api/road-risk](https://openweathermap.org/api/road-risk)
        - Google Distance Matrix API (traffic data) [https://developers.google.com/maps/documentation/distance-matrix/distance-matrix#distance-matrix-advanced](https://developers.google.com/maps/documentation/distance-matrix/distance-matrix#distance-matrix-advanced)
- Weather Data
    - This will consist of data collected using the OpenWeatherMap API
    - Weather data will be taken into account when plotting a route as it will determine whether areas such as prone to flooding are a risk or not dependant on recent weather conditions in and around that area, therefore altering the risk score of that Hazard area based on the weather conditions.
    - An example could be Southsea seafront, on the usual day it’s absolutely fine to cycle, if there has been a storm or heavy rain, it could be far more prone to flooding e.g. a few weeks after Storm Eunice.
- User Filters
    - These will be tick box boolean values which could be used to avoid certain types of road/high traffic areas.
        - Avoid Dual Carriage Ways
        - Avoid Busy Areas
        - And so on
- My plan would be for the application also to suggest times of day to cycle based on all of these factors to best avoid rush hour, wet/windy weather, too extreme heat, etc.

### Technologies

Route planning web application using:

- React.js
    - Used to create the front-end of the application
    - Used to create the user interface
- Gin
    - Used to create the back-end of the application
    - Used to create the API
    - Used to host the application
- OpenStreetMap [https://www.openstreetmap.org/#map=6/54.910/-3.432](https://www.openstreetmap.org/#map=6/54.910/-3.432)
- OSRM (Open Source Routing Machine) [http://project-osrm.org/](http://project-osrm.org/)
    - Used to plot the route using the data collected to determine which route is plotted
    - Used to export the route to a range of file formats
- OpenWeatherMap [https://openweathermap.org/](https://openweathermap.org/)
    - Used to gather weather data
    - Used to gather road risk data
- Google Distance Matrix API [https://developers.google.com/maps/documentation/distance-matrix/distance-matrix#distance-matrix-advanced](https://developers.google.com/maps/documentation/distance-matrix/distance-matrix#distance-matrix-advanced)
    - Used to gather traffic data
- PSQL
    - Used to store custom Hazard Index
    - Used to store user saved routes
    - Used to store oAuth tokens to identify which saved routes belong to which user
- Auth0
    - Used to allow users to have accounts which they can save routes to
    - Token for each user stored in the database
    - Potentially use Strava token to communicate with the Strava API to upload GPX data directly to the user’s Strava account

### Export Route

I also plan on using OSRM to allow for the route to be exported so that the user is able to upload the route to their phone or GPS handheld device to use on the bike ride

Some file formats include:

1. GPX
2. KML
3. GeoJSON

This will allow for the route to be uploaded to a range of applications such as:

- Google Maps
- Google Earth
- Strava - If possible the  I will implement a direct export to Strava account using details from Login with Strava from Auth0 and using the Strava API [https://developers.strava.com/](https://developers.strava.com/)
- Potentially Google Fit

As well as uploading to standalone, handheld devices such as those from manufacturers:

- Garmin
- Magellan
- And other GPS devices

Enable the user to export a PDF if the route instructions.
