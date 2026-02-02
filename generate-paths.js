const nepalGeojson = require('nepal-geojson');
const fs = require('fs');

const provinces = nepalGeojson.countryWithProvinces();

// Nepal bounds
const minLng = 80.050926, maxLng = 88.204673;
const minLat = 26.348379, maxLat = 30.47146;

// SVG dimensions
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

// Province names and colors
const provinceInfo = [
  { name: 'Koshi', color: '#DC2626' },
  { name: 'Madhesh', color: '#EC4899' },
  { name: 'Bagmati', color: '#2563EB' },
  { name: 'Gandaki', color: '#7C3AED' },
  { name: 'Lumbini', color: '#F97316' },
  { name: 'Karnali', color: '#16A34A' },
  { name: 'Sudurpashchim', color: '#0891B2' }
];

const output = [];
output.push('// Auto-generated province SVG paths from nepal-geojson');
output.push('export const PROVINCE_PATHS = [');

provinces.features.forEach((feature, idx) => {
  const coords = feature.geometry.coordinates;
  let pathD = '';

  if (feature.geometry.type === 'Polygon') {
    pathD = ringToPath(coords[0]);
  } else if (feature.geometry.type === 'MultiPolygon') {
    pathD = coords.map(polygon => ringToPath(polygon[0])).join(' ');
  }

  output.push('  {');
  output.push(`    id: ${idx + 1},`);
  output.push(`    name: "${provinceInfo[idx].name}",`);
  output.push(`    color: "${provinceInfo[idx].color}",`);
  output.push(`    d: \`${pathD}\``);
  output.push('  },');
});

output.push('];');

fs.writeFileSync('src/data/province-paths.ts', output.join('\n'));
console.log('Written to src/data/province-paths.ts');
