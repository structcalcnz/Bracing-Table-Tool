// src/types.ts
export interface Tab {
  id: string;
  title: string;
}

// For the form in the manager dialog
export interface BracingValue {
  key: string;
  wind: number;
  eq: number;
}

// For the data structure itself
export interface CustomBracing {
  name: string;
  wind: Record<string, number>;
  eq: Record<string, number>;
}

export interface BracingData {
  systems: {
    name: string;
    types: (CustomBracing | { 
      name: string; 
      wind: Record<string, number | null>; 
      eq: Record<string, number | null> 
    })[];
  }[];
}