# Impetus — OTB Planning Tool

A React-based interactive prototype for **Open-To-Buy (OTB) Planning**, built for retail and fashion brand merchandising teams. The tool enables merchandisers to plan, review, and approve weekly buy budgets through a structured maker-checker-approver workflow.

## Overview

OTB (Open-To-Buy) is the amount of inventory a retailer can purchase during a given period while staying within budget. This tool provides a collaborative planning interface where teams can:

- Create and manage OTB versions for different planning horizons
- Edit projected inventory and sales targets with auto-calculated dependent KPIs
- Route OTBs through a multi-stage approval workflow
- Add contextual remarks on individual data cells for collaboration

## Application Flow

```
Login → Brand Selection → Dashboard (OTB Planning)
```

### 1. Authentication
Users log in with their credentials and select a brand (e.g., Netplay, Azorte) to scope all subsequent data and operations.

### 2. OTB Snapshot View
A tabbed dashboard organizes OTB versions by lifecycle stage:

| Tab        | Description                                      |
|------------|--------------------------------------------------|
| Creation   | OTBs being drafted by Makers                     |
| Review     | OTBs submitted for Checker review                |
| Approval   | OTBs pending final Approver sign-off             |
| Completed  | Approved and finalized OTBs                      |
| Expired    | OTBs past their validity period                  |

### 3. OTB Detailed View
A weekly KPI data table with **13 columns** (W19–W31) split into:

- **Actual** (10 weeks) — historical, read-only data
- **Projected** (3 weeks) — future estimates, editable by Makers

## Key Features

### Role-Based Access Control

| Role     | Permissions                                                        |
|----------|--------------------------------------------------------------------|
| Maker    | Create OTBs, edit projected values, submit for review              |
| Checker  | Review OTBs, approve or request changes, forward to Approver      |
| Approver | Final approval of OTBs                                             |

### Tracked KPIs

The data table tracks the following metrics across weekly columns:

- **Net Sales** — AOP (Annual Operating Plan), Current Year, Last Year, Achievement vs AOP, Change vs LY
- **MRP** — AOP, Current Year, Last Year
- **COGS** — Cost of Goods Sold (AOP and CY)
- **Inventory** — Opening Inventory, Closing Inventory, Target Cover (Weeks), Target Inventory
- **Additional Inwards** — Extra incoming stock
- **OTB Units** — Calculated open-to-buy in units
- **OTB COGS** — Calculated open-to-buy in cost value

### Inline Editing with Review Mode

When a Maker edits **Target Cover** or **Additional Inwards** in a projected column:

1. The input is validated (range and sanity checks)
2. Dependent KPIs are auto-recalculated (Target Inventory, OTB Units, OTB COGS)
3. A review panel displays a side-by-side diff of old vs. new values
4. The user can **Accept** or **Discard** the change

### Approval Workflow

```
         Maker                Checker                Approver
           |                    |                       |
   Create / Edit OTB            |                       |
           |                    |                       |
   Send for Review  ──────►  Review OTB                 |
           |                    |                       |
           |              Approve ──────►  Send for Approval
           |                    |                       |
           |              Request Change                |
           |                    |                  Approve OTB
     ◄─────────────────────     |                       |
   Revise & Resubmit            |                  ──► Completed
```

### Comment / Remarks System

- **Right-click any cell** to add a remark via context menu
- Comments are stored per-OTB, grouped by cell
- A **side pane** displays all remarks in collapsible cell-grouped sections
- Users can edit or delete their own comments
- Cells with remarks show a visual indicator

### Additional Capabilities

- **Create New OTB** — modal form with Version Name, Hit, Drop, and Year fields
- **Save / Undo / Redo** — unsaved change tracking with navigation guards
- **Collapsible Sidebar** — navigation across modules (Purchasing, Analytics, Planning, etc.)
- **Brand Switcher** — switch between brands without re-authentication
- **Progress Stepper** — visual indicator of OTB lifecycle stage

## Tech Stack

| Technology   | Purpose               |
|--------------|-----------------------|
| React        | UI framework          |
| TypeScript   | Type safety (TSX)     |
| Tailwind CSS | Utility-first styling |
| Lucide React | Icon library          |

## Project Structure

```
OTB_Prototype/
├── README.md
└── remixed-a276aa1f.tsx    # Single-file React prototype component
```

## Getting Started

This is a prototype component designed to be rendered inside a React application. To use it:

1. Ensure you have a React project with Tailwind CSS configured
2. Install the required dependency:
   ```bash
   npm install lucide-react
   ```
3. Import and render the component:
   ```tsx
   import ImpetusApp from './remixed-a276aa1f';

   function App() {
     return <ImpetusApp />;
   }
   ```

## Data Model (Prototype)

The prototype uses hardcoded sample data representing:

- **9 OTB versions** across various workflow statuses
- Weekly financial data spanning **Jul 2025 – Sep 2025**
- Financial values in **INR** (Indian Rupees)
- Sample users: Sourav Nayak, Test User, Chinta Anusha

## License

Internal prototype — not for public distribution.
