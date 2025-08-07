// src/components/bracing/Bracingline.tsx

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
interface BracinglineProps {
    id: number;
    onDelete: (id: number) => void;
    onUpdate: (id: number, totals: { wind: number; eq: number }) => void;
}

let nextRowId = 1;

export function Bracingline({ id, onDelete, onUpdate }: BracinglineProps) {
  const [bracinglineNo, setBracinglineNo] = useState(`BL-${id}`);
  const [externalWallLength, setExternalWallLength] = useState(0);
  const [rows, setRows] = useState<BracingRow[]>([]);
  const [bracingData, setBracingData] = useState<BracingData | null>(null);

  useEffect(() => {
    fetch('/bracing-data.json').then(res => res.json()).then(data => setBracingData(data));
  }, []);

  const addRow = () => {
    const newRow: BracingRow = {
      id: nextRowId++,
      label: `Item ${rows.length + 1}`,
      system: "GIB",
      type: "GS1-N",
      lengthOrCount: 1.2, // Default value
      height: 2.4,
    };
    setRows([...rows, newRow]);
  };

  const deleteRow = (rowId: number) => {
    setRows(rows.filter(row => row.id !== rowId));
  };

  const updateRow = (rowId: number, field: keyof BracingRow, value: string | number) => {
    setRows(rows.map(row => (row.id === rowId ? { ...row, [field]: value } : row)));
  };

  // --- UPDATED AND FINAL Calculation Logic ---
  const standardHeight = 2.4;

  const getTypeData = (system: string, type: string) => {
    const sys = bracingData?.systems.find(s => s.name === system);
    return sys?.types.find(t => t.name === type);
  };

  const calculateLineTotals = () => {
    let totalWind = 0;
    let totalEQ = 0;

    for (const row of rows) {
      const typeData = getTypeData(row.system, row.type);
      if (!typeData) continue;

      const heightRatio = row.height / standardHeight;
      let buAchievedWind = 0;
      let buAchievedEQ = 0;
      
      // *** NEW LOGIC: Check if it's a number-based "Custom" type ***
      const isNumberBased = row.system === 'Custom' && typeData.wind['1'] !== undefined;

      if (isNumberBased) {
        const windRating = typeData.wind['1'] ?? 0;
        const eqRating = typeData.eq['1'] ?? 0;
        // Calculation is: Rating * Quantity * HeightRatio
        buAchievedWind = windRating * row.lengthOrCount * heightRatio;
        buAchievedEQ = eqRating * row.lengthOrCount * heightRatio;
      } else {
        // *** This is the standard "floor" lookup for length-based types ***
        const windRating = getBuRatingForLength(row.lengthOrCount, typeData.wind);
        const eqRating = getBuRatingForLength(row.lengthOrCount, typeData.eq);
        // Calculation is: LookedUpRating * HeightRatio
        buAchievedWind = (windRating ?? 0) * heightRatio;
        buAchievedEQ = (eqRating ?? 0) * heightRatio;
      }
      
      totalWind += buAchievedWind;
      totalEQ += buAchievedEQ;
    }
    return { lineTotalWind: totalWind, lineTotalEQ: totalEQ };
  };

  const { lineTotalWind, lineTotalEQ } = calculateLineTotals();

  const minDemandWind = externalWallLength * 15;
  const minDemandEQ = externalWallLength * 20;
  const isWindOk = lineTotalWind >= minDemandWind;
  const isEqOk = lineTotalEQ >= minDemandEQ;
  
  useEffect(() => {
    onUpdate(id, { wind: lineTotalWind, eq: lineTotalEQ });
  }, [lineTotalWind, lineTotalEQ, id, onUpdate]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bracing Line</CardTitle>
        <Button variant="destructive" size="icon" onClick={() => onDelete(id)}>
            <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor={`bl-no-${id}`}>Bracingline No.</Label>
            <Input id={`bl-no-${id}`} value={bracinglineNo} onChange={e => setBracinglineNo(e.target.value)} />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor={`wall-len-${id}`}>External wall length (m)</Label>
            <Input type="number" id={`wall-len-${id}`} value={externalWallLength} onChange={e => setExternalWallLength(Number(e.target.value))} />
          </div>
        </div>
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
                        {rows.map(row => {
                            const typeData = getTypeData(row.system, row.type);
                            const heightRatio = row.height / standardHeight;
                            
                            // *** NEW LOGIC: Determine type and get ratings ***
                            const isNumberBased = row.system === 'Custom' && typeData?.wind['1'] !== undefined;
                            let windRating: number | null = 0;
                            let eqRating: number | null = 0;
                            
                            if (isNumberBased) {
                                windRating = typeData?.wind['1'] ?? null;
                                eqRating = typeData?.eq['1'] ?? null;
                            } else if (typeData) {
                                windRating = getBuRatingForLength(row.lengthOrCount, typeData.wind);
                                eqRating = getBuRatingForLength(row.lengthOrCount, typeData.eq);
                            }

                            const isRowInvalid = windRating === null || eqRating === null;
                            const totalWind = (isNumberBased ? (windRating ?? 0) * row.lengthOrCount : (windRating ?? 0)) * heightRatio;
                            const totalEQ = (isNumberBased ? (eqRating ?? 0) * row.lengthOrCount : (eqRating ?? 0)) * heightRatio;

                            return (
                                <TableRow key={row.id} className={cn(isRowInvalid && "bg-red-100/50")}>
                                    <TableCell><Input value={row.label} onChange={e => updateRow(row.id, 'label', e.target.value)} /></TableCell>
                                    <TableCell>
                                        <Select value={row.system} onValueChange={val => updateRow(row.id, 'system', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {bracingData?.systems.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Select value={row.type} onValueChange={val => updateRow(row.id, 'type', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {bracingData?.systems.find(s => s.name === row.system)?.types.map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell><Input type="number" value={row.lengthOrCount} onChange={e => updateRow(row.id, 'lengthOrCount', Number(e.target.value))} /></TableCell>
                                    <TableCell><Input type="number" value={row.height} onChange={e => updateRow(row.id, 'height', Number(e.target.value))} /></TableCell>
                                    
                                    <TableCell className="text-center font-medium">
                                        {isRowInvalid ? <span className="text-red-600 font-bold">NA</span> : windRating?.toFixed(0)}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {isRowInvalid ? <span className="text-red-600 font-bold">NA</span> : eqRating?.toFixed(0)}
                                    </TableCell>

                                    <TableCell className="text-center">{totalWind.toFixed(0)}</TableCell>
                                    <TableCell className="text-center">{totalEQ.toFixed(0)}</TableCell>
                                    <TableCell><Button variant="outline" size="icon" onClick={() => deleteRow(row.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            <Button onClick={addRow}>Add Row</Button>
        </CardContent>
        <CardFooter>
            {/* Subtotal Area */}
            <div className="w-full grid grid-cols-4 gap-x-4 gap-y-2 text-sm">
                <div></div>
                <div className="font-bold text-center">Wind</div>
                <div className="font-bold text-center">EQ</div>
                <div></div>

                <div className="font-semibold text-right">Total for line</div>
                <div className="text-center bg-muted rounded p-1">{lineTotalWind.toFixed(0)}</div>
                <div className="text-center bg-muted rounded p-1">{lineTotalEQ.toFixed(0)}</div>
                <div></div>

                <div className="font-semibold text-right">Min. Demand</div>
                <div className="text-center bg-muted rounded p-1">{minDemandWind.toFixed(0)}</div>
                <div className="text-center bg-muted rounded p-1">{minDemandEQ.toFixed(0)}</div>
                <div></div>
                
                <div className="font-semibold text-right">Result</div>
                <div className={cn("text-center font-bold rounded p-1", isWindOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{isWindOk ? "OK" : "NG"}</div>
                <div className={cn("text-center font-bold rounded p-1", isEqOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{isEqOk ? "OK" : "NG"}</div>
                <div></div>
            </div>
        </CardFooter>
    </Card>
  );
}