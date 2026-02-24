# Impetus — OTB Planning Tool

A React prototype and FastAPI backend for **Open-To-Buy (OTB) Planning**, built for retail and fashion brand merchandising teams. The tool enables merchandisers to plan, review, and approve weekly buy budgets through a structured maker-checker-approver workflow.

## Overview

OTB (Open-To-Buy) is the amount of inventory a retailer can purchase during a given period while staying within budget. This tool provides a collaborative planning interface where teams can:

- Create and manage OTB versions for different planning horizons
- Edit projected inventory and sales targets with auto-calculated dependent KPIs
- Route OTBs through a multi-stage approval workflow
- Add contextual remarks on individual data cells for collaboration

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Backend  | FastAPI + SQLAlchemy + Alembic |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth     | JWT (python-jose + passlib)   |
| Frontend | React + TypeScript + Tailwind CSS (prototype) |

## Project Structure

```
OTB_Prototype/
├── app/
│   ├── main.py                 # FastAPI entry point
│   ├── config.py               # Settings (DB URL, JWT secret)
│   ├── database.py             # SQLAlchemy engine + session
│   ├── models/                 # ORM models (User, Brand, OTB, KPI, Comment)
│   ├── schemas/                # Pydantic request/response schemas
│   ├── routers/                # API route handlers
│   ├── services/               # Business logic layer
│   └── utils/
│       ├── security.py         # JWT + password hashing
│       ├── rbac.py             # Role-based access dependencies
│       └── calculations.py     # KPI auto-calculation engine
├── alembic/                    # Database migrations
├── seed.py                     # Sample data loader
├── requirements.txt
├── .env.example
└── remixed-a276aa1f.tsx        # React prototype (single-file)
```

## Quick Start

```bash
# 1. Clone and enter the project
git clone https://github.com/sourav9977/OTB_prototype.git
cd OTB_prototype

# 2. Create a virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Set up environment variables
cp .env.example .env

# 4. Run database migrations
alembic upgrade head

# 5. Seed the database with sample data
python seed.py

# 6. Start the server
uvicorn app.main:app --reload
```

The API will be available at **http://localhost:8000** and interactive docs at **http://localhost:8000/docs**.

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint  | Description                     |
|--------|-----------|---------------------------------|
| POST   | `/login`  | Authenticate, returns JWT token |
| GET    | `/me`     | Current user profile + roles    |
| GET    | `/brands` | Brands accessible to user       |

### OTB Management (`/api/otb`)

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/`                   | List OTBs (filter by status/project) |
| POST   | `/`                   | Create new OTB (Maker only)        |
| GET    | `/{otb_id}`           | Get OTB details                    |
| PATCH  | `/{otb_id}/status`    | Transition OTB status              |
| GET    | `/{otb_id}/history`   | Audit trail of status changes      |

### KPI Data (`/api/otb/{otb_id}/kpi`)

| Method | Endpoint      | Description                          |
|--------|---------------|--------------------------------------|
| GET    | `/`           | All KPI data (actual + projected)    |
| PATCH  | `/projected`  | Update projected values (Maker only) |
| POST   | `/review`     | Preview change impact without saving |

### Comments (`/api/otb/{otb_id}/comments`)

| Method | Endpoint          | Description            |
|--------|-------------------|------------------------|
| GET    | `/`               | List comments by cell  |
| POST   | `/`               | Add a comment          |
| PATCH  | `/{comment_id}`   | Edit own comment       |
| DELETE | `/{comment_id}`   | Delete own comment     |

## Role-Based Access Control

| Role     | Permissions                                              |
|----------|----------------------------------------------------------|
| Maker    | Create OTBs, edit projected KPIs, submit for review      |
| Checker  | Review OTBs, approve or request changes, forward to Approver |
| Approver | Final approval of OTBs                                   |

## Approval Workflow

```
in_progress ──[Maker]──► in_review ──[Checker]──► pending_approval ──[Approver]──► approved
                              │
                              └──[Checker]──► change_requested ──[Maker]──► in_review
```

## Sample Users (after seeding)

| Email               | Password      | Role (Netplay) |
|---------------------|---------------|----------------|
| sourav@fynd.team    | password123   | Maker          |
| testuser@fynd.team  | password123   | Checker        |
| anusha@fynd.team    | password123   | Approver       |

## KPI Calculation Engine

When editable KPIs change, dependent values are auto-recalculated:

- **Target Cover** change triggers: Target Inventory, OTB Units, OTB COGS
- **Additional Inwards** change triggers: OTB Units, OTB COGS

Formulas:
- `Target Inventory = Avg Weekly Sales × Target Cover`
- `OTB Units = Target Inventory - Closing Inventory + Expected Sales - Additional Inwards`
- `OTB COGS = OTB Units × Avg Cost Per Unit`

## License

Internal prototype — not for public distribution.
