<h1 align="center">Birdwatching Globe</h1>

Here is our current Globe.GL example – it is receiving information from a socket.io feed every 20 seconds
that displays the latitude and longitude of recent bird sightings:
[https://twolefthands.com/clo-globe-V2-no-clouds/](https://twolefthands.com/clo-globe-V2-no-clouds/)
Currently when a new set of points arrive, the previous set disappears.

<h5 align="left">Requested Updates:</h5>

We want to update the globe so that all past sightings in a 24-hour period are also displayed. The newest
sightings would continue to be yellow, and any older sightings would change color to a lighter white at
50% opacity, and slightly smaller than the new points. We have no need to store the old data beyond 24
hours.
The final applica9on will on display in a lobby on a single PC using a chrome kiosk.
We would need the final application no later than December 22, 2023.

<h5 align="left">Here is a link to the current files for reference:</h5>
https://twolefthands.com/clo-globe-V2-no-clouds.zip

<h5 align="left">Steps to run this project:</h5>
1. Install Node.js
2. Open the command prompt (CMD), and execute the following commands:
- cd Backend
- npm install
- npm start
3. Open the browser and navigate to "http://<ip_address_or_domain>:4000"