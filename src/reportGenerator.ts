// src/reportGenerator.ts
import { calculateLineRows, calculateLineTotals, calculateMinDemand,validateLineTotals } from "@/calculationUtils";
import { format } from "date-fns";

import type { ProjectInfo, BracinglineData, Tab, TabData, BracingData, DisplayBracingRow } from './types';


function processBracingLine({
  tabId,
  lineData,
  bracingData,
  floorType,
  demandWind,
  demandEQ,
  bracinglineCount,
}: {
  tabId: string;
  lineData: BracinglineData;
  bracingData: BracingData;
  floorType: 'Timber' | 'Concrete';
  demandWind: number;
  demandEQ: number;
  bracinglineCount: number;
}): ReportBracingline {
  const displayRows = calculateLineRows(lineData, bracingData, floorType);
  const { lineTotalWind, lineTotalEQ } = calculateLineTotals(displayRows);

  const { minDemandWind, minDemandEQ } = calculateMinDemand(
    lineData.externalWallLength,
    demandWind,
    demandEQ,
    bracinglineCount
  );

  const { isWindOk, isEqOk } = validateLineTotals(
    lineTotalWind,
    lineTotalEQ,
    minDemandWind,
    minDemandEQ
  );

  const lineSummary = {
    lineTotalWind,
    lineTotalEQ,
    minDemandWind,
    minDemandEQ,
    isWindOk,
    isEqOk,
  };

  return {
    id: lineData.id,
    bracinglineNo: lineData.bracinglineNo,
    externalWallLength: lineData.externalWallLength,
    displayRows,
    lineSummary,
  };
}

function processTab(tabData: TabData, bracingData: BracingData) {  
  const processedLines = tabData.bracinglines.map(lineData =>
    processBracingLine({
      tabId: tabData.id,
      lineData,
      bracingData,
      floorType: tabData.floorType,
      demandWind: tabData.demandWind,
      demandEQ: tabData.demandEQ,
      bracinglineCount: tabData.bracinglines.length,
    })
  );
  const { achievedWind, achievedEQ } = processedLines.reduce(
    (acc, line) => {
      acc.achievedWind += line.lineSummary.lineTotalWind ?? 0;
      acc.achievedEQ += line.lineSummary.lineTotalEQ ?? 0;
      return acc;
    },
    { achievedWind: 0, achievedEQ: 0 }
  );

  const windRate = tabData.demandWind === 0 ? 0 : (achievedWind / tabData.demandWind) * 100;
  const eqRate = tabData.demandEQ === 0 ? 0 : (achievedEQ / tabData.demandEQ) * 100;

  const tabSummary = {
    achievedWind,
    achievedEQ,
    windRate,
    eqRate,
  };
    // Destructure tabData and exclude bracinglines
  const { bracinglines, ...restTabData } = tabData;

  return {
    ...restTabData,
    processedLines,
    tabSummary,
  };
}

export function assembleFullReport( projectInfo: ProjectInfo, tabs:Tab[], tabsData: Record<string, TabData>, bracingData: BracingData
) {
  const  mergedTabs = tabs.map(tab => {
    const tabData = tabsData[tab.id];
    const tabContent = processTab(tabData, bracingData);
    return {
    ...tab,         // includes title, id, etc.
    ...tabContent,  // includes tabSummary, tabDetails, etc.
    };
  });

  return {
    projectInfo,
    tabs: mergedTabs,
  };
}

interface ReportBracingline {
  id: number;
  bracinglineNo: string;
  externalWallLength: number;
  displayRows: DisplayBracingRow[];
  lineSummary: LineSummary;
}

export interface LineSummary {
  lineTotalWind: number,
  lineTotalEQ: number,
  minDemandWind: number,
  minDemandEQ: number,
  isWindOk: boolean,
  isEqOk: boolean,
}

interface TabSummarry {
  achievedWind: number;
  achievedEQ: number;
  windRate: number;
  eqRate: number;
}

interface ReportTabData {
  id: string; // This links to the Tab {id, title}
  levelAndLocation: string;
  direction: string;
  floorType: 'Timber' | 'Concrete';
  demandWind: number;
  demandEQ: number;
  processedLines: ReportBracingline[];
  tabSummary: TabSummarry;
}

type ReportTab = Tab & ReportTabData;

interface ReportData {
  projectInfo: ProjectInfo;
  tabs: ReportTab[];
}

export function generateHTMLReport(reportData: ReportData) {

  const { projectInfo, tabs } = reportData;
  const formattedDate = projectInfo.date
    ? format(new Date(projectInfo.date), "d/MM/yyyy")
    : "N/A";

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Bracing Report</title>

    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        max-width: 900px;
        margin: auto;
        font-size: 13px;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 20px;
      }
      th, td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: center;
      }
      th {
        background-color: #f0f0f0;
      }
      .title-block {
        width: 100%;
        table-layout: fixed;
      }
      .title-block td {
        height: 100px;
        border: 1px solid #ccc;
        padding: 16px;
        vertical-align: middle;
        text-align: left;
      }
      .logo-cell {
        text-align: center;
        width: 25%;
      }
      .logo-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
      }
      .info-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
      }
      .summary-table {
        width: 50%;
      }
      .button-group {
        display: flex;
        gap: 12px;
        margin: 20px 0;
        padding-bottom: 20px;
        border-bottom: 2px solid black;
      }
      button {
        padding: 6px 12px;
        border: 1px solid #ccc;
        background-color: white;
        color: #333;
        font-weight: 500;
        border-radius: 6px;
        cursor: pointer;
        transition: box-shadow 0.2s ease;
      }
      button:hover {
        box-shadow: 0 0 0 2px black;
      }
      .tab-meta {
        margin-bottom: 12px;
      }
      .tab-meta p {
        margin: 4px 0;
      }
      .line-summary {
        width: 50%;
        margin-top: 12px;
        margin-bottom: 32px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        padding: 8px;
        border-radius: 4px;
      }
      .result-pass {
        background-color: #d4f4d7;
        font-weight: bold;
      }
      .result-fail {
        background-color: #f8d7da;
        font-weight: bold;
      }
      .tab-block {
        border-bottom: 2px solid #000;
        padding-top: 20px;
        margin-top: 20px;
      }
      @media print {
        .button-group {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <div class="button-group">
      <button onclick="window.print()"> Print PDF</button>
      <button onclick="downloadHTML()"> Download HTML</button>
    </div>

    <script>
      function downloadHTML() {
        const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bracing-report.html';
        a.click();
        URL.revokeObjectURL(url);
      }
    </script>


    <table class="title-block">
      <tr>
        <td class="logo-cell"><div class="logo-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                <path
       id="path1"
       style="fill:#b5791f;fill-opacity:1;stroke:none;stroke-width:0.179117;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
       d="M 58.749077,6.2023809 18.726829,29.239776 v 44.896063 l 14.463846,8.469564 8.449794,-4.890772 -13.544918,-7.783364 V 34.644925 L 58.77133,16.983185 V 29.41123 l -17.063745,9.885661 v 24.930725 l 4.2809,2.952292 23.369631,-13.568557 V 66.076535 L 36.851403,84.752459 46.145345,90.202381 78.726829,71.481676 V 37.351127 L 51.076307,53.410039 V 44.679826 L 68.140056,34.793808 V 11.563112 Z" />
          </svg>
        </div>
        </td>
        <td>
          <div class="info-wrapper">
            <div>Client: ${projectInfo.client}</div>
            <div>Job: ${projectInfo.projectName}</div>
            <div>Design by: ${projectInfo.designer}</div>
          </div>
        </td>
        <td>
          <div class="info-wrapper">
            <div>Sheet No: </div>
            <div>Job No: ${projectInfo.projectNo}</div>
            <div>Date: ${formattedDate}</div>
          </div>
        </td>
      </tr>
    </table>

    ${tabs.map(tab => `
      <div class="tab-block">
      <h2>${tab.title}</h2>
      <p><strong>Location:</strong> ${tab.levelAndLocation} | <strong>Direction:</strong> ${tab.direction} | <strong>Floor Type:</strong> ${tab.floorType}</p>
      <p><strong>Summary:</strong></p>
      <table class="summary-table">
        <thead>
          <tr><th></th><th>Wind</th><th>EQ</th></tr>
        </thead>
        <tbody>
          <tr><td>Total Demand</td><td>${tab.demandWind}</td><td>${tab.demandEQ}</td></tr>
          <tr><td>Total Achieved</td><td>${tab.tabSummary.achievedWind}</td><td>${tab.tabSummary.achievedEQ}</td></tr>
          <tr><td>Rate</td><td class="${tab.tabSummary.windRate >= 100 ? 'result-pass' : 'result-fail'}">${tab.tabSummary.windRate.toFixed(1)}%</td><td class="${tab.tabSummary.eqRate >= 100 ? 'result-pass' : 'result-fail'}">${tab.tabSummary.eqRate.toFixed(1)}%</td></tr>
        </tbody>
      </table>

      ${tab.processedLines.map(line => `
        <h3>Bracing Line ${line.bracinglineNo}:</h3>
        <p><strong>External Wall Length:</strong> ${line.externalWallLength} m</p>

        <table>
          <thead>
            <tr>
              <th>Label</th><th>Sys.</th><th>Type</th><th>Length(m) /No.</th><th>Height (m)</th>
              <th>BUs/m Wind</th><th>BUs/m EQ</th><th>Total Wind</th><th>Total EQ</th>
            </tr>
          </thead>
          <tbody>
            ${line.displayRows.map(row => `
              <tr>
                <td>${row.label}</td>
                <td>${row.system}</td>
                <td>${row.type}</td>
                <td>${row.lengthOrCount}</td><td>${row.height}</td>
                <td>${row.windRating}</td><td>${row.eqRating}</td>
                <td>${row.totalWind}</td><td>${row.totalEQ}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <table class="line-summary">
          <thead>
            <tr><th></th><th>Wind</th><th>EQ</th></tr>
          </thead>
          <tbody>
            <tr><td>Min Demand</td><td>${line.lineSummary.minDemandWind}</td><td>${line.lineSummary.minDemandEQ}</td></tr>
            <tr><td>Total for Line</td><td>${line.lineSummary.lineTotalWind}</td><td>${line.lineSummary.lineTotalEQ}</td></tr>
            <tr><td>Result</td><td class="${line.lineSummary.isWindOk ? 'result-pass' : 'result-fail'}">${line.lineSummary.isWindOk ? 'OK' : 'NG'}</td><td class="${line.lineSummary.isWindOk ? 'result-pass' : 'result-fail'}">${line.lineSummary.isEqOk ? 'OK' : 'NG'}</td></tr>
          </tbody>
        </table>
      </div>
      `).join('')}
    `).join('')}

  </body>
  </html>
    `;

    return html;
}