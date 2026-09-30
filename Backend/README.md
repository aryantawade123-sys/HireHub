# 💼 HireHub — Full-Stack Job Portal

HireHub is a full-stack job portal that connects **Job Seekers** with **Employers**.

Job Seekers can discover jobs, view job details, save jobs, apply with their resume, and track their application status. Employers can create and manage job postings, view applicants, and update application statuses.

The project is built using **React + Vite** for the frontend and **Spring Boot + PostgreSQL** for the backend, with **JWT authentication** and **Cloudinary** for resume uploads.

---

## 🚀 Features

### 👨‍💻 Job Seeker

- Register and login
- Browse available jobs
- View detailed job information
- Search and explore job listings
- Save jobs
- Apply for jobs
- Upload resume while applying
- View submitted applications
- Track application status
- Withdraw applications
- View interview status
- View application details

### 🏢 Employer

- Register and login
- Create job postings
- View posted jobs
- Edit existing jobs
- Delete jobs
- View applicants for posted jobs
- View applicant details
- Update application status
- Manage recruitment workflow

### 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control
- Separate Job Seeker and Employer flows
- Protected backend APIs
- Secure authenticated requests

### ☁️ File Upload

- Resume upload using Cloudinary
- Resume URL stored with the application
- Cloud-based file storage

### 📊 Application Tracking

Supported application statuses include:

- `PENDING`
- `REVIEWED`
- `INTERVIEW`
- `OFFERED`
- `REJECTED`
- `WITHDRAWN`

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Axios
- React Router
- Lucide React
- React Toastify

### Backend

- Java
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- Hibernate
- Maven

### Database

- PostgreSQL

### Cloud Storage

- Cloudinary

---

## 🏗️ Project Architecture

HireHub follows a full-stack client-server architecture.

```text
                    ┌─────────────────────┐
                    │      HireHub        │
                    │     Frontend        │
                    │   React + Vite      │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │      HireHub        │
                    │      Backend        │
                    │ Spring Boot + JWT   │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
             ┌─────────────┐       ┌─────────────┐
             │ PostgreSQL  │       │  Cloudinary │
             │  Database   │       │ Resume Files│
             └─────────────┘       └─────────────┘
             ---

## 📁 Project Structure

```text
HireHub/
│
├── Backend/
│   └── JobPortal/
│       ├── src/
│       │   └── main/
│       │       ├── java/
│       │       └── resources/
│       │
│       ├── pom.xml
│       └── ...
│
├── Frontend/
│   └── JobPortalFront/
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── vite.config.js
│       └── ...
│
└── README.md
---

## ⚙️ Local Setup

Follow the steps below to run HireHub locally.

### Prerequisites

Make sure you have:

- Java 17+
- Maven
- Node.js
- npm
- PostgreSQL
- Git
---

## 🗄️ PostgreSQL Setup

Create a PostgreSQL database named:

```text
hirehub
5432
Configure your PostgreSQL username and password using environment variables.

> Never commit database passwords or other secrets to GitHub.
---

## ☁️ Cloudinary Configuration

HireHub uses Cloudinary for resume uploads.

Set these environment variables:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
> Never commit real Cloudinary credentials to GitHub.
---

## 🔧 Backend Setup

Open a terminal and run:

```powershell
cd "C:\Users\Aryan Tawade\Desktop\HireHub\Backend\JobPortal"
mvn spring-boot:run
http://localhost:8080
---

## 🎨 Frontend Setup

Open another terminal:

```powershell
cd "C:\Users\Aryan Tawade\Desktop\HireHub\Frontend\JobPortalFront"
  npm install
  npm run dev
  http://localhost:5173
  Open the application in your browser:
  http://localhost:5173
  ---

## 🔐 Authentication Flow

HireHub uses JWT-based authentication.

```text
User
  ↓
Login / Signup
  ↓
Spring Boot Authentication
  ↓
JWT Token
  ↓
Authenticated API Requests
  ↓
Spring Security
  ↓
Protected Resource
---

## 👥 User Roles

### Job Seeker

Job Seekers can:

- Browse jobs
- View job details
- Save jobs
- Apply for jobs
- Upload resumes
- View applications
- Track application status
- Withdraw applications

### Employer

Employers can:

- Create jobs
- Edit jobs
- Delete jobs
- View applicants
- View application details
- Update application status
---

## 🔌 API Overview

### Authentication

```text
POST /auth/signup/jobseeker
POST /auth/signup/employer
POST /auth/signin
Jobs
GET    /jobs
GET    /jobs/{id}
POST   /jobs
PUT    /jobs/{id}
DELETE /jobs/{id}
Applications
POST   /applications
GET    /applications/my
GET    /applications/{id}
DELETE /applications/{id}
Employer Applications
GET /employer/applications
PUT /applications/{id}/status
Resume Upload
POST /user/jobseeker/upload-resume
Protected endpoints require authentication using a JWT token.
---

## 🔄 Application Workflow

A typical Job Seeker workflow:

```text
Register
   ↓
Login
   ↓
Browse Jobs
   ↓
View Job Details
   ↓
Apply for Job
   ↓
Upload Resume
   ↓
Application Submitted
   ↓
Employer Reviews Application
   ↓
Employer Updates Status
   ↓
Job Seeker Sees Updated Status

Example application statuses:
PENDING
   ↓
REVIEWED
   ↓
INTERVIEW
   ↓
OFFERED
An application can also be:
REJECTED

  or withdrawn by the Job Seeker:
  WITHDRAWN
  ---

## 🧪 Tested Features

### Job Seeker

- ✅ Registration
- ✅ Login
- ✅ Browse jobs
- ✅ View job details
- ✅ Apply for a job
- ✅ Resume upload
- ✅ View submitted applications
- ✅ Track application status
- ✅ Withdraw application

### Employer

- ✅ Registration
- ✅ Login
- ✅ Employer dashboard
- ✅ Create job
- ✅ Edit job
- ✅ Delete job
- ✅ View applicants
- ✅ View application details
- ✅ Update application status

### End-to-End Flow

```text
Job Seeker applies
        ↓
Employer receives application
        ↓
Employer reviews application
        ↓
Employer changes application status
        ↓
Job Seeker sees updated status
---

## 🔒 Security

HireHub uses JWT-based authentication and role-based authorization.

Security features include:

- JWT authentication
- Protected API endpoints
- Role-based access control
- Password hashing
- Authenticated application operations
- Employer ownership checks for job management
- Job Seeker ownership checks for applications

Sensitive credentials such as database passwords and Cloudinary API secrets should be provided through environment variables and should never be committed to GitHub.
---

## 📝 Environment Variables

Sensitive configuration should be provided through environment variables instead of being committed to the repository.

```text
DB_URL
DB_USERNAME
DB_PASSWORD

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
Never commit API keys, API secrets, database passwords, or other private credentials to GitHub.
---

## 🚀 Future Improvements

Potential future improvements include:

- Email notifications
- Advanced job search and filtering
- Recruiter analytics
- Resume preview
- Production deployment
- Docker containerization
- CI/CD pipeline
- Cloud deployment
- Automated testing
---

## 👨‍💻 Author

**Aryan Tawade**

IT Engineering Student  
Java Backend & Full-Stack Developer

GitHub:  
https://github.com/aryantawade123-sys
---

## 📚 Project Background

HireHub is a customized and extended version of an existing open-source job portal project.

The project has been adapted and enhanced with additional functionality, UI changes, resume upload integration, employer/job management, and application-status tracking.

Original repository:

https://github.com/ahmedhossam32/FullStackJobPortal

Please refer to the original repository and its license for applicable licensing and attribution requirements.