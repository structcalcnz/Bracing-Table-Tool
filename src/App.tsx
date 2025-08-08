import { useState, useEffect } from "react";
import './App.css'

import { Sidebar } from "./components/layout/Sidebar";
import { TabSystem } from "./components/layout/TabSystem";
import { CustomBracingManager } from "./components/bracing/CustomBracingManager";
import type { BracingData, CustomBracing } from "./types";


function App() {
  const [baseBracingData, setBaseBracingData] = useState<BracingData | null>(null);
  const [mergedBracingData, setMergedBracingData] = useState<BracingData | null>(null);
  const [customBracings, setCustomBracings] = useState<CustomBracing[]>([]);
  const [isBracingManagerOpen, setBracingManagerOpen] = useState(false);

  // 1. Load the base JSON file on initial mount
  useEffect(() => {
    fetch('/bracing-data.json')
      .then(res => res.json())
      .then(data => setBaseBracingData(data));
    
    // Also load any saved custom bracings from localStorage
    const saved = localStorage.getItem('customBracings');
    if (saved) {
      setCustomBracings(JSON.parse(saved));
    }
  }, []);

  // 2. Merge base data and custom data whenever either one changes
  useEffect(() => {
    if (!baseBracingData) return;

    // Create a deep copy to avoid modifying the original base data
    const newMergedData = JSON.parse(JSON.stringify(baseBracingData));

    // Find the "Custom" system to add our types to
    let customSystem = newMergedData.systems.find((s: { name: string; }) => s.name === 'Custom');
    if (customSystem) {
      // Add the user's custom bracings to the end of the existing list
      customSystem.types.push(...customBracings);
    }
    
    setMergedBracingData(newMergedData);
  }, [baseBracingData, customBracings]);


  // 3. Save custom bracings to localStorage whenever they are updated
  const handleSaveCustomBracing = (bracingToSave: CustomBracing) => {
    setCustomBracings(prev => {
      const existing = prev.find(b => b.name === bracingToSave.name);
      let newCustomBracings;
      if (existing) {
        // It's an update
        newCustomBracings = prev.map(b => (b.name === bracingToSave.name ? bracingToSave : b));
      } else {
        // It's a new addition
        newCustomBracings = [...prev, bracingToSave];
      }
      localStorage.setItem('customBracings', JSON.stringify(newCustomBracings));
      return newCustomBracings;
    });
  };
  
  const handleDeleteCustomBracing = (bracingName: string) => {
    setCustomBracings(prev => {
      const newCustomBracings = prev.filter(b => b.name !== bracingName);
      localStorage.setItem('customBracings', JSON.stringify(newCustomBracings));
      return newCustomBracings;
    });
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar onOpenCustomBracing={() => setBracingManagerOpen(true)} />
      
      <main className="flex-1 p-4 pl-20 pt-8 overflow-auto">
        {/* Pass the FINAL merged data down to the tab system */}
        {mergedBracingData && <TabSystem bracingData={mergedBracingData} />}
      </main>

      {/* The management dialog component */}
      <CustomBracingManager
        isOpen={isBracingManagerOpen}
        onOpenChange={setBracingManagerOpen}
        existingBracings={customBracings}
        onSave={handleSaveCustomBracing}
        onDelete={handleDeleteCustomBracing}
      />
    </div>
  );
}

export default App;