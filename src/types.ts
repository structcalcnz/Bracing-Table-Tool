// src/types.ts

export interface ProjectInfo {
  projectName: string;
  projectNo: string;
  client: string;
  designer: string;
  date?: Date; // Use Date object for better handling
  note: string;
}

export interface Tab {
  id: string;
  title: string;
}

export interface TabData {
  id: string; // This links to the Tab {id, title}
  levelAndLocation: string;
  direction: string;
  floorType: 'Timber' | 'Concrete';
  demandWind: number;
  demandEQ: number;
  bracinglines: BracinglineData[];
}

export interface BracingRow {
  id: number;
  label: string;
  system: string;
  type: string;
  lengthOrCount: number;
  height: number;
}

export interface DisplayBracingRow extends BracingRow {
  windRating: number | null;
  eqRating: number | null;
  totalWind: number;
  totalEQ: number;
  isRowInvalid: boolean,
}

export interface BracinglineData {
  id: number;
  bracinglineNo: string;
  externalWallLength: number;
  rows: BracingRow[];
  displayRows: DisplayBracingRow[];
}

export interface BracingType {
  name: string;
  wind: Record<string, number | null>;
  eq: Record<string, number | null>;
}

export interface BracingData {
  systems: { name: string; types: BracingType[]; }[];
}
