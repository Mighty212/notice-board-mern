# College Notice Board Management System (MERN Stack)

A secured, full-stack campus communication platform developed for **Advance Web Development (AWD)** 

---

## 🌟 Key Features

- **Modern Dark-Mode UI:** Replicates the clean Laravel dark aesthetic (`#18191a`) with a 250px fixed navigation sidebar and responsive layout.
- **Dedicated Welcome Landing Page (`/`):** Features institution branding, feature highlights, and strict authentication boundaries (notices hidden from unauthenticated guests).
- **Role-Based Access Control (RBAC):**
  - **Admin:** Full moderation dashboard, notice approval/rejection workflows, and category analytics.
  - **Faculty:** Create, manage, edit, and submit campus notices with attachments for moderation.
  - **Student:** Filterable notice feed by category (Academics, Examinations, Placements, Events) with search and attachment preview/download.
- **Real-Time Updates:** Live event broadcasts powered by **Socket.IO**.
- **Automated Notice Expiry:** Background logic cleanses expired circulars when their target date passes.

---

## 🛡️ AWD Task 3 Security Implementations

1. **Helmet.js (`server.js`):** Configures HTTP security headers including `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and cross-origin resource isolation.
2. **bcryptjs (`models/User.js`):** Industry-standard salted cryptographic hashing (10 salt rounds) for user credentials.
3. **Joi Schema Validation (`middleware/validator.js`):** Strict payload boundary validation on all authentication (`/api/auth/register`, `/api/auth/login`) and notice submission (`/api/notices`) endpoints to mitigate injection and malformed inputs.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running on `mongodb://localhost:27017`

### 1. Backend Server Setup
```bash
cd server
npm install
npm run seed     # (Optional) Pre-populates sample categories and demo users
node server.js   # Starts backend on http://localhost:5000
```

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Viva Demo Credentials

Use the **1-Click Viva Demo Buttons** on the `/login` screen, or log in with:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@college.edu` | `admin123` | System oversight & Notice moderation |
| **Faculty** | `faculty@college.edu` | `faculty123` | Create & manage department circulars |
| **Student** | `student@college.edu` | `student123` | View & download campus notices |

---

## 📁 Project Architecture

```
notice-board-mern/
├── client/                     # React.js Frontend (Vite)
│   ├── public/                 # Static assets (favicon.svg)
│   ├── src/
│   │   ├── components/         # Reusable UI (Sidebar, NoticeModal, ProtectedRoute)
│   │   ├── context/            # AuthContext (JWT state & user session)
│   │   ├── pages/              # Landing, Home, Login, Register, Admin, Faculty
│   │   ├── services/           # Axios API client & Socket.IO client
│   │   ├── App.jsx             # React Router routing & layout wrapper
│   │   └── main.jsx            # React root mount
│   ├── index.html              # HTML5 entry with Bootstrap 5 & Inter font
│   └── package.json
│
├── server/                     # Node.js + Express.js REST API
│   ├── config/                 # MongoDB Mongoose connection
│   ├── controllers/            # Auth, Notices, Categories, Admin logic
│   ├── middleware/             # JWT auth, Multer upload, Joi validator
│   ├── models/                 # Mongoose schemas (User, Notice, Category)
│   ├── routes/                 # Express API route definitions
│   ├── uploads/                # Notice attachment files
│   ├── seed.js                 # Database seeding script
│   ├── server.js               # Express app entry with Helmet & Socket.IO
│   ├── .env                    # Environment configuration
│   └── package.json
│
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```
