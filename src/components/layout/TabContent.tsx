// src/components/layout/TabContent.tsx

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Bracingline } from "../bracing/Bracingline"; // Import the new component
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TabContentProps {
  // We pass the tab's title to use as a default value
  level: string;
  bracingData: BracingData;
}

interface BracinglineState {
  id: number;
  totals: { wind: number; eq: number; };
}

let nextBracinglineId = 3; // Start after the initial two

export function TabContent({ level, bracingData }: TabContentProps) {
  // State for the top-left input block
  const [levelAndLocation, setLevelAndLocation] = useState(level);
  const [direction, setDirection] = useState("NS-Cross");
  const [floorType, setFloorType] = useState("Timber");
  // State for the top-right demand/achieved block
  // Users can input demand values. Achieved values will be calculated later.
  const [demandWind, setDemandWind] = useState(500);
  const [demandEQ, setDemandEQ] = useState(500);

  // --- STATE: Manage a list of bracing lines ---
  const [bracinglines, setBracinglines] = useState<BracinglineState[]>([
     { id: 1, totals: { wind: 0, eq: 0 } },
     { id: 2, totals: { wind: 0, eq: 0 } },
  ]);

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lineToDeleteId, setLineToDeleteId] = useState<number | null>(null);

// --- FUNCTIONS: Manage adding/deleting bracing line blocks ---
  const addBracingline = (index: number) => {
    const newId = nextBracinglineId++;
    const newBlock = { id: newId, totals: { wind: 0, eq: 0 } };
    const newBracinglines = [...bracinglines];
    newBracinglines.splice(index + 1, 0, newBlock); // Insert after the current block
    setBracinglines(newBracinglines);
  };

  const handleDeleteRequest = (id: number) => {
    // Only allow deletion if there are more than 2 blocks
    if (bracinglines.length > 2) {
      setLineToDeleteId(id);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDeleteBracingline = () => {
    if (!lineToDeleteId) return;
    setBracinglines(bracinglines.filter(bl => bl.id !== lineToDeleteId));
    setDeleteDialogOpen(false);
    setLineToDeleteId(null);
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
  const windRate = demandWind === 0 ? 0 : (achievedWind / demandWind) * 100;
  const eqRate = demandEQ === 0 ? 0 : (achievedEQ / demandEQ) * 100;

  const getRateColor = (rate: number) => {
    if (rate < 100) return "bg-red-100 text-red-500";
    if (rate >= 100) return "bg-green-100 text-green-500";
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
           <div className="w-full grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                {/* Header Row */}
                <div></div>
                <div className="font-bold text-center">Wind</div>
                <div className="font-bold text-center">EQ</div>

                {/* Demand Row */}
                <div className="font-semibold text-right my-auto">Total Demand</div>
                <Input 
                    type="number" 
                    value={demandWind} 
                    onChange={e => setDemandWind(Number(e.target.value))}
                    className="text-center h-8" 
                />
                 <Input 
                    type="number" 
                    value={demandEQ} 
                    onChange={e => setDemandEQ(Number(e.target.value))}
                    className="text-center h-8" 
                />

                {/* Achieved Row */}
                <div className="font-semibold text-right my-auto">Total Achieved</div>
                <div className="flex items-center justify-center bg-muted rounded-md p-1 min-h-[32px]">{achievedWind.toFixed(0)}</div>
                <div className="flex items-center justify-center bg-muted rounded-md p-1 min-h-[32px]">{achievedEQ.toFixed(0)}</div>

                {/* Rate Row */}
                <div className="font-semibold text-right my-auto">Rate</div>
                <div className={cn("flex items-center justify-center font-bold rounded-md p-1 min-h-[32px]", getRateColor(windRate))}>
                    {windRate.toFixed(1)}%
                </div>
                <div className={cn("flex items-center justify-center font-bold rounded-md p-1 min-h-[32px]", getRateColor(eqRate))}>
                    {eqRate.toFixed(1)}%
                </div>
           </div>
            </div>
       </div>

      {/* --- Bracingline Section --- */}
      <div className="space-y-6">
        {bracinglines.map((line, index) => (
          <Bracingline 
            key={line.id} 
            id={line.id}
            index={index} // Pass the index for the add function
            onDeleteRequest={handleDeleteRequest}
            onUpdate={handleBracinglineUpdate}
            onAdd={addBracingline} // Pass the add function down
            // --- Pass down tab-level data for Min. Demand calculation ---
            totalTabDemandWind={demandWind}
            totalTabDemandEQ={demandEQ}
            bracinglineCount={bracinglines.length}
            floorType={floorType}
            bracingData={bracingData}
          />
        ))}
      </div>
      {/* --- NEW: The AlertDialog for confirmation --- */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this bracing line and all of its data.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeleteBracingline}>Continue</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}