// bracingStore.ts
import { create } from 'zustand';
import type { BracingData } from './types';

type BracingStore = {
  bracingData: BracingData | null;
  setBracingData: (data: BracingData) => void;
};

export const useBracingStore = create<BracingStore>((set) => ({
  bracingData: null,
  setBracingData: (data) => set({ bracingData: data }),
}));