// src/store.ts
import { create } from 'zustand';
import type { ProjectInfo, Tab, TabData, BracinglineData, BracingRow, DisplayBracingRow, } from './types'; // Assuming types.ts is in the same folder

let nextBracingLineId = 3;
let nextRowId = 100;

// Helper to create a default bracing row
const createDefaultRow = (bracinglineNo: string, rowCount: number): BracingRow => ({
    id: nextRowId++,
    label: `${bracinglineNo}-${rowCount + 1}`,
    system: "GIB",
    type: "GS1-N",
    lengthOrCount: 1.2,
    height: 2.4,
});

// Helper to create a default bracing line
const createDefaultBracingline = (id: number): BracinglineData => {
  const defaultRows = [createDefaultRow(`BL-${id}`, 0)];
  return {
    id,
    bracinglineNo: `BL-${id}`,
    externalWallLength: 0,
    rows: defaultRows,
    displayRows:[],
}};

// Helper to create a default tab data object
const createDefaultTabData = (tab: Tab): TabData => ({
  id: tab.id,
  levelAndLocation: tab.title,
  direction: "NS-Cross",
  floorType: "Timber",
  demandWind: 500,
  demandEQ: 500,
  bracinglines: [createDefaultBracingline(1), createDefaultBracingline(2)],
});

// Define the shape of your store's state and its actions
interface AppState {
  projectInfo: ProjectInfo;
  tabs: Tab[];
  tabsData: Record<string, TabData>;

  // Actions
  setProjectInfo: (info: ProjectInfo) => void;
  updateProjectInfoField: (field: keyof ProjectInfo, value: any) => void;

  addTab: (tab: Tab) => void;
  renameTab: (tabId: string, newTitle: string) => void;
  deleteTab: (tabId: string) => void;
  updateTabField: (tabId: string, field: keyof Omit<TabData, 'id' | 'bracinglines'>, value: any) => void;

  addBracingline: (tabId: string, index: number) => void;
  deleteBracingline: (tabId: string, lineId: number) => void;
  updateBracinglineField: (tabId: string, lineId: number, field: keyof Omit<BracinglineData, 'id' | 'rows'>, value: any) => void;

  addBracinglineRow: (tabId: string, lineId: number, rowIndex: number) => void;
  deleteBracinglineRow: (tabId: string, lineId: number, rowId: number) => void;
  updateBracinglineRow: (tabId: string, lineId: number, rowId: number, newRowData: Partial<BracingRow>) => void;

}

export const useAppStore = create<AppState>((set, get) => ({

  // The initial state
  projectInfo: {
    projectName: 'New Project',
    projectNo: '',
    client: '',
    designer: '',
    date: new Date(),
    note: ''
  },

 tabs: [
    { id: "tab1", title: "Level 1 Cross" },
    { id: "tab2", title: "Level 1 Along" },
  ],

  tabsData: {
    "tab1": createDefaultTabData({ id: "tab1", title: "Level 1 Cross" }),
    "tab2": createDefaultTabData({ id: "tab2", title: "Level 1 Along" }),
  },

  // --- ACTIONS ---
  setProjectInfo: (info) => set({ projectInfo: info }),
  updateProjectInfoField: (field, value) => set(state => ({ projectInfo: { ...state.projectInfo, [field]: value }})),
  
  addTab: (tab) => set(state => ({
    tabs: [...state.tabs, tab],
    tabsData: { ...state.tabsData, [tab.id]: createDefaultTabData(tab) }
  })),

  renameTab: (tabId, newTitle) => set(state => ({
    tabs: state.tabs.map(t => t.id === tabId ? { ...t, title: newTitle } : t),
    tabsData: { ...state.tabsData, [tabId]: { ...state.tabsData[tabId], levelAndLocation: newTitle }}
  })),

  deleteTab: (tabId) => {
    const newTabsData = { ...get().tabsData };
    delete newTabsData[tabId];
    set(state => ({
        tabs: state.tabs.filter(t => t.id !== tabId),
        tabsData: newTabsData,
    }));
  },

  updateTabField: (tabId, field, value) => set(state => ({
    tabsData: { ...state.tabsData, [tabId]: { ...state.tabsData[tabId], [field]: value }}
  })),

 addBracingline: (tabId, index) => set(state => {
      const newBracinglines = [...state.tabsData[tabId].bracinglines];
      newBracinglines.splice(index + 1, 0, createDefaultBracingline(nextBracingLineId++));
      return { tabsData: { ...state.tabsData, [tabId]: { ...state.tabsData[tabId], bracinglines: newBracinglines }}};
  }),
  
  deleteBracingline: (tabId, lineId) => set(state => ({
    tabsData: { ...state.tabsData, [tabId]: { 
        ...state.tabsData[tabId], 
        bracinglines: state.tabsData[tabId].bracinglines.filter(bl => bl.id !== lineId)
    }}
  })),

  updateBracinglineField: (tabId, lineId, field, value) => set(state => {
      const newBracinglines = state.tabsData[tabId].bracinglines.map(bl => 
        bl.id === lineId ? { ...bl, [field]: value } : bl
      );
      return { tabsData: { ...state.tabsData, [tabId]: { ...state.tabsData[tabId], bracinglines: newBracinglines }}};
  }),

  addBracinglineRow: (tabId, lineId, rowIndex) => set(state => {
      const targetLine = state.tabsData[tabId].bracinglines.find(bl => bl.id === lineId)!;
      const newRow = createDefaultRow(targetLine.bracinglineNo, targetLine.rows.length);
      const newRows = [...targetLine.rows];
      newRows.splice(rowIndex + 1, 0, newRow);
      const newBracinglines = state.tabsData[tabId].bracinglines.map(bl => 
        bl.id === lineId ? { ...bl, rows: newRows } : bl
      );
      return { tabsData: { ...state.tabsData, [tabId]: { ...state.tabsData[tabId], bracinglines: newBracinglines }}};
  }),

  deleteBracinglineRow: (tabId, lineId, rowId) => set(state => {
    const targetLine = state.tabsData[tabId].bracinglines.find(bl => bl.id === lineId)!;
    if (targetLine.rows.length <= 1) return state; // Don't delete last row
    const newRows = targetLine.rows.filter(r => r.id !== rowId);
    const newBracinglines = state.tabsData[tabId].bracinglines.map(bl => 
      bl.id === lineId ? { ...bl, rows: newRows } : bl
    );
    return { tabsData: { ...state.tabsData, [tabId]: { ...state.tabsData[tabId], bracinglines: newBracinglines }}};
  }),

  updateBracinglineRow: (tabId, lineId, rowId, newRowData) => set(state => {
    const newBracinglines = state.tabsData[tabId].bracinglines.map(bl => 
      bl.id === lineId ? { ...bl, rows: bl.rows.map(row => 
          row.id === rowId ? { ...row, ...newRowData } : row
        )} : bl
    );
    return { tabsData: { ...state.tabsData, [tabId]: { ...state.tabsData[tabId], bracinglines: newBracinglines }}};
  }),
  
}));