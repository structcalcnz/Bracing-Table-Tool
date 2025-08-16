// src/components/layout/TabContent.tsx

import { useState, useMemo, useCallback } from "react";
import { useAppStore } from '@/store';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Bracingline } from "../bracing/Bracingline"; // Import the new component
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TabContentProps {
  tabId: string;
}

type LineTotals = {
  lineTotalWind: number;
  lineTotalEQ: number;
};

export function TabContent({ tabId }: TabContentProps) {
  // State for bracingline totals
  const [lineTotalsMap, setLineTotalsMap] = useState<Record<number, LineTotals>>({});
  // Callback passed to each line
  const handleLineTotalsChange = useCallback((lineId: number, totals: LineTotals) => {
    setLineTotalsMap((prev) => ({
      ...prev,
      [lineId]: totals,
    }));
  },[]);

  // Compute totals from all line subtotals
  const { achievedWind, achievedEQ } = useMemo(() => {
    return Object.values(lineTotalsMap).reduce(
      (acc, line) => ({
        achievedWind: acc.achievedWind + line.lineTotalWind,
        achievedEQ: acc.achievedEQ + line.lineTotalEQ,
      }),
      { achievedWind: 0, achievedEQ: 0 }
    );
  }, [lineTotalsMap]);

  // State for store in zustand
  const tabData = useAppStore(state => state.tabsData[tabId]);
  const updateTabField = useAppStore(state => state.updateTabField);
  const addBracingline = useAppStore(state => state.addBracingline);
  const deleteBracingline = useAppStore(state => state.deleteBracingline);

  if (!tabData) return <div>Loading tab...</div>;

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lineToDeleteId, setLineToDeleteId] = useState<number | null>(null);

// --- FUNCTIONS: Manage adding/deleting bracing line blocks ---
  const handleAddBracingline = (index: number) => {
      addBracingline(tabId, index)
  }

  const handleDeleteRequest = (lineId: number) => {
    // Only allow deletion if there are more than 2 blocks
    if (tabData.bracinglines.length > 2) {
      setLineToDeleteId(lineId);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDeleteBracingline = () => {
    if (!lineToDeleteId) return;
    deleteBracingline(tabId, lineToDeleteId)
    setDeleteDialogOpen(false);
    setLineToDeleteId(null);
  };

  // Memoized calculation for minimum demand, update via store
  //const bracinglinesWithMinDemand = useMemo(() => {
  //  if (!tabData) return;
  //  const bracinglineCount = tabData.bracinglines.length > 0 ? tabData.bracinglines.length : 1;
  //  tabData.bracinglines.forEach(line => {
  //    const lineDemandWind = Math.max(
  //      100,
  //      15 * line.externalWallLength,
  //      (tabData.demandWind / bracinglineCount) * 0.5
  //    );
  //    const lineDemandEQ = Math.max(
  //      100,
  //      15 * line.externalWallLength,
  //      (tabData.demandEQ / bracinglineCount) * 0.5
  //    );
  //    return {
  //      ...line, 
  //      lineDemandWind, 
  //      lineDemandEQ,  
  //    };
  //  });
  //}, [tabData]);

  // --- Calculation Logic ---
  //const achievedWind = 100//tabData.bracinglines.reduce((sum, line) => sum + line.totals.wind, 0);
  //const achievedEQ = 100//tabData.bracinglines.reduce((sum, line) => sum + line.totals.eq, 0);
  const windRate = tabData.demandWind === 0 ? 0 : (achievedWind / tabData.demandWind) * 100;
  const eqRate = tabData.demandEQ === 0 ? 0 : (achievedEQ / tabData.demandEQ) * 100;

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
                <Input id="level-loc" value={tabData.levelAndLocation} onChange={e => updateTabField(tabId, 'levelAndLocation', e.target.value)} className="col-span-2" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="direction" className="text-right">Direction</Label>
                <Input id="direction" value={tabData.direction} onChange={e => updateTabField(tabId, "direction", e.target.value)} className="col-span-2" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="floor-type" className="text-right">Floor Type</Label>
                <Select value={tabData.floorType} onValueChange={value => updateTabField(tabId, "floorType", value)}>
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
                    value={tabData.demandWind} 
                    onChange={e => updateTabField(tabId, "demandWind", Number(e.target.value))}
                    className="text-center h-8" 
                />
                 <Input 
                    type="number" 
                    value={tabData.demandEQ} 
                    onChange={e => updateTabField(tabId, "demandEQ",Number(e.target.value))}
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
        {tabData.bracinglines.map((line, index) => (
          <Bracingline 
            key={line.id}
            tabId={tabId} 
            lineId={line.id}
            index={index}
            onAdd={handleAddBracingline}
            onDeleteRequest={handleDeleteRequest}
            onTotalsChange={handleLineTotalsChange}
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