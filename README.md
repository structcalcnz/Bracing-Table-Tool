
# User Manual and Technical Specification
## Bracing Table Tool (As per NZS 3604)
(Version: 1.0)

Design Standard: NZS 3604

---

### 1. Development Environment

*   **Framework:** React V18+
*   **Build Tool:** Vite
*   **Language:** Typescript
*   **Compatibility:** Optimized for modern browsers including Chrome, Firefox, Edge, and Safari

### 2. Project Setup

- Click the Menu button (☰) in the top-left corner to open the sidebar.
- Enter project details such as:
  1.  Rroject name (address or title)
  2.  Project number (job number)
  3.  Client
  4.  Designer
  5.  Date
  6.  Note (optional)

The project information will be saved with the exported data and included in the PDF report.

### 3. Section Management
- Use the ➕ button to add a new section (tab).
- Use the ❌ button to delete a section.
- For each section:
- Fill in section metadata in the top-left block (e.g., location, floor type).
- Configure bracing lines in the Bracing Line Block

**Input info & Total Bracing Demands for Sections**

- In the **Demand Input** section, enter:
  - Total Wind Demand (BUs)
  - Total Earthquake Demand (BUs)
- These values can be derived from NZS 3604 or NZS 1170.5 calculations.
- In the **Section Info** section at top left of the screen, input:
  - Level or location for the bracing section
  - direction of bracing (e.g., N-S, E-W, Cross or Along)
  - Floor type: timber or concrete

### 4. Bracing Line Configuration
- Use ➕ or 🗑️ to add/remove bracing lines (minmum 2 lines required for each section).
- For each bracing line:
- Input the label and the external wall length.
- Add bracing elements (rows in the table) using ➕ or 🗑️.
- Select bracing system and type to auto-populate bracing rate.
🔄 Bracing Rate Lookup
- Choose from predefined systems or use custom entries:
- Common 1: 100 BUs/m — rate based on length (height-sensitive)
- Common 2: 100 BUs/unit — rate based on number (height-insensitive)

### 5. Compliance Check

* **Minimum Bracing Line Demand** 

  Each bracing line must satisfy the greater of:
  - 50% of the average total demand of lines in the section
  - 100 BUs
  - 15 BUs × external wall length

* **Bracing Rate Limits**
  - **Length-based systems:**
    - Max 120 BUs/m on timber floors
    - Max 150 BUs/m on concrete floors
    - These limits reflect connection capacity studie
  - **Number-based systems:**
    - No upper limit, but **connections must be specifically engineered (SED)**

  **Height Sensitivity**
    - Bracing rates based on length are affected by wall height.
    - Bracing rates based on number are not height-dependent.

### 5. Export Report

Use the Menu button (☰) in the top-left corner to open the sidebar, then click "Export Report" to create a report and print it to PDF.

**Notes**
- All calculations are rounded to nearest whole BUs for clarity.
- Reports can be exported or printed for council submission or internal QA.
- Tool is designed to support NZS 3604:2011 and aligns with common practice in residential timber-framed construction.

The current version does not allow "Custom bracing" and "Export Data". New version release notice will be published on [StructCalcNZ Google Site.](https://sites.google.com/view/nzsc-team/tools-articles?)

### 7. Bracing Rate Table
| Bracing System |  Type  | Notes |
|----------------|--------|-------|
| Gib Bracing |  -- | |
| James Hardie |  -- | |
| Ecoply |  -- | |
| PlyTech |  -- | |
| Existing Assessment |  -- |Standard sheet lining* |
| Subfloor |  -- | As per NZS3604|

Note: 
* The bracing rate table is for reference only. Actual rates may vary based on specific conditions and the manufacturer release version.
* For the existing assessment, the bracing rate is based on the standard sheet lining as per BRANZ Study Report 305.

**Important Notice:**
This tool is for preliminary design only. All bracing designs must be reviewed and approved by an authorized architect or structural engineer or supplier prior to construction.

**Reporting a Bug / Request for Protected Sheets Password**
If you encounter any issues or bugs with the tools or spreadsheet, please follow these steps:

**To Report a Bug:**
Email us with a detailed description of the issue, including any error messages encountered, steps to reproduce the problem, and your Excel version.
Contact Email: structcalcnz@gmail.com

### Copyright and Disclaimer

© 2025 StructCalcNZ. All rights reserved.

This web app is provided as a design aid for timber lintel design. You are free to use and distribute this app for non-commercial and commercial purposes.

**Modification of the underlying code, macros, or any internal functionality of this app without permit is strictly prohibited.**

This tool is not a substitute for construction purpose without professional engineering judgment. The user assumes full responsibility for all design work and the accuracy of inputs and results. All designs must be reviewed and approved by an authorized structural engineer or timber supplier prior to construction.

For full licensing details, limitations, and warranty disclaimers, please refer to the [LICENSE](/LICENSE.txt) file in this repository.

For any queries regarding usage or distribution, or to report a bug, please contact: structcalcnz@gmail.com