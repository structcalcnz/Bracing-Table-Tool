// src/components/bracing/Bracingline.tsx

import { useEffect, useMemo } from "react";
import { useAppStore } from '@/store';
import { useBracingStore } from '@/bracingStore';
import { calculateLineRows, calculateLineTotals, calculateMinDemand,validateLineTotals } from "@/calculationUtils";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { BracingRow } from "@/types";

type LineTotals = {
  lineTotalWind: number;
  lineTotalEQ: number;
};

// --- Component Props ---
interface BracinglineProps {
  lineId: number;
  index: number;
  tabId: string;
  onAdd: (index: number) => void;         
  onDeleteRequest: (id: number) => void;
  onTotalsChange: (lineId: number, totals: LineTotals) => void;
}

export function Bracingline({ tabId, lineId, index, onAdd, onDeleteRequest, onTotalsChange }: BracinglineProps) {
  // Get all data from zustand store
  const lineData = useAppStore(state => state.tabsData[tabId]?.bracinglines.find(bl => bl.id === lineId));
  const bracinglineCount = useAppStore(state => state.tabsData[tabId]?.bracinglines.length ?? 0);
  const floorType = useAppStore(state => state.tabsData[tabId]?.floorType);
  const totalTabDemandWind = useAppStore(state => state.tabsData[tabId]?.demandWind ?? 0);
  const totalTabDemandEQ = useAppStore(state => state.tabsData[tabId]?.demandEQ ?? 0);

  // Actions from zustand
  const updateBracinglineField = useAppStore(state => state.updateBracinglineField);
  const addBracinglineRow = useAppStore(state => state.addBracinglineRow);
  const updateBracinglineRow = useAppStore(state => state.updateBracinglineRow);
  const deleteBracinglineRow = useAppStore(state => state.deleteBracinglineRow);

  // get the bracingData
  const bracingData = useBracingStore((s) => s.bracingData);

  // --- Calculation using zustand data ---
  const calculatedRows = useMemo(() => {
    return calculateLineRows(lineData ?? { rows: [] }, bracingData, floorType);
  }, [lineData, bracingData, floorType]);

  // --- Totals for bracingline ---
  const { lineTotalWind, lineTotalEQ } = useMemo(() => {
    return calculateLineTotals(calculatedRows);
  }, [calculatedRows]);

  // Notify parent when totals change
  useEffect(() => {
    onTotalsChange(lineId, { lineTotalWind, lineTotalEQ });
  }, [lineTotalWind, lineTotalEQ, lineId, onTotalsChange]);

  // --- Min. Demand Calculation using zustand data ---
  const externalWallLength = lineData?.externalWallLength ?? 0;
  const { minDemandWind, minDemandEQ } = useMemo(() => {
    return calculateMinDemand(
      externalWallLength,
      totalTabDemandWind,
      totalTabDemandEQ,
      bracinglineCount
    );
  }, [externalWallLength, totalTabDemandWind, totalTabDemandEQ, bracinglineCount]);

  const { isWindOk, isEqOk } = validateLineTotals(
    lineTotalWind,
    lineTotalEQ,
    minDemandWind,
    minDemandEQ
  );

  // --- Update totals in store ---
  //useEffect(() => {
  //  if (lineData) {
  //    updateBracinglineField(tabId, lineId, "totals", { wind: lineTotalWind, eq: lineTotalEQ });
  //    updateBracinglineField(tabId, lineId, "demands", { wind: minDemandWind, eq: minDemandEQ });
  //  }
  //}, [lineTotalWind, lineTotalEQ, minDemandWind, minDemandEQ, tabId, lineId, updateBracinglineField, lineData]);

  // --- Handlers using zustand actions ---
  const handleExternalWallLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBracinglineField(tabId, lineId, "externalWallLength", Number(e.target.value));
  };
  const handleBracinglineNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBracinglineField(tabId, lineId, "bracinglineNo", e.target.value);
  };
  const addRow = (rowIndex: number) => {
    addBracinglineRow(tabId, lineId, rowIndex);
  };
  const deleteRow = (rowId: number) => {
    deleteBracinglineRow(tabId, lineId, rowId);
  };
  const handleSystemChange = (rowId: number, newSystem: string) => {
    const firstTypeForSystem = bracingData?.systems.find(s => s.name === newSystem)?.types[0]?.name || "";
    updateBracinglineRow(tabId, lineId, rowId, { system: newSystem, type: firstTypeForSystem });
  };
  const updateRowField = (rowId: number, field: keyof BracingRow, value: any) => {
    updateBracinglineRow(tabId, lineId, rowId, { [field]: value });
  };

  // --- Render ---
  if (!lineData) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-x-2">
        <div className="flex-1 flex items-center gap-x-4 gap-y-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Label htmlFor={`bl-no-${lineId}`} className="flex-shrink-0">Bracing No.</Label>
            <Input id={`bl-no-${lineId}`} value={lineData.bracinglineNo} onChange={handleBracinglineNoChange} className="w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor={`wall-len-${lineId}`} className="flex-shrink-0">External wall length (m)</Label>
            <Input type="number" id={`wall-len-${lineId}`} value={lineData.externalWallLength} onChange={handleExternalWallLengthChange} className="w-28" />
          </div>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => onAdd(index)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDeleteRequest(lineId)} disabled={bracinglineCount <= 2}>
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
              {calculatedRows.map((row, rowIndex) => (
                <TableRow key={row.id} className={cn(row.isRowInvalid && "bg-red-100/50")}>
                  <TableCell>
                    <Input value={row.label} onChange={e => updateRowField(row.id, "label", e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <Select value={row.system} onValueChange={val => handleSystemChange(row.id, val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {bracingData?.systems.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={row.type} onValueChange={val => updateRowField(row.id, "type", val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {bracingData?.systems.find(s => s.name === row.system)?.types.map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input type="number" step="0.1" value={row.lengthOrCount} onChange={e => updateRowField(row.id, "lengthOrCount", Number(e.target.value))} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" step="0.1" value={row.height} onChange={e => updateRowField(row.id, "height", Number(e.target.value))} />
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {row.isRowInvalid ? <span className="text-red-600 font-bold">NA</span> : row.windRating?.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {row.isRowInvalid ? <span className="text-red-600 font-bold">NA</span> : row.eqRating?.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-center">{row.totalWind.toFixed(0)}</TableCell>
                  <TableCell className="text-center">{row.totalEQ.toFixed(0)}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={() => addRow(rowIndex)}><Plus className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => deleteRow(row.id)} disabled={lineData.rows.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-end">
          <div className="w-full max-w-md grid grid-cols-3 gap-x-4 gap-y-2 text-sm mr-10">
            <div></div>
            <div className="font-bold text-center">Wind</div>
            <div className="font-bold text-center">EQ</div>
            <div className="font-semibold text-right">Min. Demand</div>
            <div className="text-center bg-muted rounded p-1">{minDemandWind.toFixed(0)}</div>
            <div className="text-center bg-muted rounded p-1">{minDemandEQ.toFixed(0)}</div>
            <div className="font-semibold text-right">Total for Line</div>
            <div className="text-center bg-muted rounded p-1">{lineTotalWind.toFixed(0)}</div>
            <div className="text-center bg-muted rounded p-1">{lineTotalEQ.toFixed(0)}</div>
            <div className="font-semibold text-right">Result</div>
            <div className={cn("text-center font-bold rounded p-1", isWindOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{isWindOk ? "OK" : "NG"}</div>
            <div className={cn("text-center font-bold rounded p-1", isEqOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{isEqOk ? "OK" : "NG"}</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}