// src/components/bracing/Bracingline.tsx

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

// --- The New Helper Function ---
function getBuRatingForLength(length: number, ratings: Record<string, number | null>): number | null {
  let bestMatchKey = -1;
  for (const lengthKey in ratings) {
    const availableLength = parseFloat(lengthKey);
    if (availableLength <= length && availableLength > bestMatchKey) {
      bestMatchKey = availableLength;
    }
  }
  if (bestMatchKey !== -1) {
    return ratings[bestMatchKey.toString()];
  }
  return null;
}

// --- Data Structures (Interfaces) ---
interface BracingType {
  name: string;
  wind: Record<string, number | null>;
  eq: Record<string, number | null>;
}

interface BracingData {
  systems: { name: string; types: BracingType[]; }[];
}

interface BracingRow {
  id: number;
  label: string;
  system: string;
  type: string;
  lengthOrCount: number; // Renamed for clarity
  height: number;
}
// --- Component Props ---
interface BracinglineProps {
    id: number;
    index: number;
    onDeleteREquest: (id: number) => void;
    onUpdate: (id: number, totals: { wind: number; eq: number }) => void;
    onAdd: (index: number) => void;
    totalTabDemandWind: number;
    totalTabDemandEQ: number;
    bracinglineCount: number; // Hidden variable is now a prop
    floorType: string;
}

let nextRowId = 1;

// Helper to create a default row
const createDefaultRow = (bracinglineNo: string, rowCount: number): BracingRow => ({
    id: nextRowId++,
    label: `${bracinglineNo}-${rowCount + 1}`,
    system: "GIB",
    type: "GS1-N",
    lengthOrCount: 1.2,
    height: 2.4,
});

export function Bracingline({ id, index, onDeleteRequest, onUpdate, onAdd, totalTabDemandWind, totalTabDemandEQ, bracinglineCount, floorType}: BracinglineProps) {
  const [bracinglineNo, setBracinglineNo] = useState(`BL-${id}`);
  const [externalWallLength, setExternalWallLength] = useState(0);
  const [rows, setRows] = useState<BracingRow[]>([createDefaultRow(bracinglineNo, 0)]);
  const [bracingData, setBracingData] = useState<BracingData | null>(null);

  useEffect(() => {
    fetch('/bracing-data.json').then(res => res.json()).then(data => setBracingData(data));
  }, []);

  // --- Add row at a specific index ---
  const addRow = (rowIndex: number) => {
     const newRow = createDefaultRow(bracinglineNo, rows.length);
     const newRows = [...rows];
     newRows.splice(rowIndex + 1, 0, newRow); // Insert after the current row
     setRows(newRows);
  };

  const deleteRow = (rowId: number) => {
     if (rows.length > 1) {
         setRows(rows.filter(row => row.id !== rowId));
     }
  };

  // ---  Handle system change to update type ---
  const handleSystemChange = (rowId: number, newSystem: string) => {
    const firstTypeForSystem = bracingData?.systems.find(s => s.name === newSystem)?.types[0]?.name || "";
    setRows(rows.map(row => 
      row.id === rowId 
      ? { ...row, system: newSystem, type: firstTypeForSystem } // Req 5: Set first type as default
      : row
    ));
  };

  const updateRowField = (rowId: number, field: keyof BracingRow, value: string | number) => {
    setRows(rows.map(row => (row.id === rowId ? { ...row, [field]: value } : row)));
  };

  const applyFloorTypeLimit = (rating: number | null): number | null => {
        // If the floor is Timber and the rating is a number greater than 120, cap it.
        if (floorType === 'Timber' && rating !== null && rating > 120) {
         return 120;
        }
        // Otherwise, return the original rating (it could be a number <= 120, null, or for "Concrete")
        return rating;
  };

  // --- Calculation logic ---
  const calculateLineTotals = () => {
     let totalWind = 0;
     let totalEQ = 0;

     for (const row of rows) {
      const typeData = getTypeData(row.system, row.type);
      if (!typeData) continue;
      
      // Req 7: Using the new height ratio formula (2.4 / Height)
      const heightRatio = row.height > 0 ? 2.4 / row.height : 0;
      let buAchievedWind = 0;
      let buAchievedEQ = 0;
      const isNumberBased = row.system === 'Custom' && typeData.wind['1'] !== undefined;

      if (isNumberBased) {
        const rawWindRating = typeData.wind['1'] ?? 0;
        const rawEqRating = typeData.eq['1'] ?? 0;

        const windRating = applyFloorTypeLimit(rawWindRating);
        const eqRating = applyFloorTypeLimit(rawEqRating);

        // Number-based Total = Rating * Quantity * HeightRatio
        buAchievedWind = windRating * row.lengthOrCount * heightRatio;
        buAchievedEQ = eqRating * row.lengthOrCount * heightRatio;
      } else {
        const windRating = getBuRatingForLength(row.lengthOrCount, typeData.wind);
        const eqRating = getBuRatingForLength(row.lengthOrCount, typeData.eq);
        // Length-based Total = BUs * Length * HeightRatio (where BUs is now treated as BUs/m)
        buAchievedWind = (windRating ?? 0) * row.lengthOrCount * heightRatio;
        buAchievedEQ = (eqRating ?? 0) * row.lengthOrCount * heightRatio;
      }
      
      totalWind += buAchievedWind;
      totalEQ += buAchievedEQ;
    }
    return { lineTotalWind: totalWind, lineTotalEQ: totalEQ };
  };

  const getTypeData = (system: string, type: string) => {
    const sys = bracingData?.systems.find(s => s.name === system);
    return sys?.types.find(t => t.name === type);
  };

  const { lineTotalWind, lineTotalEQ } = calculateLineTotals();
  // --- Min. Demand Calculation ---
  const safeBracinglineCount = bracinglineCount > 0 ? bracinglineCount : 1;
  const minDemandWind = Math.max(100, 15 * externalWallLength, (totalTabDemandWind / safeBracinglineCount) * 0.5);
  const minDemandEQ = Math.max(100, 15 * externalWallLength, (totalTabDemandEQ / safeBracinglineCount) * 0.5);
  const isWindOk = lineTotalWind >= minDemandWind;
  const isEqOk = lineTotalEQ >= minDemandEQ;
  
  useEffect(() => {
    onUpdate(id, { wind: lineTotalWind, eq: lineTotalEQ });
  }, [lineTotalWind, lineTotalEQ, id, onUpdate]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-x-2">
        {/* Inputs moved to header */}
        <div className="flex-1 flex items-center gap-x-4 gap-y-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Label htmlFor={`bl-no-${id}`} className="flex-shrink-0">Bracing No.</Label>
            <Input id={`bl-no-${id}`} value={bracinglineNo} onChange={e => setBracinglineNo(e.target.value)} className="w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor={`wall-len-${id}`} className="flex-shrink-0">External wall length (m)</Label>
            <Input type="number" id={`wall-len-${id}`} value={externalWallLength} onChange={e => setExternalWallLength(Number(e.target.value))} className="w-28" />
          </div>
        </div>
        <div className="flex items-center">
            {/* Add & remove bracing line button in header */}
            <Button variant="ghost" size="icon" onClick={() => onAdd(index)}>
                <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDeleteRequest(id)} disabled={bracinglineCount <= 2}>
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Label</TableHead>
                            <TableHead>System</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Length/No. (m)</TableHead>
                            <TableHead>Height (m)</TableHead>
                            <TableHead className="text-center">BUs/m Wind</TableHead>
                            <TableHead className="text-center">BUs/m EQ</TableHead>
                            <TableHead className="text-center">Total Wind</TableHead>
                            <TableHead className="text-center">Total EQ</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, rowIndex)=> {
                            const typeData = getTypeData(row.system, row.type);
                            const isNumberBased = row.system === 'Custom' && typeData?.wind['1'] !== undefined;
                            const rawWindRating = isNumberBased ? (typeData?.wind['1'] ?? null) : (typeData ? getBuRatingForLength(row.lengthOrCount, typeData.wind) : null);
                            const rawEqRating = isNumberBased ? (typeData?.eq['1'] ?? null) : (typeData ? getBuRatingForLength(row.lengthOrCount, typeData.eq) : null);
                            const windRating = applyFloorTypeLimit(rawWindRating);
                            const eqRating = applyFloorTypeLimit(rawEqRating);
                            const isRowInvalid = windRating === null || eqRating === null;
                            const heightRatio = row.height > 0 ? 2.4 / row.height : 0;
                            const totalWind = (isNumberBased ? (windRating ?? 0) * row.lengthOrCount : (windRating ?? 0) * row.lengthOrCount) * heightRatio;
                            const totalEQ = (isNumberBased ? (eqRating ?? 0) * row.lengthOrCount : (eqRating ?? 0) * row.lengthOrCount) * heightRatio;

                            return (
                                <TableRow key={row.id} className={cn(isRowInvalid && "bg-red-100/50")}>
                                    <TableCell><Input value={row.label} onChange={e => updateRowField(row.id, 'label', e.target.value)} /></TableCell>
                                    <TableCell>
                                        <Select value={row.system} onValueChange={val => handleSystemChange(row.id, val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {bracingData?.systems.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Select value={row.type} onValueChange={val => updateRowField(row.id, 'type', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {bracingData?.systems.find(s => s.name === row.system)?.types.map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell><Input type="number" step="0.1" value={row.lengthOrCount} onChange={e => updateRowField(row.id, 'lengthOrCount', Number(e.target.value))} /></TableCell>
                                    <TableCell><Input type="number" step="0.1" value={row.height} onChange={e => updateRowField(row.id, 'height', Number(e.target.value))} /></TableCell>
                                    
                                    <TableCell className="text-center font-medium">
                                        {isRowInvalid ? <span className="text-red-600 font-bold">NA</span> : windRating?.toFixed(0)}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {isRowInvalid ? <span className="text-red-600 font-bold">NA</span> : eqRating?.toFixed(0)}
                                    </TableCell>

                                    <TableCell className="text-center">{totalWind.toFixed(0)}</TableCell>
                                    <TableCell className="text-center">{totalEQ.toFixed(0)}</TableCell>
                                    <TableCell className="flex gap-1">
                                        {/* Add row button in action column */}
                                        <Button variant="outline" size="icon" onClick={() => addRow(rowIndex)}><Plus className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="icon" onClick={() => deleteRow(row.id)} disabled={rows.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
        <CardFooter>
            {/* Subtotal Area */}
            <div className="w-full flex justify-end">
            <div className="w-full max-w-md grid grid-cols-3 gap-x-4 gap-y-2 text-sm mr-10">
                <div></div>
                <div className="font-bold text-center">Wind</div>
                <div className="font-bold text-center">EQ</div>
                

                <div className="font-semibold text-right">Total for line</div>
                <div className="text-center bg-muted rounded p-1">{lineTotalWind.toFixed(0)}</div>
                <div className="text-center bg-muted rounded p-1">{lineTotalEQ.toFixed(0)}</div>
                

                <div className="font-semibold text-right">Min. Demand</div>
                <div className="text-center bg-muted rounded p-1">{minDemandWind.toFixed(0)}</div>
                <div className="text-center bg-muted rounded p-1">{minDemandEQ.toFixed(0)}</div>
                
                
                <div className="font-semibold text-right">Result</div>
                <div className={cn("text-center font-bold rounded p-1", isWindOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{isWindOk ? "OK" : "NG"}</div>
                <div className={cn("text-center font-bold rounded p-1", isEqOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{isEqOk ? "OK" : "NG"}</div>
                
            </div>
            </div>
        </CardFooter>
    </Card>
  );
}