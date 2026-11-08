# The Sun — SolarGrid LK (Central Operations Platform)

An Integrated IoT and AI-Based Management System for Utility-Scale and Distributed Solar Power in Sri Lanka.

## Architecture

- **Backend**: Node.js, Express.js 5, TypeScript, Prisma ORM, Socket.IO, Zod validation, JWT authentication with RBAC.
- **Frontend**: Vite, TypeScript SPA with 17 operational views.
- **Database**: PostgreSQL with TimescaleDB time-series compatibility.
- **Power Flow Engine**: Python `pandapower` radial feeder simulation bridge.

---

## 18 Backend Feature Modules & API Endpoints

| View / Feature | Backend Route | Key Capabilities |
|---|---|---|
| **Auth** | `/api/auth` | JWT Register, Login, Refresh, Logout, Profile |
| **Users** | `/api/users` | User CRUD, Role assignment, Site Scopes |
| **Security & Audit** | `/api/security` | Audit logs, Session management, Security metrics |
| **Solar Sites** | `/api/sites` | 5 Commissioned reference plants, fleet summary, site stats |
| **Measurements** | `/api/measurements` | Real-time telemetry ingestion, bulk ingest, aggregation |
| **Grid Management** | `/api/grid` | Feeder digital twin, power-flow runner, constraint detection |
| **Battery Storage** | `/api/batteries` | BESS fleet tracking, charge/discharge schedules, peak-shaving |
| **Control Engine** | `/api/controls` | AI-assisted decisions, safety interlock checks, operator authorization |
| **Forecasting** | `/api/forecast` | Generation, load, irradiance forecasts, XGBoost/LSTM accuracy |
| **IoT & Devices** | `/api/iot` | Gateways, meters, heartbeats, packet delivery metrics |
| **Simulation** | `/api/simulation` | Power-flow scenarios, Monte Carlo placement, baselines |
| **Alerts & Events** | `/api/alerts` | Critical/warning/info alarms, acknowledgement, resolution |
| **Analytics** | `/api/analytics` | Energy yield, CO₂ avoided, tariff revenue, performance KPIs |
| **AI Intelligence** | `/api/ai` | Model registry, anomaly detection, recommendations |
| **Reports** | `/api/reports` | Regulatory compliance packs (CEB/LECO), PDF/CSV generation |
| **Integrations** | `/api/integrations` | REST, MQTT, Modbus TCP connections, health checks, sync |
| **Residential Solar** | `/api/residential` | Net Metering, Net Accounting, Net Plus, billing energy credits |
| **Notifications** | `/api/notifications` | Real-time push, unread badges, mark as read |

---

## Getting Started

### 1. Start the Database (Docker)
```bash
cd backend
docker compose up -d
```

### 2. Generate Prisma Client & Migrate
```bash
cd backend
npm run prisma:generate
# When database is running:
npx prisma db push
npm run seed
```

### 3. Run Backend Development Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
# Health check: http://localhost:3001/api/health
```

### 4. Run Frontend Development Server
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## Default Seeded Accounts

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@thesun.lk` | `SolarAdmin2024!` |
| **Operator** | `operator@thesun.lk` | `SolarAdmin2024!` |
| **Engineer** | `engineer@thesun.lk` | `SolarAdmin2024!` |
| **Read Only** | `viewer@thesun.lk` | `SolarAdmin2024!` |
