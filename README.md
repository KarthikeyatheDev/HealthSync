# HealthSync: Decentralized Multi-Task Federated Healthcare Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-EE4C2C.svg)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

> **"Your data stays with your hospital. Only model updates are shared."**

**HealthSync** is an enterprise-grade clinical AI platform designed for privacy-preserving collaborative learning across decentralized hospital networks. Built on MIMIC-IV clinical datasets, HealthSync trains a dual-head multi-task PyTorch neural network to simultaneously predict **Cardiovascular Disease (CVD)** and **Type 2 Diabetes** risk without centralizing sensitive Electronic Health Records (EHR).

---

## Key Capabilities

- **Decentralized Multi-Task Learning**: A shared clinical encoder ($12 \rightarrow 64 \rightarrow 32$) with dual linear output heads, trained with masked multi-task binary cross-entropy loss to handle non-IID, partially labeled hospital cohorts.
- **Privacy-Preserving Federated Aggregation**: Implements **Federated Averaging (`FedAvg`)** and **`FedProx`** with optional **Differential Privacy ($\epsilon$-DP)** using calibrated Gaussian noise injection and gradient clipping.
- **Explainable AI (XAI) Suite**:
  - **Integrated Gradients (Sundararajan et al., 2017)**: Axiomatically sound path attributions satisfying *Completeness* and *Implementation Invariance*.
  - **Waterfall Risk Decomposition**: Additively decomposes risk: $\text{Base Risk } F(x') + \sum_{i=1}^{12} \phi_i = \text{Predicted Risk } F(x)$.
  - **Counterfactual "What-If" Recourse**: Computes actionable target interventions on modifiable biomarkers (e.g., target BP $< 120\text{ mmHg}$, HbA1c $< 5.7\%$) to lower patients into safe risk categories.
  - **Global Biomarker Importance**: Dual-head rankings showing how the shared encoder routes metabolic vs. hemodynamic biomarkers.
- **Real-Time Telemetry & SSE Streaming**: Server-Sent Events (`EventSource`) stream live training epochs, client gradient updates, aggregation consensus, and held-out validation metrics directly to the interactive dashboard.

---

## 12 MIMIC-IV Clinical Biomarkers

| Biomarker | Feature Key | Category | Unit | Reference Range | Modifiable |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Patient Age** | `anchor_age` | Demographic | Years | 18 – 65 | No |
| **Gender** | `gender` | Demographic | M / F | 0 (M), 1 (F) | No |
| **Body Mass Index** | `bmi` | Metabolic | $\text{kg/m}^2$ | 18.5 – 24.9 | **Yes** |
| **Systolic Blood Pressure** | `systolic_bp` | Hemodynamic | $\text{mmHg}$ | 90 – 120 | **Yes** |
| **Diastolic Blood Pressure** | `diastolic_bp` | Hemodynamic | $\text{mmHg}$ | 60 – 80 | **Yes** |
| **Fasting Plasma Glucose** | `glucose` | Metabolic | $\text{mg/dL}$ | 70 – 99 | **Yes** |
| **Hemoglobin A1c** | `hba1c` | Metabolic | $\%$ | 4.0 – 5.6 | **Yes** |
| **LDL Cholesterol** | `ldl` | Lipid Profile | $\text{mg/dL}$ | $< 100$ | **Yes** |
| **HDL Cholesterol** | `hdl` | Lipid Profile | $\text{mg/dL}$ | $> 50$ | **Yes** |
| **Serum Triglycerides** | `triglycerides` | Lipid Profile | $\text{mg/dL}$ | $< 150$ | **Yes** |
| **Serum Creatinine** | `creatinine` | Renal Function | $\text{mg/dL}$ | 0.7 – 1.2 | No |
| **Serum Potassium** | `potassium` | Electrolytes | $\text{mEq/L}$ | 3.5 – 5.0 | **Yes** |

---

## System Architecture

```
[ Hospital North ]   ──(Local Gradients + DP)──┐
[ Hospital Central ] ──(Local Gradients + DP)──┼──> [ Federated Server (FedAvg) ] ──> Global Consensus Model
[ Hospital South ]   ──(Local Gradients + DP)──┘              │
                                                              ▼
                                                   [ FastAPI Backend ]
                                                              │ (SSE + REST)
                                                              ▼
                                                   [ React 18 Dashboard ]
                                             (Performance, Topology, XAI Recourse)
```

---

## Repository Structure

```
HealthSync/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application & middleware configuration
│   │   ├── config.py            # Feature columns, clinical baselines & hospital metadata
│   │   ├── state.py             # Global round lifecycle & SSE event broadcaster
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── ml/
│   │   │   ├── model.py         # PyTorch MultiTaskModel (shared encoder + dual heads)
│   │   │   ├── fl_orchestrator.py # Multi-hospital training loop & FedAvg/FedProx aggregation
│   │   │   ├── preprocessing.py # Clinical range validation & StandardScaler z-scoring
│   │   │   ├── dataset_loader.py# Multi-hospital CSV dataset ingestion
│   │   │   └── xai.py           # Integrated Gradients & Counterfactual Recourse engine
│   │   └── routers/
│   │       ├── dashboard.py     # Live telemetry & KPI overview
│   │       ├── rounds.py        # Federated round execution & reset
│   │       ├── xai.py           # Patient attributions, global rankings & presets
│   │       ├── predict.py       # Dual-head simultaneous inference
│   │       ├── settings.py      # Learning rate, batch size & DP configuration
│   │       ├── sites.py         # Hospital node status & record distributions
│   │       └── events.py        # Real-time SSE streaming endpoint
│   ├── generate_datasets.py     # Synthetic hospital splits generator (Cell 69 profile)
│   ├── requirements.txt         # Backend Python dependencies
│   └── run.py                   # Uvicorn backend launcher (http://127.0.0.1:8000)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Views/
│   │   │   │   ├── PerformanceView.tsx # Held-out test evaluation, confusion matrix & baseline gain
│   │   │   │   ├── PerformanceXAI.tsx  # Interactive Waterfall, Global rankings & Recourse
│   │   │   │   ├── RoundsView.tsx      # Round history & site participation tables
│   │   │   │   ├── HospitalsView.tsx   # Hospital node directory & telemetry
│   │   │   │   ├── SettingsView.tsx    # Hyperparameter tuning & DP toggles
│   │   │   │   └── LogsView.tsx        # Structured audit trail
│   │   │   ├── Dashboard.tsx    # Operational control hub & Live Round launcher
│   │   │   ├── FederatedFlow.tsx# Network topology diagram
│   │   │   ├── KPIOverview.tsx  # High-level network metrics
│   │   │   ├── LiveProgress.tsx # Real-time client aggregation steps
│   │   │   └── Sidebar.tsx      # Clinical navigation
│   │   ├── lib/api.ts           # Type-safe API client & EventSource SSE subscriber
│   │   └── types/index.ts       # Shared TypeScript clinical schemas
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Python**: Version 3.10 or higher
- **Node.js**: Version 18.0 or higher
- **npm**: Version 9.0 or higher

---

### Step 1: Backend Setup

1. Open a terminal in the project root:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. *(Optional)* Generate or prepare hospital client datasets:
   ```bash
   python generate_datasets.py
   ```

5. Launch the FastAPI server:
   ```bash
   python run.py
   ```
   The backend API will be live at `http://127.0.0.1:8000`. You can explore interactive Swagger documentation at `http://127.0.0.1:8000/docs`.

---

### Step 2: Frontend Setup

1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev:ui
   ```

4. Open your browser at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard?task={task}` | Returns network KPI status, client states, and global model metrics |
| `POST` | `/api/rounds` | Initiates a new federated training round across hospital clients |
| `POST` | `/api/rounds/reset` | Resets rounds history and weights back to clean `v1.0.0` baseline |
| `GET` | `/api/rounds` | Lists all completed training rounds and held-out test evaluations |
| `POST` | `/api/predict` | Runs dual-head inference for a patient clinical feature vector |
| `GET` | `/api/xai/global?task={task}` | Retrieves global biomarker importance rankings for the selected head |
| `POST` | `/api/xai/explain` | Computes Integrated Gradients attributions and counterfactual recourse |
| `GET` | `/api/xai/presets` | Supplies archetypal patient profiles for interactive exploration |
| `GET` | `/api/events/stream` | Server-Sent Events (SSE) stream for real-time progress broadcast |

---

## Research & Clinical Disclaimer

> **Notice**: HealthSync is developed for academic research, algorithmic demonstration, and technical evaluation of federated multi-task learning and Explainable AI. It does not constitute a certified medical diagnostic device and should not be used as the sole basis for clinical diagnosis or treatment planning.
