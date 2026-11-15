# SiteSense Mobile Demo

A standalone Expo / React Native mobile demo for the Caterpillar operator-assistant hackathon concept.

This build implements the **two mobile roles requested for the demo**:

- **Operator** — machine-specific login, AI-style briefing, machine health, live simulated telemetry, assigned tasks, complaints/issues, SOS, learning hub, safety pulse and task progress.
- **Supervisor** — site summary, fleet health, task assignment, operator reports, safety alerts and analytics.

## Why this build matches the supplied blueprint

The included architecture document describes a shared mobile client for workers/operators/supervisors, a machine-health layer, task prediction and re-planning, SOS, training, analytics and a simulator-first hackathon approach. The app follows that direction but intentionally stays **standalone**: the supplied datasets are aggregated into local JSON and a small timer simulates live telemetry, so the demo does not depend on a backend.

Implemented demo modules:
- Identity / role split
- Machine-specific operator login
- Machine health + behaviour/safety pulse
- Task assignment loop: Supervisor assigns → Operator sees it immediately
- Task-time prediction seeded from the provided 100k task dataset
- Safety alerts + operator issue reporting
- SOS demo
- Learning hub + Caterpillar YouTube link
- What-if safety simulation card
- Predictive maintenance indicator
- Fuel / carbon opportunity
- Professional line + bar analytics
- 2.5-second live telemetry simulation

## Dataset usage

Source files are preserved in `data/raw/`.

Generated app data in `src/data/demoData.json` is derived from:
- `machine_telemetry_dataset_100k.csv` — 100,000 rows, 100 machines, 100 operators
- `task_estimation_dataset_100k.csv` — 100,000 rows

Headline statistics in this build:
- Telemetry safety-alert rate: 12.8%
- Seatbelt-unfastened rate: 12.0%
- Average idling time: 27.4 min
- Average task estimate: 53.8 min
- Average actual task time: 64.9 min

`/scripts/build_data.py` shows how the machine summaries and task model cells are derived.

## Run on your laptop + Android phone

### Requirements
- Node.js **22.13+** (Expo SDK 57 requirement)
- npm
- Android phone with **Expo Go**
- Laptop and phone on the same network for easiest QR launch

### 1) Open in VS Code
Open this entire folder.

### 2) Install packages
```bash
npm install
```

If Expo asks to align package versions, run:
```bash
npx expo install --fix
```

### 3) Start
```bash
npx expo start
```

Expo Go on current SDK 57 may require you to sign in to Expo in both the terminal and phone app. If asked:
```bash
npx expo login
```

### 4) Run on phone
- Open Expo Go.
- Scan the QR code shown by the terminal/browser.
- If LAN discovery is blocked, try:
```bash
npx expo start --tunnel
```

## Best demo path

1. Login as **Operator**, machine `EXC003`.
2. Show the briefing, live machine telemetry and safety pulse.
3. Open **Tasks**.
4. Exit and login as **Supervisor**.
5. Go to **Assign**, choose `EXC003`, adjust task/weather, and assign.
6. Exit and login as **Operator** `EXC003` again — the new task is present because the state is shared in the running demo.
7. Submit a machine issue in **Report**.
8. Return as **Supervisor** → **Alerts** and resolve it.
9. Show **Analytics** and the Learning Hub.

> Demo state is in-memory by design and resets when the app process reloads.

## Important implementation note

The architecture PDF proposes a production backend (REST/WebSocket, event bus, Postgres/PostGIS/TimescaleDB, Python intelligence services, simulator, etc.). This deliverable is deliberately the **mobile hackathon demo layer**, not the entire production backend. That keeps it runnable from one zip while still presenting the workflow and analytics convincingly.

## No personal name included

No user/team member name is embedded in the UI, package metadata, or documentation.
