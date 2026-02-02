// Nepal Districts GeoJSON - Simplified coordinates for 77 districts
// Organized by 7 provinces for the election map

import { FeatureCollection, Feature, Polygon } from "geojson";

export interface DistrictFeatureProperties {
  id: string;
  name: string;
  provinceId: string;
  provinceName: string;
}

// Simplified district boundaries (approximate centroids and bounding boxes)
// In production, use official GeoJSON from Survey Department of Nepal
export const districtCentroids: Record<string, [number, number]> = {
  // Province 1 - Koshi
  taplejung: [87.67, 27.35],
  panchthar: [87.65, 27.12],
  ilam: [87.92, 26.91],
  jhapa: [87.89, 26.54],
  morang: [87.47, 26.67],
  sunsari: [87.15, 26.65],
  dhankuta: [87.35, 26.98],
  terhathum: [87.55, 27.13],
  sankhuwasabha: [87.23, 27.37],
  bhojpur: [87.05, 27.17],
  solukhumbu: [86.73, 27.68],
  okhaldhunga: [86.50, 27.30],
  khotang: [86.82, 27.02],
  udayapur: [86.52, 26.93],

  // Province 2 - Madhesh
  saptari: [86.72, 26.60],
  siraha: [86.20, 26.65],
  dhanusha: [85.93, 26.82],
  mahottari: [85.78, 26.92],
  sarlahi: [85.55, 27.05],
  rautahat: [85.28, 27.00],
  bara: [85.00, 27.10],
  parsa: [84.82, 27.15],

  // Province 3 - Bagmati
  dolakha: [86.07, 27.72],
  sindhupalchok: [85.70, 27.95],
  rasuwa: [85.38, 28.08],
  dhading: [84.93, 27.87],
  nuwakot: [85.17, 27.92],
  kathmandu: [85.32, 27.70],
  bhaktapur: [85.43, 27.67],
  lalitpur: [85.33, 27.60],
  kavrepalanchok: [85.55, 27.55],
  ramechhap: [86.08, 27.32],
  sindhuli: [85.97, 27.25],
  makwanpur: [85.02, 27.42],
  chitwan: [84.35, 27.53],

  // Province 4 - Gandaki
  gorkha: [84.63, 28.00],
  lamjung: [84.40, 28.27],
  tanahu: [84.25, 27.93],
  syangja: [83.88, 28.10],
  kaski: [83.98, 28.22],
  manang: [84.02, 28.67],
  mustang: [83.78, 28.98],
  myagdi: [83.48, 28.58],
  parbat: [83.68, 28.23],
  baglung: [83.60, 28.27],
  nawalpur: [84.12, 27.68],

  // Province 5 - Lumbini
  "rukum-east": [82.62, 28.62],
  rolpa: [82.67, 28.47],
  pyuthan: [82.85, 28.10],
  gulmi: [83.28, 28.07],
  arghakhanchi: [83.15, 27.93],
  palpa: [83.55, 27.87],
  rupandehi: [83.43, 27.50],
  kapilvastu: [83.07, 27.57],
  "nawalparasi-west": [83.75, 27.55],
  dang: [82.30, 28.03],
  banke: [81.67, 28.05],
  bardiya: [81.33, 28.35],

  // Province 6 - Karnali
  dolpa: [82.87, 29.03],
  mugu: [82.10, 29.50],
  humla: [81.90, 29.97],
  jumla: [82.18, 29.28],
  kalikot: [81.83, 29.17],
  dailekh: [81.72, 28.85],
  jajarkot: [82.20, 28.72],
  "rukum-west": [82.22, 28.60],
  salyan: [82.17, 28.38],
  surkhet: [81.62, 28.60],

  // Province 7 - Sudurpashchim
  bajura: [81.53, 29.38],
  bajhang: [81.18, 29.53],
  darchula: [80.55, 29.85],
  baitadi: [80.42, 29.52],
  dadeldhura: [80.58, 29.30],
  doti: [80.95, 29.25],
  achham: [81.25, 29.05],
  kailali: [80.55, 28.70],
  kanchanpur: [80.33, 28.95],
};

// Province colors for the map
export const provinceColors: Record<string, string> = {
  p1: "#3B82F6", // Koshi - Blue
  p2: "#10B981", // Madhesh - Green
  p3: "#8B5CF6", // Bagmati - Purple
  p4: "#F59E0B", // Gandaki - Amber
  p5: "#EF4444", // Lumbini - Red
  p6: "#06B6D4", // Karnali - Cyan
  p7: "#EC4899", // Sudurpashchim - Pink
};

// Generate simplified polygon for a district based on centroid
// In production, use actual boundary data
const generateDistrictPolygon = (centroid: [number, number], size: number = 0.3): number[][][] => {
  const [lng, lat] = centroid;
  const offset = size;
  return [[
    [lng - offset, lat - offset * 0.7],
    [lng + offset * 0.3, lat - offset],
    [lng + offset, lat - offset * 0.5],
    [lng + offset * 0.8, lat + offset * 0.3],
    [lng + offset * 0.2, lat + offset],
    [lng - offset * 0.5, lat + offset * 0.8],
    [lng - offset, lat + offset * 0.2],
    [lng - offset, lat - offset * 0.7],
  ]];
};

// District to province mapping
export const districtProvinceMap: Record<string, { provinceId: string; provinceName: string }> = {
  // Province 1
  taplejung: { provinceId: "p1", provinceName: "Koshi" },
  panchthar: { provinceId: "p1", provinceName: "Koshi" },
  ilam: { provinceId: "p1", provinceName: "Koshi" },
  jhapa: { provinceId: "p1", provinceName: "Koshi" },
  morang: { provinceId: "p1", provinceName: "Koshi" },
  sunsari: { provinceId: "p1", provinceName: "Koshi" },
  dhankuta: { provinceId: "p1", provinceName: "Koshi" },
  terhathum: { provinceId: "p1", provinceName: "Koshi" },
  sankhuwasabha: { provinceId: "p1", provinceName: "Koshi" },
  bhojpur: { provinceId: "p1", provinceName: "Koshi" },
  solukhumbu: { provinceId: "p1", provinceName: "Koshi" },
  okhaldhunga: { provinceId: "p1", provinceName: "Koshi" },
  khotang: { provinceId: "p1", provinceName: "Koshi" },
  udayapur: { provinceId: "p1", provinceName: "Koshi" },
  // Province 2
  saptari: { provinceId: "p2", provinceName: "Madhesh" },
  siraha: { provinceId: "p2", provinceName: "Madhesh" },
  dhanusha: { provinceId: "p2", provinceName: "Madhesh" },
  mahottari: { provinceId: "p2", provinceName: "Madhesh" },
  sarlahi: { provinceId: "p2", provinceName: "Madhesh" },
  rautahat: { provinceId: "p2", provinceName: "Madhesh" },
  bara: { provinceId: "p2", provinceName: "Madhesh" },
  parsa: { provinceId: "p2", provinceName: "Madhesh" },
  // Province 3
  dolakha: { provinceId: "p3", provinceName: "Bagmati" },
  sindhupalchok: { provinceId: "p3", provinceName: "Bagmati" },
  rasuwa: { provinceId: "p3", provinceName: "Bagmati" },
  dhading: { provinceId: "p3", provinceName: "Bagmati" },
  nuwakot: { provinceId: "p3", provinceName: "Bagmati" },
  kathmandu: { provinceId: "p3", provinceName: "Bagmati" },
  bhaktapur: { provinceId: "p3", provinceName: "Bagmati" },
  lalitpur: { provinceId: "p3", provinceName: "Bagmati" },
  kavrepalanchok: { provinceId: "p3", provinceName: "Bagmati" },
  ramechhap: { provinceId: "p3", provinceName: "Bagmati" },
  sindhuli: { provinceId: "p3", provinceName: "Bagmati" },
  makwanpur: { provinceId: "p3", provinceName: "Bagmati" },
  chitwan: { provinceId: "p3", provinceName: "Bagmati" },
  // Province 4
  gorkha: { provinceId: "p4", provinceName: "Gandaki" },
  lamjung: { provinceId: "p4", provinceName: "Gandaki" },
  tanahu: { provinceId: "p4", provinceName: "Gandaki" },
  syangja: { provinceId: "p4", provinceName: "Gandaki" },
  kaski: { provinceId: "p4", provinceName: "Gandaki" },
  manang: { provinceId: "p4", provinceName: "Gandaki" },
  mustang: { provinceId: "p4", provinceName: "Gandaki" },
  myagdi: { provinceId: "p4", provinceName: "Gandaki" },
  parbat: { provinceId: "p4", provinceName: "Gandaki" },
  baglung: { provinceId: "p4", provinceName: "Gandaki" },
  nawalpur: { provinceId: "p4", provinceName: "Gandaki" },
  // Province 5
  "rukum-east": { provinceId: "p5", provinceName: "Lumbini" },
  rolpa: { provinceId: "p5", provinceName: "Lumbini" },
  pyuthan: { provinceId: "p5", provinceName: "Lumbini" },
  gulmi: { provinceId: "p5", provinceName: "Lumbini" },
  arghakhanchi: { provinceId: "p5", provinceName: "Lumbini" },
  palpa: { provinceId: "p5", provinceName: "Lumbini" },
  rupandehi: { provinceId: "p5", provinceName: "Lumbini" },
  kapilvastu: { provinceId: "p5", provinceName: "Lumbini" },
  "nawalparasi-west": { provinceId: "p5", provinceName: "Lumbini" },
  dang: { provinceId: "p5", provinceName: "Lumbini" },
  banke: { provinceId: "p5", provinceName: "Lumbini" },
  bardiya: { provinceId: "p5", provinceName: "Lumbini" },
  // Province 6
  dolpa: { provinceId: "p6", provinceName: "Karnali" },
  mugu: { provinceId: "p6", provinceName: "Karnali" },
  humla: { provinceId: "p6", provinceName: "Karnali" },
  jumla: { provinceId: "p6", provinceName: "Karnali" },
  kalikot: { provinceId: "p6", provinceName: "Karnali" },
  dailekh: { provinceId: "p6", provinceName: "Karnali" },
  jajarkot: { provinceId: "p6", provinceName: "Karnali" },
  "rukum-west": { provinceId: "p6", provinceName: "Karnali" },
  salyan: { provinceId: "p6", provinceName: "Karnali" },
  surkhet: { provinceId: "p6", provinceName: "Karnali" },
  // Province 7
  bajura: { provinceId: "p7", provinceName: "Sudurpashchim" },
  bajhang: { provinceId: "p7", provinceName: "Sudurpashchim" },
  darchula: { provinceId: "p7", provinceName: "Sudurpashchim" },
  baitadi: { provinceId: "p7", provinceName: "Sudurpashchim" },
  dadeldhura: { provinceId: "p7", provinceName: "Sudurpashchim" },
  doti: { provinceId: "p7", provinceName: "Sudurpashchim" },
  achham: { provinceId: "p7", provinceName: "Sudurpashchim" },
  kailali: { provinceId: "p7", provinceName: "Sudurpashchim" },
  kanchanpur: { provinceId: "p7", provinceName: "Sudurpashchim" },
};

// Generate GeoJSON FeatureCollection for all districts
export const generateNepalGeoJSON = (): FeatureCollection<Polygon, DistrictFeatureProperties> => {
  const features: Feature<Polygon, DistrictFeatureProperties>[] = [];

  Object.entries(districtCentroids).forEach(([id, centroid]) => {
    const provinceInfo = districtProvinceMap[id];
    if (provinceInfo) {
      features.push({
        type: "Feature",
        properties: {
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " "),
          provinceId: provinceInfo.provinceId,
          provinceName: provinceInfo.provinceName,
        },
        geometry: {
          type: "Polygon",
          coordinates: generateDistrictPolygon(centroid, 0.35),
        },
      });
    }
  });

  return {
    type: "FeatureCollection",
    features,
  };
};

// Nepal bounds for map projection
export const nepalBounds = {
  minLng: 80.0,
  maxLng: 88.2,
  minLat: 26.3,
  maxLat: 30.5,
  center: [84.1, 28.4] as [number, number],
};
