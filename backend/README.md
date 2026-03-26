## Backend (Express + Supabase)

### Setup

- **Install**:
  - `cd backend`
  - `npm install`
- **Configure env**:
  - Copy `env.example.txt` to `.env`
  - Fill `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- **Run**:
  - `npm run dev`

Backend runs at `http://localhost:4000`.

### Health

- `GET /health` → `{ ok: true }`

### API (high level)

- **Auth**:
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
- **Profile**:
  - `GET /api/profile/me`
  - `PATCH /api/profile/me`
- **Subscriptions (mock Stripe)**:
  - `GET /api/subscriptions/me`
  - `PUT /api/subscriptions/me`
- **Scores** (stores only last 5 per user):
  - `GET /api/scores/me`
  - `POST /api/scores/me`
- **Charities**:
  - `GET /api/charities`
  - `GET /api/charities/me`
  - `PUT /api/charities/me`
  - Admin: `POST /api/charities`, `PATCH /api/charities/:id`, `DELETE /api/charities/:id`
- **Draws**:
  - `GET /api/draws`
  - `GET /api/draws/current?month=YYYY-MM`
  - Admin: `POST /api/draws`
- **Winners / verification**:
  - `GET /api/winners/:drawId/match`
  - `POST /api/winners/:drawId/claim`
  - `POST /api/winners/:drawId/proof`
  - Admin: `PATCH /api/winners/:id/status`
- **Admin**:
  - `GET /api/admin/users`
  - `GET /api/admin/winners`

### Supabase schema

Apply `supabase/schema.sql` in Supabase SQL editor.

