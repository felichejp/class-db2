const wkx = require('wkx');
const buffer = require('buffer').Buffer;

const wkt = '0101000000000000000000F03F0000000000000040';
const wkbBuffer = new Buffer(wkt, 'hex');

const geometry = wkx.Geometry.parse(wkbBuffer); // Declaración única
console.log(geometry.toGeoJSON().coordinates); // Declaración única