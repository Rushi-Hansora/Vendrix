# Vendrix 🏗️

> **Procurement & Vendor Management ERP** — A cloud-native full-stack application that digitizes and streamlines end-to-end procurement workflows for organizations.


## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started (Local)](#getting-started-local)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [User Roles](#user-roles)
- [Deployment (AWS)](#deployment-aws)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)

---

## Overview

VendorBridge eliminates manual procurement inefficiencies by providing a centralized ERP platform where organizations can manage the complete procurement lifecycle:

**RFQ Creation → Vendor Quotations → Quotation Comparison → Approval Workflow → Purchase Orders → Invoice Generation & Delivery**

Built with a cloud-native architecture on AWS, every component from the React frontend to the Node.js API runs in a production-ready, scalable environment.

---

## Features

### Core Procurement Workflow
- **Vendor Management** — Register vendors with GST details, categories, contact info, and status tracking
- **RFQ Creation** — Create Requests for Quotation with line items, deadlines, and direct vendor assignment
- **Quotation Submission** — Vendors submit itemized quotations with pricing and delivery timelines
- **Quotation Comparison** — Side-by-side comparison table with lowest price highlighted automatically
- **Approval Workflow** — Multi-step approval with approve/reject actions, remarks, and status tracking
- **Purchase Orders** — Auto-generated PO numbers with 18% GST calculation and grand total
- **Invoice Generation** — PDF invoice generation, S3 storage, and one-click email delivery via AWS SES
- **Activity Logs** — Full audit trail of every procurement action with timestamps
- **Reports & Analytics** — Vendor performance metrics, spending summaries, and monthly trends

### Platform Features
- Role-based access control (Admin, Procurement Officer, Manager, Vendor)
- JWT authentication with 12-hour session tokens
- Real-time dashboard with pending approvals, active RFQs, recent POs
- File attachments for RFQs stored on AWS S3
- Consistent API response shape across all endpoints
- Input validation on all forms (frontend + backend)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | SPA with fast HMR |
| UI Library | Material UI v5 | ERP-grade components |
| State Management | Redux Toolkit | Predictable global state |
| Forms | React Hook Form | Performant validated forms |
| HTTP Client | Axios | JWT interceptors |
| Backend | Node.js + Express | REST API server |
| ORM | Prisma | Type-safe DB queries + migrations |
| Database | PostgreSQL | Relational ERP data |
| Auth | JWT + bcrypt | Stateless role-based auth |
| PDF Generation | Puppeteer | Server-side invoice PDFs |
| Email | AWS SES | Transactional invoice emails |
| File Storage | AWS S3 | Attachments + invoice PDFs |
| Containers | Docker + Compose | Dev/prod environment parity |
| Deploy (API) | AWS ECS Fargate | Serverless container hosting |
| Deploy (DB) | AWS RDS PostgreSQL | Managed production database |
| Deploy (Frontend) | AWS S3 + CloudFront | Static hosting with CDN + HTTPS |
| Monitoring | AWS CloudWatch | Container logs and CPU alarms |
| CI/CD | GitHub Actions | Push-to-deploy pipeline |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│         React SPA  ←→  AWS CloudFront + S3              │
└─────────────────────┬───────────────────────────────────┘
                      │  HTTPS
┌─────────────────────▼───────────────────────────────────┐
│                      API LAYER                          │
│       Express REST API  ←→  AWS ECS Fargate + ALB       │
└──────┬──────────────┬──────────────────┬────────────────┘
       │              │                  │
┌──────▼──────┐ ┌─────▼──────┐  ┌───────▼───────┐
│  DATA LAYER │ │  STORAGE   │  │  EMAIL LAYER  │
│  RDS Postgres│ │  AWS S3    │  │   AWS SES     │
└─────────────┘ └────────────┘  └───────────────┘
       │
┌──────▼──────┐
│  OBS LAYER  │
│ CloudWatch  │
└─────────────┘
```

**Request Flow:**
1. User action in React → Axios sends request with JWT
2. CloudFront / ALB routes to ECS Fargate task
3. Express middleware: auth check → role check → validation
4. Controller calls service (business logic)
5. Service calls Prisma ORM → RDS PostgreSQL
6. JSON response → Redux store updated → UI re-renders

---

## Getting Started (Local)

### Prerequisites

- Node.js 20+
- Docker Desktop
- Git

### 1. Clone the repository

```bash
git clone https://github.com/rushi-hansora/Vendrix.git
cd vendorbridge
```

### 2. Start the backend

```bash
cd vendorbridge-api

# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Start PostgreSQL + API with Docker Compose
docker-compose up -d

# Run database migrations
npx prisma migrate dev --name init

# Seed demo data
npm run seed

# Verify API is running
curl http://localhost:5000/api/health
# → {"success":true,"message":"ok"}
```

### 3. Start the frontend

```bash
cd vendorbridge-client

# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000

# Start dev server
npm run dev
# → http://localhost:5173
```

### 4. Open the app

Visit `http://localhost:5173` and log in with the seeded demo accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@vendorbridge.com | Admin@123 |
| Procurement Officer | officer@vendorbridge.com | Officer@123 |
| Manager | manager@vendorbridge.com | Manager@123 |
| Vendor | vendor@acmesupplies.com | Vendor@123 |

---

## Environment Variables

### Backend (`vendorbridge-api/.env`)

```env
# Database
DATABASE_URL=postgresql://postgres:secret@localhost:5432/vendorbridge

# Auth
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Server
PORT=5000
NODE_ENV=development

# AWS
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key       # local dev only — ECS uses IAM role
AWS_SECRET_ACCESS_KEY=your-secret-key   # local dev only

# S3
S3_BUCKET=vendorbridge-files

# SES
SES_FROM_EMAIL=noreply@yourdomain.com

# Frontend (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend (`vendorbridge-client/.env`)

```env
VITE_API_URL=http://localhost:5000
```

---

## API Reference

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login, returns JWT | No |

### Vendors
| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/api/vendors` | List all vendors | All |
| POST | `/api/vendors` | Create vendor | Admin, PO |
| PUT | `/api/vendors/:id` | Update vendor | Admin, PO |
| DELETE | `/api/vendors/:id` | Deactivate vendor | Admin |

### RFQ
| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/api/rfq` | List RFQs | All |
| POST | `/api/rfq` | Create RFQ with items + vendors | PO, Admin |
| PUT | `/api/rfq/:id/publish` | Publish RFQ to vendors | PO, Admin |

### Quotations
| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/api/quotations?rfqId=:id` | Get quotations for RFQ | All |
| POST | `/api/quotations` | Submit quotation | Vendor |

### Approvals
| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/api/approvals/pending` | List pending approvals | Manager |
| POST | `/api/approvals` | Create approval request | PO |
| PUT | `/api/approvals/:id` | Approve or reject | Manager |

### Purchase Orders & Invoices
| Method | Endpoint | Description | Role |
|---|---|---|---|
| POST | `/api/purchase-orders` | Generate PO from approved quote | PO, Admin |
| POST | `/api/invoices` | Generate invoice from PO | PO, Admin |
| GET | `/api/invoices/:id/pdf` | Download invoice PDF | All |
| POST | `/api/invoices/:id/send` | Email invoice via AWS SES | PO, Admin |

All responses follow the shape:
```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "meta": { "page": 1, "total": 42 }
}
```

---

## User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full access — user management, vendor management, all procurement actions, analytics |
| **Procurement Officer** | Create RFQs, compare quotations, generate POs and invoices |
| **Manager** | Approve or reject procurement requests, monitor workflows |
| **Vendor** | Submit quotations, track RFQ status, view own purchase orders |

---

## Deployment (AWS)

### Infrastructure Overview

```
React App  →  S3 (static)  →  CloudFront (CDN + HTTPS)
Node.js API  →  ECR (image)  →  ECS Fargate (containers)  →  ALB
PostgreSQL  →  RDS (managed)
PDFs + Attachments  →  S3 (private bucket)
Emails  →  AWS SES
Logs + Metrics  →  CloudWatch
```

### Deploy Backend to ECS

```bash
# 1. Authenticate Docker to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com

# 2. Build, tag, push
docker build -t vendorbridge-api .
docker tag vendorbridge-api:latest \
  ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/vendorbridge-api:latest
docker push \
  ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com/vendorbridge-api:latest

# 3. Run migrations against RDS
DATABASE_URL="postgresql://postgres:PASS@RDS_ENDPOINT:5432/vendorbridge" \
  npx prisma migrate deploy

# 4. Force ECS to pull new image
aws ecs update-service \
  --cluster vendorbridge \
  --service vendorbridge-api-service \
  --force-new-deployment
```

### Deploy Frontend to S3 + CloudFront

```bash
# 1. Build
cd vendorbridge-client
npm run build

# 2. Upload to S3
aws s3 sync dist/ s3://vendorbridge-frontend --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## Project Structure

```
vendorbridge/
├── vendorbridge-client/        # React frontend
│   ├── src/
│   │   ├── api/                # Axios API calls per module
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # One file per screen
│   │   ├── store/              # Redux Toolkit slices
│   │   ├── hooks/              # useAuth, useDebounce
│   │   └── theme/              # MUI theme config
│   └── vite.config.js
│
└── vendorbridge-api/           # Node.js backend
    ├── prisma/
    │   └── schema.prisma       # All DB models
    ├── src/
    │   ├── modules/            # Feature modules (auth, rfq, vendors…)
    │   │   └── [module]/
    │   │       ├── routes.js
    │   │       ├── controller.js
    │   │       └── service.js
    │   ├── middleware/         # auth, role, validate, errorHandler
    │   ├── services/           # pdfService, emailService, s3Service
    │   ├── config/             # db, aws, env
    │   └── utils/              # apiResponse, logger, pagination
    ├── Dockerfile
    └── docker-compose.yml
```

---

## Built With ❤️ for KSV-odoo Hackathon — June 2026
