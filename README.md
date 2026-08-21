# Mediqora HMS & Multi-Hospital SaaS Platform

Mediqora is a hospital management system (HMS) and multi-tenant SaaS platform built for hospitals, polyclinics, and OPD centers.

---

## 🏥 Project Architecture

```
mediqora-hms/
├── KKRClinic/          # RRK Clinic Client OPD & Hospital Portal (domain.com/rrk/)
├── mediqora/           # Mediqora Master Super Admin Suite (domain.com/hms/)
├── backend/            # Express Node.js & MySQL REST API Server (domain.com/api/)
├── render.yaml         # Render Cloud Deployment Blueprint
├── .htaccess           # Production Apache Subpath & Proxy Rules
└── server.js           # Root Server Entrypoint for Cloud Hosting
```

---

## 🚀 Live Production Deployment Paths

| Portal | URL Path | Description |
| :--- | :--- | :--- |
| **RRK Clinic Portal** | `https://yourdomain.com/rrk` | Doctor Desks, Reception Queue, Pharmacy, Billing, Appointments |
| **Mediqora Super Admin** | `https://yourdomain.com/hms` | Hospital SaaS Controller, License Controls, Rates & Subscriptions |
| **Backend REST API** | `https://mediqora-hms.onrender.com/api` | Live Express.js & MySQL REST API |

---

## 🔐 Default Staff & Admin Credentials

### 1. Mediqora Super Admin HMS (`/hms`)
- **Email**: `info@mediqora.in`
- **Password**: `superadmin123`
- **Role**: Master Super Admin

### 2. RRK Clinic Staff Portal (`/rrk`)
- **Administrator**: `admin@rrkclinic.com` / `admin123`
- **Senior Doctor**: `dr.rajan@rrkclinic.com` / `doctor123`
- **Pediatric Specialist**: `dr.anitha@rrkclinic.com` / `doctor123`
- **Receptionist**: `receptionist@rrkclinic.com` / `reception123`

---

## 🛠️ Local Development

### 1. Backend Server
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5000
```

### 2. Mediqora Super Admin Portal
```bash
cd mediqora
npm install
npm run dev
# Running on http://localhost:3000
```

### 3. RRK Clinic Client Portal
```bash
cd KKRClinic
npm install
npm run dev
# Running on http://localhost:3001
```

---

## 📄 License
Mediqora HMS © 2026. Designed & Developed by Medgrow Marketing Agency. All rights reserved.
