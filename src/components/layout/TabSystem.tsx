// src/components/layout/TabSystem.tsx

import { useState } from "react";
import { PlusCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Tab } from "@/types"; // Adjust path if needed
import { TabContent } from "./TabContent"; // 1. Import the new component

// Helper to generate unique IDs
let nextId = 3;

export function TabSystem() {
  // State for the list of tabs
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "tab1", title: "Level 1" },
    { id: "tab2", title: "Level 2" },
  ]);

  // State for the currently active tab
  const [activeTab, setActiveTab] = useState("tab1");

  // State for managing the rename dialog
  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);
  const [tabToRename, setTabToRename] = useState<Tab | null>(null);
  const [newTabName, setNewTabName] = useState("");

  // State for managing the delete confirmation dialog
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<Tab | null>(null);


  const addTab = () => {
    const id = `tab${nextId++}`;
    const newTab = { id, title: `New Tab ${nextId - 1}` };
    setTabs([...tabs, newTab]);
    setActiveTab(id); // Automatically switch to the new tab
  };

  const handleDeleteClick = (tab: Tab) => {
    setTabToDelete(tab);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (!tabToDelete) return;
  
    // Filter out the tab to be deleted
    const newTabs = tabs.filter((tab) => tab.id !== tabToDelete.id);
  
    // If the deleted tab was the active one, set a new active tab
    if (activeTab === tabToDelete.id) {
      // Set active tab to the first one, or null if no tabs are left
      setActiveTab(newTabs.length > 0 ? newTabs[0].id : "");
    }
  
    setTabs(newTabs);
    setDeleteDialogOpen(false);
    setTabToDelete(null);
  };
  

  const handleRenameClick = (tab: Tab) => {
    setTabToRename(tab);
    setNewTabName(tab.title); // Pre-fill the input with the current title
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = () => {
    if (!tabToRename || !newTabName.trim()) return;

    setTabs(
      tabs.map((tab) =>
        tab.id === tabToRename.id ? { ...tab, title: newTabName.trim() } : tab
      )
    );
    
    setRenameDialogOpen(false);
    setTabToRename(null);
  };


  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center border-b">
          <TabsList className="mr-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="relative pr-8">
                {tab.title}
                 {/* Inline delete button on the tab */}
                 <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the tab from being selected when clicking the X
                    handleDeleteClick(tab);
                  }}
                  className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </TabsTrigger>
            ))}
          </TabsList>
          <Button variant="ghost" size="icon" onClick={addTab} className="m-1">
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* This is where the content for each tab will go */}
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
            {/* 2. Replace the old content with the new component */}
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-2xl font-semibold">{tab.title}</h2>
               <div>
                  <Button variant="outline" size="sm" onClick={() => handleRenameClick(tab)} className="mr-2">Rename Tab</Button>
               </div>
            </div>
            
            <TabContent level={tab.title} />

          </TabsContent>
        ))}
      </Tabs>

      {/* RENAME DIALOG */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Tab</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="tab-name">Tab Name</Label>
            <Input 
              id="tab-name" 
              value={newTabName} 
              onChange={(e) => setNewTabName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRenameSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the tab
                      "{tabToDelete?.title}".
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}