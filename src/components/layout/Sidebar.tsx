// src/components/layout/Sidebar.tsx

import { format } from "date-fns";
import { Calendar as CalendarIcon, Menu } from "lucide-react";
// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils"; // This utility is for combining class names
import { useAppStore } from '@/store';

interface SidebarProps {
  onExportReport: () => void; 
}
export function Sidebar({onExportReport} : SidebarProps) {
  // --- Connect to the Zustand store ---
  const { projectInfo, updateProjectInfoField } = useAppStore();

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
            Enter the project information here.
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
              value={projectInfo.projectName}
              onChange={(e) => updateProjectInfoField('projectName', e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="project-no" className="w-[25%] text-right">
              Project No.
            </Label>
            <Input
              id="project-no"
              value={projectInfo.projectNo}
              onChange={(e) => updateProjectInfoField('projectNo', e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="client" className="w-[25%] text-right">
              Client
            </Label>
            <Input
              id="client"
              value={projectInfo.client} 
              onChange={(e) => updateProjectInfoField('client', e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="designer" className="w-[25%] text-right">
              Designer
            </Label>
            <Input
              id="designer"
              value={projectInfo.designer} 
              onChange={(e) => updateProjectInfoField('designer', e.target.value)}
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
                    !projectInfo.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {projectInfo.date  ? format(projectInfo.date , "d/MM/yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={projectInfo.date }
                  onSelect={(date) => updateProjectInfoField('date', date || new Date())}
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
              value={projectInfo.note} 
              onChange={(e) => updateProjectInfoField('note', e.target.value)}
              className="flex-1"
              placeholder="Type your notes here."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <SheetFooter className="mt-6">
           <div className="flex w-full flex-col items-center space-y-4">
              <Button variant="outline" className="w-48" > Custom Bracing </Button>
              <Button variant="outline" className="w-48" > Export Data </Button>
              <Button className="w-48" onClick={onExportReport}>Export Report</Button>
           </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}