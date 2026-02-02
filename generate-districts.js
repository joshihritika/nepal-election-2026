const nepalGeojson = require('nepal-geojson');
const fs = require('fs');

// Get all districts with boundaries
const districts = nepalGeojson.districts();

// Nepal bounds (from previous calculation)
const minLng = 80.050926, maxLng = 88.204673;
const minLat = 26.348379, maxLat = 30.47146;

// SVG dimensions (same as province paths)
const width = 800, height = 400;
const padding = 20;

// Convert geo coords to SVG coords
function toSVG(lng, lat) {
  const x = padding + ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding);
  const y = padding + ((maxLat - lat) / (maxLat - minLat)) * (height - 2 * padding);
  return [x.toFixed(2), y.toFixed(2)];
}

// Convert ring to SVG path
function ringToPath(ring) {
  if (!ring || ring.length === 0) return '';
  const points = ring.map(c => toSVG(c[0], c[1]));
  return 'M' + points.map(p => p.join(',')).join('L') + 'Z';
}

// Calculate centroid for label placement
function calculateCentroid(ring) {
  if (!ring || ring.length === 0) return { x: 0, y: 0 };
  let sumX = 0, sumY = 0;
  ring.forEach(coord => {
    const [x, y] = toSVG(coord[0], coord[1]);
    sumX += parseFloat(x);
    sumY += parseFloat(y);
  });
  return {
    x: (sumX / ring.length).toFixed(2),
    y: (sumY / ring.length).toFixed(2)
  };
}

const output = [];
output.push('// Auto-generated district SVG paths from nepal-geojson');
output.push('export interface DistrictPath {');
output.push('  id: string;');
output.push('  name: string;');
output.push('  province: number;');
output.push('  hq: string;');
output.push('  d: string;');
output.push('  centroid: { x: number; y: number };');
output.push('}');
output.push('');
output.push('export const DISTRICT_PATHS: DistrictPath[] = [');

districts.features.forEach((feature) => {
  const props = feature.properties;
  const coords = feature.geometry.coordinates;
  let pathD = '';
  let centroid = { x: 0, y: 0 };

  if (feature.geometry.type === 'Polygon') {
    pathD = ringToPath(coords[0]);
    centroid = calculateCentroid(coords[0]);
  } else if (feature.geometry.type === 'MultiPolygon') {
    pathD = coords.map(polygon => ringToPath(polygon[0])).join(' ');
    // Use first polygon for centroid
    centroid = calculateCentroid(coords[0][0]);
  }

  const districtId = props.DISTRICT.toLowerCase().replace(/\s+/g, '-');

  output.push('  {');
  output.push(`    id: "${districtId}",`);
  output.push(`    name: "${props.DISTRICT}",`);
  output.push(`    province: ${props.PROVINCE},`);
  output.push(`    hq: "${props.HQ || ''}",`);
  output.push(`    centroid: { x: ${centroid.x}, y: ${centroid.y} },`);
  output.push(`    d: \`${pathD}\``);
  output.push('  },');
});

output.push('];');

fs.writeFileSync('src/data/district-paths.ts', output.join('\n'));
console.log('Written to src/data/district-paths.ts');
console.log(`Total districts: ${districts.features.length}`);
