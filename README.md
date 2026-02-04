# Insurance Approval System - Backend API

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

**A production-ready insurance claim approval system with role-based workflow management**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Database Schema](#-database-schema)

</div>

---

## 🌟 Features

- **🔐 JWT Authentication** - Secure token-based authentication system
- **👥 Role-Based Access Control** - Three distinct roles (USER, VERIFIER, APPROVER)
- **📋 Claim Workflow** - Complete lifecycle: Draft → Submit → Verify → Approve/Reject
- **📊 Activity Logging** - Full audit trail of all claim status changes
- **🔒 Transaction Safety** - Database transactions for atomic operations
- **🏥 Health Checks** - Built-in health monitoring with @nestjs/terminus
- **🚀 Production Ready** - Follows NestJS best practices and industry standards

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS 10.x** | Backend framework |
| **TypeScript 5.x** | Programming language |
| **PostgreSQL** | Relational database |
| **TypeORM** | ORM for database operations |
| **Passport JWT** | Authentication strategy |
| **class-validator** | Request validation |
| **@nestjs/terminus** | Health check monitoring |

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **npm** or **yarn**

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/khukhapede/insurance-approval-system-backend.git
cd insurance-approval-system-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=insurance_manager
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=insurance_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_min_32_characters
JWT_EXPIRES_IN=24h

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 4. Set Up PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE insurance_db;
CREATE USER insurance_manager WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE insurance_db TO insurance_manager;
\q
```

### 5. Run the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api`

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

---

## 🔐 Authentication Endpoints

These endpoints are **public** (no authentication required):

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/auth/register` | Register a new user | `{ username, email, password, fullName, role }` |
| `POST` | `/auth/login` | Login and get JWT token | `{ username, password }` |

### Protected Authentication Endpoints

Requires JWT token in header: `Authorization: Bearer <token>`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/auth/profile` | Get current user profile | All authenticated users |
| `PATCH` | `/auth/profile` | Update own profile | All authenticated users |

<details>
<summary><b>📝 Example: Register User</b></summary>

**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "alice_user",
  "email": "alice@example.com",
  "password": "password123",
  "fullName": "Alice User",
  "role": "user"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid-here",
    "username": "alice_user",
    "email": "alice@example.com",
    "fullName": "Alice User",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
</details>

<details>
<summary><b>📝 Example: Login</b></summary>

**Request:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "alice_user",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
</details>

---

## 👥 USER Role Endpoints

Users can create and manage their own insurance claims.

### What USER Can Do ✅

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/claims` | Create a new claim (draft status) |
| `GET` | `/claims/my-claims` | Get all my claims |
| `GET` | `/claims/:id` | Get single claim (own claims only) |
| `PATCH` | `/claims/:id` | Update claim (draft status only) |
| `PUT` | `/claims/:id/submit` | Submit claim for verification |
| `DELETE` | `/claims/:id` | Delete claim (draft status only) |
| `GET` | `/activity-logs/claim/:claimId` | Get activity logs for specific claim |
| `GET` | `/activity-logs/my-activities` | Get my activity history |

### What USER Cannot Do ❌

- ❌ View other users' claims
- ❌ Access submitted/verified claims list
- ❌ Verify claims
- ❌ Approve or reject claims
- ❌ Create, update, or delete other users
- ❌ View all activity logs

<details>
<summary><b>📝 Example: Create Claim</b></summary>

**Request:**
```bash
POST /api/claims
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "title": "Medical Claim - Surgery",
  "description": "Heart surgery procedure claim",
  "claimAmount": 50000,
  "claimType": "medical"
}
```

**Response (201):**
```json
{
  "id": "claim-uuid",
  "claimNumber": "CLM-2026-0001",
  "title": "Medical Claim - Surgery",
  "description": "Heart surgery procedure claim",
  "claimAmount": "50000.00",
  "claimType": "medical",
  "status": "draft",
  "createdBy": {
    "id": "user-uuid",
    "username": "alice_user",
    "fullName": "Alice User"
  },
  "createdAt": "2026-02-04T10:00:00Z"
}
```
</details>

<details>
<summary><b>📝 Example: Submit Claim</b></summary>

**Request:**
```bash
PUT /api/claims/:id/submit
Authorization: Bearer <user_token>
```

**Response (200):**
```json
{
  "id": "claim-uuid",
  "status": "submitted",
  "submittedAt": "2026-02-04T10:05:00Z",
  ...
}
```
</details>

---

## 🔍 VERIFIER Role Endpoints

Verifiers can review and verify submitted claims.

### What VERIFIER Can Do ✅

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/claims/submitted` | Get all claims with 'submitted' status |
| `GET` | `/claims/:id` | Get any claim details |
| `PUT` | `/claims/:id/verify` | Verify a claim (submitted → verified) |
| `GET` | `/users` | Get all users list |
| `GET` | `/users/:id` | Get any user details |
| `GET` | `/activity-logs` | Get all activity logs |
| `GET` | `/activity-logs/claim/:claimId` | Get logs for specific claim |
| `GET` | `/activity-logs/my-activities` | Get my activity history |

### What VERIFIER Can Do (Inherited from USER) ✅

All USER role capabilities listed above.

### What VERIFIER Cannot Do ❌

- ❌ Create, update, or delete users
- ❌ Approve or reject claims
- ❌ Delete any claims

<details>
<summary><b>📝 Example: Get Submitted Claims</b></summary>

**Request:**
```bash
GET /api/claims/submitted
Authorization: Bearer <verifier_token>
```

**Response (200):**
```json
[
  {
    "id": "claim-uuid",
    "claimNumber": "CLM-2026-0001",
    "title": "Medical Claim - Surgery",
    "status": "submitted",
    "claimAmount": "50000.00",
    "submittedAt": "2026-02-04T10:05:00Z",
    "createdBy": {
      "id": "user-uuid",
      "username": "alice_user",
      "fullName": "Alice User"
    }
  }
]
```
</details>

<details>
<summary><b>📝 Example: Verify Claim</b></summary>

**Request:**
```bash
PUT /api/claims/:id/verify
Authorization: Bearer <verifier_token>
Content-Type: application/json

{
  "comment": "All documents verified successfully"
}
```

**Response (200):**
```json
{
  "id": "claim-uuid",
  "status": "verified",
  "verifiedAt": "2026-02-04T11:00:00Z",
  "verifiedBy": {
    "id": "verifier-uuid",
    "username": "bob_verifier",
    "fullName": "Bob Verifier"
  },
  ...
}
```
</details>

---

## ✅ APPROVER Role Endpoints

Approvers have the highest level of access and can make final decisions on claims.

### What APPROVER Can Do ✅

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/claims/verified` | Get all claims with 'verified' status |
| `GET` | `/claims/:id` | Get any claim details |
| `PUT` | `/claims/:id/approve` | Approve a claim (verified → approved) |
| `PUT` | `/claims/:id/reject` | Reject a claim (verified → rejected) |
| `DELETE` | `/claims/:id` | Delete any claim (any status) |
| `POST` | `/users` | Create new user |
| `GET` | `/users` | Get all users list |
| `GET` | `/users/:id` | Get any user details |
| `PATCH` | `/users/:id` | Update any user |
| `DELETE` | `/users/:id` | Delete any user |
| `GET` | `/activity-logs` | Get all activity logs |
| `GET` | `/activity-logs/claim/:claimId` | Get logs for specific claim |
| `GET` | `/activity-logs/my-activities` | Get my activity history |

### What APPROVER Can Do (Inherited) ✅

All USER and VERIFIER role capabilities.

### What APPROVER Cannot Do ❌

- ❌ Submit claims (claims are submitted by users)
- ❌ Verify claims (claims are verified by verifiers)

<details>
<summary><b>📝 Example: Approve Claim</b></summary>

**Request:**
```bash
PUT /api/claims/:id/approve
Authorization: Bearer <approver_token>
Content-Type: application/json

{
  "comment": "Claim approved for payment"
}
```

**Response (200):**
```json
{
  "id": "claim-uuid",
  "status": "approved",
  "approvedAt": "2026-02-04T12:00:00Z",
  "approvedBy": {
    "id": "approver-uuid",
    "username": "charlie_approver",
    "fullName": "Charlie Approver"
  },
  ...
}
```
</details>

<details>
<summary><b>📝 Example: Reject Claim</b></summary>

**Request:**
```bash
PUT /api/claims/:id/reject
Authorization: Bearer <approver_token>
Content-Type: application/json

{
  "reason": "Missing required medical documentation"
}
```

**Response (200):**
```json
{
  "id": "claim-uuid",
  "status": "rejected",
  "rejectedAt": "2026-02-04T12:00:00Z",
  "rejectionReason": "Missing required medical documentation",
  "approvedBy": {
    "id": "approver-uuid",
    "username": "charlie_approver"
  },
  ...
}
```
</details>

<details>
<summary><b>📝 Example: Create User</b></summary>

**Request:**
```bash
POST /api/users
Authorization: Bearer <approver_token>
Content-Type: application/json

{
  "username": "david_user",
  "email": "david@example.com",
  "password": "password123",
  "fullName": "David User",
  "role": "user"
}
```

**Response (201):**
```json
{
  "id": "new-user-uuid",
  "username": "david_user",
  "email": "david@example.com",
  "fullName": "David User",
  "role": "user",
  "createdAt": "2026-02-04T12:30:00Z"
}
```
</details>

---

## 📊 Activity Logs Endpoints

Track all claim status changes with complete audit trail.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/activity-logs` | Get all activity logs | VERIFIER, APPROVER |
| `GET` | `/activity-logs/claim/:claimId` | Get logs for specific claim | All authenticated |
| `GET` | `/activity-logs/my-activities` | Get my activity history | All authenticated |

<details>
<summary><b>📝 Example: Get Activity Logs for Claim</b></summary>

**Request:**
```bash
GET /api/activity-logs/claim/:claimId
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "log-uuid-1",
    "action": "created",
    "previousStatus": null,
    "newStatus": "draft",
    "comment": "Claim created",
    "performedBy": {
      "id": "user-uuid",
      "username": "alice_user",
      "fullName": "Alice User"
    },
    "createdAt": "2026-02-04T10:00:00Z"
  },
  {
    "id": "log-uuid-2",
    "action": "submitted",
    "previousStatus": "draft",
    "newStatus": "submitted",
    "comment": "Claim submitted for verification",
    "performedBy": {
      "id": "user-uuid",
      "username": "alice_user"
    },
    "createdAt": "2026-02-04T10:05:00Z"
  },
  {
    "id": "log-uuid-3",
    "action": "verified",
    "previousStatus": "submitted",
    "newStatus": "verified",
    "comment": "All documents verified successfully",
    "performedBy": {
      "id": "verifier-uuid",
      "username": "bob_verifier"
    },
    "createdAt": "2026-02-04T11:00:00Z"
  }
]
```
</details>

---

## 🏥 Health Check Endpoints

Monitor API health and database connectivity.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/health` | Complete health check | Public |
| `GET` | `/health/database` | Database connection check | Public |
| `GET` | `/health/memory` | Memory usage check | Public |
| `GET` | `/health/ping` | Simple ping check | Public |

<details>
<summary><b>📝 Example: Health Check</b></summary>

**Request:**
```bash
GET /api/health
```

**Response (200):**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    }
  }
}
```

**Failed Check (503):**
```json
{
  "status": "error",
  "info": {},
  "error": {
    "database": {
      "status": "down",
      "message": "Connection timeout"
    }
  }
}
```
</details>

---

## 🔄 Claim Workflow

```
┌─────────┐      ┌───────────┐      ┌──────────┐      ┌──────────┐
│  DRAFT  │─────>│ SUBMITTED │─────>│ VERIFIED │─────>│ APPROVED │
└─────────┘      └───────────┘      └──────────┘      └──────────┘
    ↑                  ↑                   ↑                 
   USER               USER             VERIFIER           
                                            │
                                            │
                                            v
                                      ┌──────────┐
                                      │ REJECTED │
                                      └──────────┘
                                           ↑
                                       APPROVER
```

| Status | Description | Actions |
|--------|-------------|---------|
| **DRAFT** | Initial state when claim is created | User can edit, update, delete, or submit |
| **SUBMITTED** | Claim sent for verification | Verifier can verify |
| **VERIFIED** | Claim has been verified | Approver can approve or reject |
| **APPROVED** | Claim approved for payment | Final state (success) |
| **REJECTED** | Claim rejected | Final state (with rejection reason) |

---

## 📊 Database Schema

### Users Table
```sql
users
├── id (UUID, PK)
├── username (VARCHAR, UNIQUE)
├── email (VARCHAR, UNIQUE)
├── password (VARCHAR, HASHED)
├── full_name (VARCHAR)
├── role (ENUM: user, verifier, approver)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Claims Table
```sql
claims
├── id (UUID, PK)
├── claim_number (VARCHAR, AUTO-GENERATED)
├── title (VARCHAR)
├── description (TEXT)
├── claim_amount (DECIMAL)
├── claim_type (ENUM)
├── status (ENUM: draft, submitted, verified, approved, rejected)
├── rejection_reason (TEXT, NULLABLE)
├── created_by_id (UUID, FK → users)
├── verified_by_id (UUID, FK → users, NULLABLE)
├── approved_by_id (UUID, FK → users, NULLABLE)
├── submitted_at (TIMESTAMP, NULLABLE)
├── verified_at (TIMESTAMP, NULLABLE)
├── approved_at (TIMESTAMP, NULLABLE)
├── rejected_at (TIMESTAMP, NULLABLE)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Activity Logs Table
```sql
activity_logs
├── id (UUID, PK)
├── claim_id (UUID, FK → claims)
├── performed_by_id (UUID, FK → users)
├── action (ENUM: created, updated, submitted, verified, approved, rejected)
├── previous_status (ENUM, NULLABLE)
├── new_status (ENUM, NULLABLE)
├── comment (TEXT, NULLABLE)
├── ip_address (VARCHAR, NULLABLE)
├── user_agent (TEXT, NULLABLE)
└── created_at (TIMESTAMP)
```

---

## 🧪 Testing

### Using Postman Collections

Three role-based Postman collections are available in the `/postman` directory:

1. **Insurance-API-USER-Role.postman_collection.json**
2. **Insurance-API-VERIFIER-Role.postman_collection.json**
3. **Insurance-API-APPROVER-Role.postman_collection.json**

**How to use:**
1. Import collections into Postman
2. Run "Register" and "Login" requests first
3. Tokens are auto-saved in collection variables
4. Run requests in sequence to test complete workflow

### Test Flow Example

```bash
# 1. USER creates and submits claim
POST /auth/register (role: user)
POST /auth/login
POST /claims
PUT /claims/:id/submit

# 2. VERIFIER verifies claim
POST /auth/register (role: verifier)
POST /auth/login
GET /claims/submitted
PUT /claims/:id/verify

# 3. APPROVER approves claim
POST /auth/register (role: approver)
POST /auth/login
GET /claims/verified
PUT /claims/:id/approve

# 4. Check activity logs
GET /activity-logs/claim/:claimId
```

---

## 📁 Project Structure

```
src/
├── auth/                      # Authentication & Authorization
│   ├── decorators/           # Custom decorators (@GetUser, @Roles)
│   ├── guards/               # Guards (JWT, Roles)
│   ├── strategies/           # Passport strategies
│   ├── dto/                  # Data Transfer Objects
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                     # User Management
│   ├── entities/
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── claims/                    # Claims Workflow
│   ├── entities/
│   ├── dto/
│   ├── claims.controller.ts
│   ├── claims.service.ts
│   └── claims.module.ts
├── activity-logs/            # Audit Trail
│   ├── entities/
│   ├── activity-logs.controller.ts
│   ├── activity-logs.service.ts
│   └── activity-logs.module.ts
├── health/                    # Health Monitoring
│   ├── health.controller.ts
│   └── health.module.ts
├── app.module.ts
└── main.ts
```

---

## 🔒 Security Features

- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **JWT Tokens** - Secure token-based authentication
- ✅ **Role-Based Access Control** - Guard-protected routes
- ✅ **Input Validation** - class-validator on all DTOs
- ✅ **SQL Injection Prevention** - TypeORM parameterized queries
- ✅ **CORS Configuration** - Configurable CORS settings

---

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-secure-password
DATABASE_NAME=insurance_db
JWT_SECRET=your-very-secure-jwt-secret-min-32-chars
JWT_EXPIRES_IN=24h
PORT=3000
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
```

### Railway / Render / Heroku

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U insurance_manager -d insurance_db
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=3001
```

### JWT Token Invalid
- Check JWT_SECRET matches in .env
- Token may have expired (check JWT_EXPIRES_IN)
- Ensure Bearer token format: `Authorization: Bearer <token>`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👤 Author

**Khusnan Hadi Eka Panca Dharma**

- GitHub: [@khukhapede](https://github.com/khukhapede)
- LinkedIn: [Khusnan Hadi Eka Panca Dharma](https://linkedin.com/in/khusnan-hadi-eka)

---

## 🌐 Related Projects

**Frontend Repository:**  
[Insurance Approval System - Frontend](https://github.com/khukhapede/insurance-approval-system-frontend) *(Coming Soon)*

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you learn or build something awesome!

---

## 📞 Contact

For questions or suggestions, please open an issue or contact me directly.

---

<div align="center">

**Built with ❤️ using NestJS, TypeScript, and PostgreSQL**

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>