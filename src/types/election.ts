// Nepal Election 2026 - Type Definitions

export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  partyShort: string;
  partyColor: string;
  age: number;
  education: string;
  manifesto_summary: string[];
  social_media_links: SocialMediaLinks;
  photo?: string;
  isIncumbent?: boolean;
  previousPosition?: string;
}

export interface Constituency {
  id: string;
  number: number;
  name: string;
  districtId: string;
  registeredVoters?: number;
  candidates: Candidate[];
}

export interface District {
  id: string;
  name: string;
  nameNepali?: string;
  provinceId: string;
  totalConstituencies: number;
  constituencies: Constituency[];
  population?: number;
}

export interface Province {
  id: string;
  name: string;
  nameNepali?: string;
  capital: string;
  totalDistricts: number;
  districts: District[];
  color: string;
}

export interface ElectionData {
  electionDate: string;
  totalProvinces: number;
  totalDistricts: number;
  totalConstituencies: number;
  provinces: Province[];
}

// Political parties with their official colors
export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
  logo?: string;
}

// Map feature properties from GeoJSON
export interface DistrictProperties {
  DISTRICT: string;
  PROVINCE: string;
  districtId: string;
  provinceId: string;
}

// Navigation breadcrumb
export interface BreadcrumbItem {
  label: string;
  href: string;
}

// Filter state
export interface FilterState {
  province?: string;
  district?: string;
  constituency?: string;
  party?: string;
  searchQuery?: string;
}
