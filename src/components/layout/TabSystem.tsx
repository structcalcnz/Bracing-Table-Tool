// src/components/layout/TabSystem.tsx

import { useState } from "react";
import { PlusCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Tab } from "@/types"; 
import { useAppStore } from '@/store';
import { TabContent } from "./TabContent"; // Import the new component


// Helper to generate unique IDs
let nextId = 3;

export function TabSystem() {
  const { tabs, addTab, renameTab, deleteTab } = useAppStore();

  // State for the currently active tab
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  // State for managing the rename dialog
  const [isRenameDialogOpen, setRenameDialogOpen] = useState(false);
  const [tabToRename, setTabToRename] = useState<Tab | null>(null);
  const [newTabName, setNewTabName] = useState("");

  // State for managing the delete confirmation dialog
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<Tab | null>(null);
  const [isAddingNewTab, setIsAddingNewTab] = useState(false);

  const handleAddNewTabClick = () => {
    setIsAddingNewTab(true);
    setTabToRename({ id: `tab${nextId++}`, title: "" });
    setNewTabName("New Level"); // Suggest a default name
    setRenameDialogOpen(true);
  };

  const handleDeleteClick = (tab: Tab) => {
    setTabToDelete(tab);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (!tabToDelete) return;
    
    // Check if the tab being deleted is the active one
    if (activeTab === tabToDelete.id) {
      const currentIndex = tabs.findIndex(t => t.id === tabToDelete.id);
      // Activate the previous tab, or the first tab if the first was deleted
      const newActiveId = tabs[currentIndex - 1]?.id || tabs[0]?.id || "";
      setActiveTab(newActiveId);
    }

    deleteTab(tabToDelete.id);

    setDeleteDialogOpen(false);
    setTabToDelete(null);
  };

  const handleRenameClick = (tab: Tab) => {
     setIsAddingNewTab(false); // Set the mode to "rename"
     setTabToRename(tab);
     setNewTabName(tab.title);
     setRenameDialogOpen(true);
  };

  const handleRenameSubmit = () => {
    if (!tabToRename || !newTabName.trim()) return;

    if (isAddingNewTab) {
      const newTab: Tab = { ...tabToRename, title: newTabName.trim() };
      addTab(newTab); // Update state via callback
      setActiveTab(newTab.id); // Set the new tab as active locally
    } else {
      renameTab( tabToRename.id, newTabName.trim());
    }
    
    closeRenameDialog();
  };

  const closeRenameDialog = () => {
     setRenameDialogOpen(false);
     setTabToRename(null);
     setIsAddingNewTab(false);
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center border-b">
          <TabsList className="mr-auto whitespace-nowrap overflow-x-auto py-1">
            {tabs.map((tab) => (
              <TabsTrigger value={tab.id} className="relative pr-8 flex-shrink-0">
                <span className="block flex-1 min-w-0 text-left overflow-hidden text-ellipsis whitespace-nowrap">
                    {tab.title}
                </span>
                
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
          <Button variant="ghost" size="icon" onClick={handleAddNewTabClick} className="m-1">
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* This is where the content for each tab will go */}
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4">
               <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">{tab.title}</h2>
                    <div>
                        <Button variant="outline" size="sm" onClick={() => handleRenameClick(tab)} className="mr-2">Rename Tab</Button>
                    </div>
            </div>
            
            <TabContent tabId={tab.id} />

          </TabsContent>
        ))}
      </Tabs>

      {/* RENAME DIALOG */}
      <Dialog open={isRenameDialogOpen} onOpenChange={(open) => !open && closeRenameDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAddingNewTab ? "Create New Tab" : "Rename Tab"}</DialogTitle>
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
            <Button variant="outline" onClick={closeRenameDialog}>Cancel</Button>
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