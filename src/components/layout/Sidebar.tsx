// src/components/layout/Sidebar.tsx

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Menu } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils"; // This utility is for combining class names

export function Sidebar({ onOpenCustomBracing }: { onOpenCustomBracing: () => void; }) {
  // State management for each input field.
  // In a real app, this state might be lifted up to a parent component or managed globally.
  const [projectName, setProjectName] = useState("");
  const [projectNo, setProjectNo] = useState("");
  const [client, setClient] = useState("");
  const [designer, setDesigner] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState<Date>();

  const handleSave = () => {
    // In a real application, you would handle the save logic here.
    // e.g., send the data to an API, update global state, etc.
    const projectData = { projectName, projectNo, client, designer, date, note };
    console.log("Saving project data:", projectData);
    alert("Project Data Saved! (Check the console)");
  };

  return (
    <Sheet>
      {/* This is the button that will open the sidebar */}
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50">
           <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      
      {/* This is the content of the sidebar itself */}
      <SheetContent side="left" className="w-full sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Project Details</SheetTitle>
          <SheetDescription>
            Enter the project information here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        {/* Form Grid */}
        <div className="grid gap-4 p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="project-name" className="w-[25%] text-right whitespace-nowrap">
              Project Name
            </Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="project-no" className="w-[25%] text-right">
              Project No.
            </Label>
            <Input
              id="project-no"
              value={projectNo}
              onChange={(e) => setProjectNo(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="client" className="w-[25%] text-right">
              Client
            </Label>
            <Input
              id="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="designer" className="w-[25%] text-right">
              Designer
            </Label>
            <Input
              id="designer"
              value={designer}
              onChange={(e) => setDesigner(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="date" className="w-[25%] text-right">
              Date
            </Label>
            {/* Date Picker using Popover and Calendar */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "d/MM/yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="note" className="w-[25%] text-right">
              Note
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1"
              placeholder="Type your notes here."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <SheetFooter className="mt-4">
           <div className="flex w-full flex-col items-center space-y-4">
              <Button className="w-48" variant="outline" onClick={onOpenCustomBracing}>
                Custom Bracing
              </Button>
              <Button className="w-48" variant="outline" onClick={() => alert("Print PDF Clicked!")}>
                Print PDF
              </Button>
              <Button className="w-48" onClick={handleSave}>Save</Button>
           </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}