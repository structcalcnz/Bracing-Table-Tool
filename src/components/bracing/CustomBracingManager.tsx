// src/components/bracing/CustomBracingManager.tsx

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CustomBracing, BracingValue } from '@/types';

interface CustomBracingManagerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  existingBracings: CustomBracing[];
  onSave: (bracing: CustomBracing) => void;
  onDelete: (bracingName: string) => void;
}

const createEmptyForm = (): [string, BracingValue[], boolean] => ['', [{ key: '', wind: 0, eq: 0 }], false];

export function CustomBracingManager({ isOpen, onOpenChange, existingBracings, onSave, onDelete }: CustomBracingManagerProps) {
  // Form State
  const [name, setName] = useState('');
  const [values, setValues] = useState<BracingValue[]>([]);
  const [isNumberBased, setIsNumberBased] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nameError, setNameError] = useState('');

  const resetForm = () => {
     const [n, v, i] = createEmptyForm();
     setName(n);
     setValues(v);
     setIsNumberBased(i);
     setIsEditing(false);
     setNameError(''); // Also clear any validation errors
  };

  useEffect(() => {
    // When the dialog opens, reset the form
    if (isOpen) {
        resetForm();
    }
  }, [isOpen]);

  const handleEditClick = (bracing: CustomBracing) => {
        setIsEditing(true);
        setName(bracing.name);
        setNameError('');
        
        // Convert from { key: val } format to array format for the form
        const isNum = Object.keys(bracing.wind)[0] === 'n_1';
        setIsNumberBased(isNum);
        if (isNum) {
        setValues([{ key: 'n_1', wind: bracing.wind.n_1, eq: bracing.eq.n_1 }]);
        } else {
        const formattedValues = Object.keys(bracing.wind).map(key => ({
            key,
            wind: bracing.wind[key] ?? 0,
            eq: bracing.eq[key] ?? 0,
        }));
        setValues(formattedValues.length > 0 ? formattedValues : [{ key: '', wind: 0, eq: 0 }]);
        }
  };

  const handleValueChange = (index: number, field: keyof BracingValue, value: string | number) => {
    const newValues = [...values];
    (newValues[index] as any)[field] = value;
    setValues(newValues);
  };

  const addValueRow = () => setValues([...values, { key: '', wind: 0, eq: 0 }]);
  const removeValueRow = (index: number) => {
    if (values.length > 1) {
      setValues(values.filter((_, i) => i !== index));
    }
  };

  const handleSaveClick = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Bracing name cannot be empty.');
      return;
    }
    // Check for existing name only when adding a new bracing (not when editing)
    if (!isEditing && existingBracings.some(b => b.name === trimmedName)) {
      setNameError('This bracing name already exists.');
      return;
    }
    // Convert form array back to the required { key: val } format
    const wind: Record<string, number> = {};
    const eq: Record<string, number> = {};
    
    if (isNumberBased) {
      wind['n_1'] = Number(values[0].wind);
      eq['n_1'] = Number(values[0].eq);
    } else {
      values.forEach(v => {
        if (v.key) {
          wind[v.key] = Number(v.wind);
          eq[v.key] = Number(v.eq);
        }
      });
    }

    onSave({ name: name.trim(), wind, eq });
    resetForm();
  };

  const handleNewClick = () => {
     resetForm();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (nameError) {
      setNameError('');
    }
    setName(e.target.value);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-xl max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Custom Bracing Manager</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Left Side: List of Existing Bracings */}
          <div className="flex flex-col  border-r pr-6 h-full">
            <h3 className="text-lg font-semibold mb-2">Existing Bracings</h3>
            <div className="overflow-y-auto">
            <Table>
              <TableBody>
                {existingBracings.map(b => (
                  <TableRow key={b.name}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(b)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(b.name)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            <Button variant="outline" className="mt-4" size="sm" onClick={handleNewClick}>New</Button>        
          </div>

          {/* Right Side: Add/Edit Form */}
          <div className="flex flex-col space-y-4 overflow-y-auto">
            <h3 className="text-lg font-semibold">{isEditing ? 'Edit Bracing' : 'Add New Bracing'}</h3>
            <div>
              <Label htmlFor="bracing-name">Bracing Type Name</Label>
              <Input id="bracing-name" className="mt-2" value={name} onChange={handleNameChange} disabled={isEditing} />
              {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
              {isEditing && <p className="text-xs text-muted-foreground">Name cannot be changed when editing.</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="is-number-based" checked={isNumberBased} onCheckedChange={(checked) => setIsNumberBased(Boolean(checked))} />
              <Label htmlFor="is-number-based">Number-based (e.g., pile, portal)</Label>
            </div>
            
            {/* Header Row */}
            <div className="grid grid-cols-[48px_1fr_1fr_auto] items-center gap-2 px-1 mb-2">
            <div></div> {/* Empty cell to align with the key input */}
            <label className="text-center text-sm font-semibold">Wind</label>
            <label className="text-center text-sm font-semibold">EQ</label>
            <div className="w-6"></div>
            </div>

            {/* Value Rows */}
            <div className="space-y-2">
              {values.map((v, index) => (
                <div key={index} className="grid grid-cols-[48px_1fr_1fr_auto] items-center gap-2 px-1">
                  <Input type="text" placeholder={isNumberBased ? 'n_1' : 'Length Key'} value={isNumberBased ? 'n_1' : v.key} onChange={e => handleValueChange(index, 'key', e.target.value)} disabled={isNumberBased} className="w-12" />
                  <Input type="number" placeholder="Wind BUs" value={v.wind} onChange={e => handleValueChange(index, 'wind', e.target.value)} />
                  <Input type="number" placeholder="EQ BUs" value={v.eq} onChange={e => handleValueChange(index, 'eq', e.target.value)} />
                  {!isNumberBased && <Button variant="ghost" size="icon" onClick={() => removeValueRow(index)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
              ))}
              {!isNumberBased && <Button size="sm" variant="outline" onClick={addValueRow}><Plus className="mr-2 h-4 w-4" /> Add Length</Button>}
            </div>

            <div className="pt-4">
              <Button onClick={handleSaveClick}>Save {isEditing ? 'Changes' : 'New Bracing'}</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}