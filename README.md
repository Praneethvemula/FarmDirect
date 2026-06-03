# 🌱 FarmDirect — Direct Agricultural Marketplace

FarmDirect connects **farmers** directly with **consumers** for fair, transparent agricultural trade. Built with React + Vite (frontend) and Node/Express + MySQL (backend).

---

## 📁 Project Structure

```
farrm direct/
├── backend/                  # Node.js / Express REST API
│   ├── config/
│   │   └── database.js       # Sequelize + MySQL connection
│   ├── middleware/
│   │   └── auth.js           # JWT protect & authorize middleware
│   ├── models/               # Sequelize models (User, Product, Order…)
│   ├── routes/               # Express route handlers
│   │   ├── auth.js
│   │   ├── farmer.js
│   │   ├── consumer.js
│   │   └── admin.js
│   ├── index.js              # Server entry point
│   ├── seed-admin.js         # Seed default admin user
│   ├── seed-products.js      # Seed sample products
│   ├── .env.example          # ← copy to .env and fill values
│   └── package.json
│
├── frontend/                 # React 19 + Vite app
│   ├── src/
│   │   ├── components/       # Sidebar
│   │   ├── context/          # AuthContext (JWT state)
│   │   ├── pages/            # LandingPage, FarmerDashboard, etc.
│   │   └── utils/
│   │       └── api.js        # Axios instance with auth interceptor
│   ├── index.html
│   ├── vite.config.js        # Dev proxy: /api → localhost:5000
│   ├── vercel.json           # Vercel deploy config (SPA rewrites)
│   ├── .env.example          # ← copy to .env and fill values
│   └── package.json
│
├── render.yaml               # Render.com deploy config (backend)
├── .gitignore
└── README.md
```

---

## 🚀 Local Development

### Prerequisites
- Node.js **≥ 18**
- MySQL **8+** running locally

### 1 — Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/farrm-direct.git
cd farrm-direct

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2 — Configure environment

**Backend** — copy and edit:
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret
```

**Frontend** — copy and edit:
```bash
cd frontend
cp .env.example .env
# Leave VITE_API_URL empty for local dev (Vite proxy handles it)
```

### 3 — Seed the database (first time only)

```bash
cd backend
npm run seed-admin      # creates admin@farmdirect.com / admin123
npm run seed-products   # populates sample products
```

### 4 — Run both servers

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

App is live at → **http://localhost:3000**

---

## ☁️ Deployment

### Backend → Render.com

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — click **Apply**
5. In **Environment** tab, set all `sync: false` variables:

| Variable | Value |
|---|---|
| `DB_HOST` | Your MySQL host |
| `DB_USER` | Your MySQL user |
| `DB_PASSWORD` | Your MySQL password |
| `DB_NAME` | `farmer_db` |
| `JWT_SECRET` | Long random string |
| `STRIPE_SECRET_KEY` | From Stripe dashboard |
| `RAZORPAY_KEY_ID` | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |
| `FRONTEND_URL` | *(set after Vercel deploy)* |

6. Deploy → copy the service URL (e.g. `https://farmdirect-api.onrender.com`)

---

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Set **Root Directory** → `frontend`
4. Add **Environment Variable**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://farmdirect-api.onrender.com` |

5. Deploy → copy the Vercel URL (e.g. `https://farmdirect.vercel.app`)
6. Go back to Render → set `FRONTEND_URL` = your Vercel URL → **Redeploy**

---

## 🔑 Default Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@farmdirect.com | admin123 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router 7, Axios |
| UI | Vanilla CSS, Lucide React, React Hot Toast |
| Backend | Node.js, Express 5 |
| Database | MySQL 8 + Sequelize ORM |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Payments | Stripe, Razorpay |
| Deploy (API) | Render.com |
| Deploy (UI) | Vercel |

---

## 📜 License

MIT © Praneeth Vemula
