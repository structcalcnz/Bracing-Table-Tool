import { Sidebar } from "./components/layout/Sidebar";
import { TabSystem } from "./components/layout/TabSystem";
import './App.css'


function App() {

  return (
  <main className="min-h-screen bg-background text-foreground">
   {/* The Sidebar component contains its own trigger button */}
   <Sidebar />

   {/* This will be the main content area for your tabs */}
    <div className="p-4 sm:p-6 md:p-8">
      <div className="ml-16"> {/* Add margin to avoid content starting under the trigger button */}
        <TabSystem />
      </div>
    </div>
  </main>

  )
}

export default App
