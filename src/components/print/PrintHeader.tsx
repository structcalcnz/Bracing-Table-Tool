// src/components/print/PrintHeader.tsx

import { format } from "date-fns";
import type { ProjectInfo } from '@/types'; 

interface PrintHeaderProps {
  projectInfo: ProjectInfo;
}

export function PrintHeader({ projectInfo }: PrintHeaderProps) {
  // Format the date nicely, handle case where it might be undefined
  const formattedDate = projectInfo.date ? format(new Date(projectInfo.date), "d/MM/yyyy") : 'N/A';

  return (
    <div className="grid grid-cols-3 gap-4 border-2 border-black p-2">
      {/* Left Column: Logo */}
      <div className="flex items-center justify-center">
        <img src="/logo.png" alt="Company Logo" className="h-16" />
      </div>

      {/* Middle Column: Job Info */}
      <div className="text-sm">
        <div className="grid grid-cols-[auto_1fr] gap-x-2">
          <span className="font-bold">Client:</span><span>{projectInfo.client}</span>
          <span className="font-bold">Job:</span><span>{projectInfo.projectName}</span>
          <span className="font-bold">Design by:</span><span>{projectInfo.designer}</span>
        </div>
      </div>

      {/* Right Column: Sheet Info */}
      <div className="text-sm">
        <div className="grid grid-cols-[auto_1fr] gap-x-2">
            <span className="font-bold">Sheet No:</span><span></span> {/* Blank as requested */}
            <span className="font-bold">Job No:</span><span>{projectInfo.projectNo}</span>
            <span className="font-bold">Date:</span><span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}