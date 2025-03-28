const wkx = require('wkx');
const buffer = require('buffer').Buffer;

const wktArray = []

for (const wkt of wktArray) {
    const wkbBuffer = new Buffer(wkt, 'hex');
    const geometry = wkx.Geometry.parse(wkbBuffer);
    console.log(geometry);
    
    console.log(geometry.toGeoJSON());
}