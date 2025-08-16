// src/App.tsx
import './App.css'
import { useEffect } from 'react';
import { useBracingStore } from './bracingStore';
import { useAppStore } from './store';

import { Sidebar } from "./components/layout/Sidebar";
import { TabSystem } from "./components/layout/TabSystem";
import { assembleFullReport, generateHTMLReport } from './reportGenerator';

const handleExportReport = () => {
  // Get all relevant data from the store
  const projectInfo = useAppStore.getState().projectInfo;
  const tabs = useAppStore.getState().tabs;
  const tabsData = useAppStore.getState().tabsData;
  const bracingData = useBracingStore.getState().bracingData;

  if (!bracingData) {
    alert("Bracing data is not loaded yet.");
    return;
  }
  const reportData = assembleFullReport( projectInfo, tabs, tabsData, bracingData ); 
  const html = generateHTMLReport(reportData); 

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};

function App() {
  
  const setBracingData = useBracingStore((s) => s.setBracingData);
  useEffect(() => {
    fetch('/bracing-data.json')
      .then((res) => res.json())
      .then(setBracingData);
  }, [setBracingData]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar onExportReport={handleExportReport} />
      <main className="flex-1 p-4 pl-20 pt-8 overflow-auto">
        <TabSystem />
      </main>
    </div>
  );
}
export default App;