# 🏆 CerVer - Certificate Management Dashboard

**A modern, responsive dashboard for certificate generation and verification system**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://cerver-frontend.vercel.app)
[![API Docs](https://img.shields.io/badge/API_Docs-Swagger-blue?style=for-the-badge&logo=swagger)](https://cerver-api-ehb0hnc4fvdnfkc0.eastasia-01.azurewebsites.net/swagger)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

---

## 📋 Overview

CerVer Frontend is a complete dashboard application for managing digital certificates. It provides separate interfaces for **Users** and **Administrators** with features including membership requests, certificate generation, and public verification.

**Live Demo:** [https://cerver-frontend.vercel.app](https://cerver-frontend.vercel.app)

---

## ✨ Features

### 👤 User Dashboard
| Feature | Description |
|---------|-------------|
| **Browse Memberships** | View all available membership tiers |
| **Request Membership** | Submit applications with document uploads |
| **Track Status** | Monitor request status (Pending/Approved/Rejected) |
| **Download Certificates** | Access PDF certificates anytime |
| **Certificate History** | View all issued certificates |

### 👑 Admin Dashboard
| Feature | Description |
|---------|-------------|
| **Analytics Overview** | Real-time statistics and charts |
| **Membership Management** | Create, edit, and delete membership types |
| **Request Approval** | Approve or reject membership requests |
| **Certificate Generation** | Generate PDF certificates with QR codes |
| **User Management** | View and manage platform users |

### 🔍 Public Features
| Feature | Description |
|---------|-------------|
| **Certificate Verification** | Anyone can verify certificates with QR codes |
| **Membership Catalog** | Browse available memberships without login |

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | React | 18.3 |
| **Build Tool** | Vite | 5.x |
| **Styling** | Tailwind CSS | 3.4 |
| **API Client** | Axios | 1.7 |
| **Routing** | React Router DOM | 6.x |
| **Authentication** | JWT + Context API | - |
| **Icons** | Heroicons | 2.x |
| **Notifications** | React Hot Toast | 2.x |

---
## 📁 Project Structure
cerver-frontend/
├── src/
│ ├── components/ # Reusable UI components
│ │ ├── Navbar.jsx # Navigation with hamburger menu
│ │ └── Footer.jsx # Footer with links
│ ├── pages/ # Page components
│ │ ├── LandingPage.jsx # Public landing page
│ │ ├── LoginPage.jsx # Authentication login
│ │ ├── RegisterPage.jsx # User registration
│ │ ├── UserDashboard.jsx # User dashboard
│ │ ├── AdminDashboard.jsx # Admin dashboard
│ │ ├── RequestFormPage.jsx # Membership application
│ │ └── VerifyCertificatePage.jsx # Public verification
│ ├── context/ # React Context
│ │ └── AuthContext.jsx # Authentication state
│ ├── services/ # API services
│ │ └── api.js # Axios configuration
│ ├── config/ # Configuration
│ │ └── api.js # API endpoints
│ ├── layouts/ # Layout components
│ │ └── MainLayout.jsx # Main layout wrapper
│ ├── App.jsx # Main app component
│ ├── main.jsx # Entry point
│ └── index.css # Tailwind styles
├── public/ # Static assets
├── .env # Environment variables
├── .env.development # Development environment
├── tailwind.config.js # Tailwind configuration
├── vite.config.js # Vite configuration
└── package.json # Dependencies

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.x or higher
- **npm** 9.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/web3doctuur-cloud/cerver-frontend.git

# Navigate to project directory
cd cerver-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev

Test Credentials
Role |	Email |	Password
Admin |	admin@cerver.com |	Admin@123
User:	Register your own account	Your choice

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: cerver-frontend
# - Framework preset: Vite
# - Build command: npm run build
# - Output directory: dist

---
 Testing the Application
**Test User Flow**
1) Register a new account at /register

2) Login at /login

3) Browse Memberships on the landing page

4) Apply for a membership with file upload

5) Check Dashboard to see request status

6) Admin Login to approve your request

7) Download Certificate from user dashboard

**Test Admin Flow**
1) Login with admin@cerver.com / Admin@123

2) View Pending Requests in admin dashboard

3) Approve a request (auto-generates certificate)

4) Create New Membership from admin panel

5) View Analytics dashboard
---
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database

    U->>F: Enter credentials
    F->>A: POST /api/Auth/login
    A->>D: Verify credentials
    D-->>A: User found
    A-->>F: JWT Token + Role
    F->>F: Store token in localStorage
    F->>F: Decode JWT for role
    F-->>U: Redirect to dashboard

👨‍💻 Author
Yusuf Rodiah Hadizah

Platform	Link
GitHub	@web3doctuur-cloud
Email	hadizahrodiah@gmail.com
