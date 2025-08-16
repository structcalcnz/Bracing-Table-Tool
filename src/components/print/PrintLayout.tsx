// src/components/print/PrintLayout.tsx

import React from 'react';
import { PrintHeader } from './PrintHeader';
import { TabContent } from '../layout/TabContent';
import type { ProjectInfo, Tab, BracingData } from '@/types';

interface PrintLayoutProps {
  projectInfo: ProjectInfo;
  tabs: Tab[];
  bracingData: BracingData;
}

// We use forwardRef to pass the ref from App.tsx down to the underlying div
const PrintLayout = React.forwardRef<HTMLDivElement, PrintLayoutProps>(
  ({ projectInfo, tabs, bracingData }, ref) => {
    return (
      <div ref={ref} className="printable-content">
        {tabs.map((tab, index) => (
          // This div forces a page break after each tab's content
          <div key={tab.id} className={index < tabs.length - 1 ? "break-after-page" : ""}>
            <PrintHeader projectInfo={projectInfo} />
            <div className="mt-4">
                {/* We reuse the TabContent component to display the data */}
                <TabContent 
                    level={tab.title} 
                    bracingData={bracingData} 
                />
            </div>
          </div>
        ))}
      </div>
    );
  }
);

export default PrintLayout;