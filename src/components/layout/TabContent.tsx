// src/components/layout/TabContent.tsx

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Bracingline } from "../bracing/Bracingline"; // Import the new component
import { Button } from "../ui/button";

interface TabContentProps {
  // We pass the tab's title to use as a default value
  level: string;
}

interface BracinglineState {
  id: number;
  totals: { wind: number; eq: number; };
}

let nextBracinglineId = 3; // Start after the initial two

export function TabContent({ level }: TabContentProps) {
  // State for the top-left input block
  const [levelAndLocation, setLevelAndLocation] = useState(level);
  const [direction, setDirection] = useState("NS-Cross");
  const [floorType, setFloorType] = useState("Timber");
  // State for the top-right demand/achieved block
  // Users can input demand values. Achieved values will be calculated later.
  const [demandWind, setDemandWind] = useState(0);
  const [demandEQ, setDemandEQ] = useState(0);

  // --- STATE: Manage a list of bracing lines ---
  const [bracinglines, setBracinglines] = useState<BracinglineState[]>([
     { id: 1, totals: { wind: 0, eq: 0 } },
     { id: 2, totals: { wind: 0, eq: 0 } },
  ]);

// --- FUNCTIONS: Manage adding/deleting bracing line blocks ---
  const addBracingline = () => {
     const newId = nextBracinglineId++;
     setBracinglines([...bracinglines, { id: newId, totals: { wind: 0, eq: 0 } }]);
  };

  const deleteBracingline = (id: number) => {
     setBracinglines(bracinglines.filter(bl => bl.id !== id));
  };

    // This callback function is passed down to each Bracingline component.
  // It allows the child to report its calculated totals back up to this parent.
  const handleBracinglineUpdate = useCallback((id: number, totals: { wind: number; eq: number }) => {
    setBracinglines(currentLines =>
      currentLines.map(line =>
         line.id === id ? { ...line, totals } : line
      )
    );
  }, []);

  // --- Calculation Logic (Now uses state from bracing lines) ---
  const achievedWind = bracinglines.reduce((sum, line) => sum + line.totals.wind, 0);
  const achievedEQ = bracinglines.reduce((sum, line) => sum + line.totals.eq, 0);

  const calculateRate = (achieved: number, demand: number) => {
    if (demand === 0) return 0;
    return (achieved / demand) * 100;
  };

  const windRate = calculateRate(achievedWind, demandWind);
  const eqRate = calculateRate(achievedEQ, demandEQ);

  const getRateColor = (rate: number) => {
    if (rate < 100) return "text-red-500";
    if (rate >= 100) return "text-green-500";
    return "text-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Top section with two blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Block 1: Input Fields (Top-Left) */}
            <div className="p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="level-loc" className="text-right">Level and Location</Label>
                <Input id="level-loc" value={levelAndLocation} onChange={e => setLevelAndLocation(e.target.value)} className="col-span-2" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="direction" className="text-right">Direction</Label>
                <Input id="direction" value={direction} onChange={e => setDirection(e.target.value)} className="col-span-2" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="floor-type" className="text-right">Floor Type</Label>
                <Select value={floorType} onValueChange={setFloorType}>
                <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Select a floor type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Timber">Timber</SelectItem>
                    <SelectItem value="Concrete">Concrete</SelectItem>
                </SelectContent>
                </Select>
            </div>
            </div>

            {/* Block 2: Results Summary (Top-Right) */}
            <div className="p-4 border rounded-lg">
            <div className="grid grid-cols-4 gap-2 text-center font-medium">
                    <div className="text-left">Bracing</div>
                    <div>Total Demand</div>
                    <div>Total Achieved</div>
                    <div>Rate</div>
                    
                    {/* Wind Row */}
                    <div className="text-left font-semibold my-auto">Wind</div>
                    <Input 
                        type="number" 
                        value={demandWind} 
                        onChange={e => setDemandWind(Number(e.target.value))}
                        className="text-center" 
                    />
                    <div className="flex items-center justify-center bg-muted rounded-md">{achievedWind.toFixed(2)}</div>
                    <div className={cn("flex items-center justify-center font-bold", getRateColor(windRate))}>
                        {windRate.toFixed(1)}%
                    </div>

                    {/* EQ Row */}
                    <div className="text-left font-semibold my-auto">EQ</div>
                    <Input 
                        type="number" 
                        value={demandEQ} 
                        onChange={e => setDemandEQ(Number(e.target.value))}
                        className="text-center" 
                    />
                    <div className="flex items-center justify-center bg-muted rounded-md">{achievedEQ.toFixed(2)}</div>
                    <div className={cn("flex items-center justify-center font-bold", getRateColor(eqRate))}>
                        {eqRate.toFixed(1)}%
                    </div>
            </div>
            </div>

      </div>

      {/* --- NEW: Bracingline Section --- */}
      <div className="space-y-6">
        {bracinglines.map(line => (
          <Bracingline 
            key={line.id} 
            id={line.id}
            onDelete={deleteBracingline}
            onUpdate={handleBracinglineUpdate}
          />
        ))}
      </div>

      <Button onClick={addBracingline}>Add Bracing Line</Button>
    </div>
  );
}