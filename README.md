# 🌱 SmartSeason Field Monitoring System

> A full-stack web application for tracking crop progress across multiple fields during a growing season — built as a technical assessment demonstrating clean system design, core business logic, and a usable interface.

**Live Demo**
| Service | URL |
|---|---|
| Frontend | https://smart-season-field-monitoring-syste-chi.vercel.app |
| Backend API | https://smartseason-field-monitoring-system-anbl.onrender.com/api |

**Demo Credentials**
| Role | Username | Password |
|---|---|---|
| Admin / Coordinator | `allen` | `admin123` |
| Field Agent | `john_agent` | `agent123` |
| Field Agent | `mary_agent` | `agent123` |

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Design](#system-design)
- [Field Status Logic](#field-status-logic)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)

---

## Overview

SmartSeason helps agricultural coordinators and field agents collaboratively track the lifecycle of crop fields through four stages: **Planted → Growing → Ready → Harvested**.

The system supports two distinct roles with different levels of access:

- **Admin (Coordinator)** — creates fields, assigns agents, monitors all activity across the entire operation via a central dashboard.
- **Field Agent** — views only their assigned fields, posts stage updates and observations, tracks their own workload.

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | Django 5.2 + Django REST Framework 3.17 |
| Authentication | JWT via `djangorestframework-simplejwt` |
| Database | MySQL 8 (Railway) |
| CORS | `django-cors-headers` |
| Static Files | WhiteNoise |
| Server | Gunicorn |
| Hosting | Render |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v3 |
| HTTP Client | Axios (with JWT interceptor + auto-refresh) |
| Charts | Recharts |
| Routing | React Router v6 |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Hosting | Vercel |

---

## System Design

### Data Models

```
User (extends AbstractUser)
├── role: 'admin' | 'agent'
├── first_name, last_name
├── email, phone
└── is_staff (admin only)

Field
├── name, crop_type, location
├── planting_date, expected_harvest_date
├── current_stage: 'planted' | 'growing' | 'ready' | 'harvested'
├── size_hectares
├── assigned_agent → User (FK)
├── created_by → User (FK)
├── last_update_at (auto-updated on FieldUpdate save)
└── status (computed property — not stored)

FieldUpdate  [append-only audit log]
├── field → Field (FK)
├── agent → User (FK)
├── stage (the new stage being set)
├── notes / observations
└── created_at
```

### Key Design Choice — Stage Updates via Audit Log

Rather than directly editing `Field.current_stage`, agents post a `FieldUpdate` record. The `FieldUpdate.save()` method then propagates the new stage back to the parent `Field`:

```python
def save(self, *args, **kwargs):
    super().save(*args, **kwargs)
    self.field.current_stage = self.stage
    self.field.last_update_at = self.created_at
    self.field.save(update_fields=['current_stage', 'last_update_at'])
```

This means every stage change is fully auditable — you can reconstruct the complete history of any field.

### Authentication Flow

```
Client → POST /api/auth/login/ → { access, refresh, user }
         ↓
         Store tokens in localStorage
         ↓
         Axios interceptor attaches Bearer token to every request
         ↓
         On 401 → auto-refresh via /api/auth/refresh/
         ↓
         On refresh failure → clear storage → redirect to /login
```

---

## Field Status Logic

Each field exposes a computed `status` property (never persisted to the database) based on the following rules:

```python
@property
def status(self):
    today = timezone.now().date()
    days_since_planting = (today - self.planting_date).days

    # Rule 1: Harvested fields are always Completed
    if self.current_stage == 'harvested':
        return 'completed'

    # Rule 2: Fields stuck in early stages too long are At Risk
    if self.current_stage in ('planted', 'growing') and days_since_planting > 90:
        return 'at_risk'

    # Rule 3: No agent update in 14 days = At Risk (stale)
    if self.last_update_at:
        if (timezone.now() - self.last_update_at).days > 14:
            return 'at_risk'
    elif days_since_planting > 14:
        return 'at_risk'

    return 'active'
```

**Rationale:**
- **90-day rule** — a field still in `planted` or `growing` after 90 days without progressing signals a crop problem or data neglect.
- **14-day staleness rule** — agents should be checking in at least every two weeks. No update in that window means something may be wrong on the ground.
- These thresholds are conservative defaults and can be adjusted per operational requirements.

---

## Project Structure

```
SmartSeason/
├── server/                         # Django backend
│   ├── config/
│   │   ├── settings.py             # All configuration
│   │   ├── urls.py                 # Root URL routing
│   │   └── wsgi.py
│   ├── accounts/                   # User auth app
│   │   ├── models.py               # Custom User model
│   │   ├── serializers.py          # User + JWT serializers
│   │   ├── views.py                # Login, register, me, agents
│   │   └── urls.py
│   ├── fields/                     # Core business logic app
│   │   ├── models.py               # Field + FieldUpdate models
│   │   ├── serializers.py          # Field + FieldUpdate serializers
│   │   ├── views.py                # CRUD + Dashboard views
│   │   ├── permissions.py          # IsAdminUser, IsAdminOrReadOnly
│   │   └── urls.py
│   ├── seed.py                     # Database seeding script
│   ├── requirements.txt
│   └── manage.py
│
└── client/                         # React frontend
    ├── src/
    │   ├── api/
    │   │   ├── client.ts           # Axios instance + interceptors
    │   │   ├── auth.ts             # Auth API calls
    │   │   └── field.ts            # Fields + Dashboard API calls
    │   ├── context/
    │   │   └── auth-context.tsx    # Global auth state
    │   ├── components/
    │   │   ├── Layout.tsx          # Sidebar + top bar shell
    │   │   ├── ProtectedRoute.tsx  # Route guard
    │   │   ├── StatusBadge.tsx     # Status + Stage badge components
    │   │   └── FieldFormModal.tsx  # Create/edit field modal
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── DashboardPage.tsx
    │   │   ├── FieldsPage.tsx
    │   │   └── FieldDetailPage.tsx
    │   ├── types/
    │   │   └── index.ts            # TypeScript interfaces
    │   └── main.tsx
    ├── tailwind.config.js
    ├── vite.config.ts
    └── package.json
```

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login/` | ❌ | Obtain JWT access + refresh tokens |
| POST | `/api/auth/refresh/` | ❌ | Refresh access token |
| GET | `/api/auth/me/` | ✅ | Get current user profile |
| GET | `/api/auth/agents/` | ✅ Admin | List all field agents |

### Fields

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/fields/` | ✅ | List fields (filtered by role) |
| POST | `/api/fields/` | ✅ Admin | Create a new field |
| GET | `/api/fields/:id/` | ✅ | Get field detail |
| PATCH | `/api/fields/:id/` | ✅ | Update field metadata |
| DELETE | `/api/fields/:id/` | ✅ Admin | Delete a field |
| GET | `/api/fields/:id/updates/` | ✅ | List update history for a field |
| POST | `/api/fields/:id/updates/` | ✅ Agent | Post a stage update + notes |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/` | ✅ | Summary stats, recent updates, agent overview |

**Dashboard response shape:**
```json
{
  "total_fields": 5,
  "active_count": 3,
  "at_risk_count": 1,
  "completed_count": 1,
  "stage_breakdown": { "planted": 1, "growing": 2, "ready": 1, "harvested": 1 },
  "recent_updates": [ ...FieldUpdate objects ],
  "agent_summary": [
    { "agent_id": 1, "agent_name": "John Kamau", "total": 3, "at_risk": 1 }
  ]
}
```

---

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8+ (or use SQLite for dev — see below)

### Backend

```bash
cd server

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file
cp .env.example .env
# Fill in DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, SECRET_KEY

# Run migrations
python manage.py migrate

# Seed demo data
python seed.py

# Start server
python manage.py runserver
```

**Using SQLite instead of MySQL (quickest for local dev):**

In `settings.py`, comment out the MySQL block and uncomment:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Frontend

```bash
cd client

# Install dependencies
npm install

# Create env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

### Environment Variables

**Backend (`.env`)**
```
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=smartseason_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

**Frontend (`.env`)**
```
VITE_API_URL=http://localhost:8000/api
```

---

## Deployment

### Backend — Render

**Build Command:**
```bash
pip install -r requirements.txt && python manage.py migrate && python seed.py
```

**Start Command:**
```bash
gunicorn config.wsgi:application
```

**Environment Variables on Render:**
```
SECRET_KEY       = <random string>
DEBUG            = False
DB_HOST          = <railway public host>
DB_PORT          = <railway public port>
DB_NAME          = railway
DB_USER          = root
DB_PASSWORD      = <your password>
```

### Database — Railway MySQL

Railway provides a managed MySQL instance. Two hostname types exist:
- `mysql.railway.internal` — private, only works within Railway's network
- `shortline.proxy.rlwy.net` — **public**, use this when connecting from Render

The public port is **not 3306** — Railway assigns a random high port (e.g. `40054`). Always use the full public connection string from Railway's **Connect** tab.

### Frontend — Vercel

1. Import GitHub repo into Vercel
2. Set **Root Directory** to `client`
3. Add environment variable:
   ```
   VITE_API_URL = https://your-render-service.onrender.com/api
   ```
4. Deploy

**CORS note:** Vercel generates different URLs per deployment branch. The backend uses `CORS_ALLOWED_ORIGIN_REGEXES` to automatically allow all `*.vercel.app` origins:
```python
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://.*\.vercel\.app$',
]
```

---

## Design Decisions

### 1. Append-only update log
Stage changes are stored as `FieldUpdate` records rather than direct field edits. This gives a full audit trail — who changed what, when, and what they observed — which is critical for agricultural accountability.

### 2. Computed status (not stored)
Field `status` is a Python `@property` computed at read time, not a database column. This avoids stale data and ensures status always reflects the current state without needing background jobs or triggers.

### 3. Role-based queryset filtering
Rather than a single permission class, each view's `get_queryset()` method filters by role. Admins see all records; agents only see their assigned fields. This is enforced at the ORM level — agents cannot even query fields they don't own.

### 4. JWT over session auth
JWT is stateless and pairs naturally with a decoupled React frontend hosted on a different domain. The Axios interceptor handles silent token refresh transparently so users are never unexpectedly logged out mid-session.

### 5. Custom fetch client → Axios
The project initially used a custom `fetch` wrapper but was standardised on Axios for consistent response wrapping (`res.data`), automatic JSON serialisation, and the interceptor API for token refresh.

### 6. WhiteNoise for static files
Rather than setting up S3 or a CDN for the assessment, WhiteNoise serves static files directly from Django with compression. Suitable for this scale.

---

## Assumptions

1. A field is assigned to exactly one agent at a time (no multi-agent fields).
2. Both admins and agents can view a field's full update history, but only the assigned agent (or any admin) can post new updates.
3. The 90-day and 14-day "at risk" thresholds are reasonable defaults for a typical growing season. They are defined as constants in `fields/models.py` and can be adjusted.
4. No email verification is required for account registration — accounts are created by the admin coordinator.
5. The Django `/admin/` panel is available for superuser database management.
6. Password reset flows are out of scope for this assessment.

---

## Author

**Allen Shamrock**
Built as a Full Stack Developer Technical Assessment for SmartSeason.