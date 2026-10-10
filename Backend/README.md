# HireHub — Full-Stack Job Portal

HireHub is a customized and extended version of an open-source full-stack job portal.

The project provides separate workflows for job seekers and employers, including authentication, job management, applications, applicant management, application status updates, resume uploads, and notifications.

## Project Background

This project started from the open-source repository:

https://github.com/ahmedhossam32/FullStackJobPortal

The original project and its authors retain their respective rights and attribution.

I used the project as a learning base and extended/customized parts of the application while testing the complete job-seeker and employer workflows locally.

## What I Worked On

The following are changes and improvements made during my work on the project:

- Added working `/jobs/:id` routing for direct job-detail navigation.
- Improved the Job Seeker "My Jobs" page to dynamically count applications with `INTERVIEW` status.
- Added/updated application status presentation in the Job Seeker workflow.
- Configured Cloudinary-based resume uploads through environment variables.
- Tested the complete application workflow:
  - Job seeker registration/login
  - Employer registration/login
  - Job creation
  - Job editing and deletion
  - Job application
  - Resume upload
  - Employer applicant management
  - Application status updates
  - Job seeker status tracking
- Added project-level documentation and screenshots for the tested workflows.

## Features

### Job Seeker

- Register and log in
- Browse jobs
- Search/filter jobs
- View job details
- Save jobs
- Apply for jobs
- Upload resumes
- View submitted applications
- Track application status
- Withdraw applications
- View interview-status applications
- Receive application-status notifications

### Employer

- Register and log in
- Create jobs
- Edit jobs
- Delete jobs
- View posted jobs
- View applicants
- View application details
- Update application status
- Manage the hiring workflow
- View dashboard statistics

## Tech Stack

### Backend

- Java
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- PostgreSQL
- Maven
- Cloudinary

### Frontend

- React
- Vite
- JavaScript
- React Router
- Axios
- Tailwind CSS
- Lucide React
- React Toastify

## Architecture

```text
React + Vite Frontend
        |
        | REST API
        v
Spring Boot Backend
        |
        +---- Spring Security + JWT
        |
        +---- Service Layer
        |
        +---- Repository Layer
        |
        v
PostgreSQL Database

Resume / File Uploads
        |
        v
Cloudinary

Project Structure
HireHub/
│
├── Backend/
│   └── JobPortal/
│       ├── src/
│       ├── pom.xml
│       └── Dockerfile
│
├── Frontend/
│   └── JobPortalFront/
│       ├── src/
│       ├── package.json
│       └── vite.config.js
│
├── ScreenShots/
├── Full_Walkthrough.md
├── README.md
└── .gitignore

Local Setup
Requirements
Install:
- Java 17+
- Maven
- Node.js
- npm
- PostgreSQL
Backend
cd Backend\JobPortal
mvn spring-boot:run

Backend runs on:
http://localhost:8080

Frontend
Open another terminal:
cd Frontend\JobPortalFront
npm install
npm run dev

Frontend runs on:
http://localhost:5173

Database
The backend uses PostgreSQL.
Create a database named:
Database
hirehub

Database credentials should be provided through environment variables.
Do not commit real credentials or secrets.
Environment Variables
Sensitive configuration is intentionally excluded from Git.
Example configuration is provided in:

Backend/JobPortal/.env.example

Cloudinary credentials should also be supplied through environment variables.
Authentication
HireHub uses JWT-based authentication.
The application supports role-based access for:

JOB_SEEKER
EMPLOYER

Protected backend endpoints validate the authenticated user and role before allowing access.
Application Workflow
Job Seeker
    |
    v
Browse Jobs
    |
    v
View Job
    |
    v
Apply + Upload Resume
    |
    v
Employer Reviews Application
    |
    v
Employer Updates Status
    |
    v
Job Seeker Sees Updated Status

Testing Performed
The following workflows were tested locally:
- Job seeker authentication
- Employer authentication
- Job creation
- Job editing
- Job deletion
- Job application
- Resume upload through Cloudinary
- My Applications
- Employer applicant management
- Application status updates
- Interview-status tracking
- Job detail navigation
- Frontend production build
Testing Notes
The frontend production build completes successfully.
The backend unit tests pass for the observer-related tests. The full Maven test suite also contains an integration test that requires a working Docker environment through Testcontainers.
Security Notes
- Real application secrets are excluded from Git.
- Database credentials are not committed.
- Cloudinary credentials are not committed.
- JWT configuration is supplied through environment variables.
- .gitignore excludes local sensitive configuration and generated build files.
Screenshots
The ScreenShots/ directory contains screenshots of the tested Job Seeker and Employer workflows.
See:

Full_Walkthrough.md
for the detailed walkthrough.
Future Improvements
Possible future improvements include:
- Production deployment
- Email notification configuration
- Advanced job-search filters
- Automated CI testing
- Additional application-status workflows
- Improved production monitoring
Author
Aryan Tawade
GitHub:
https://github.com/aryantawade123-sys
Attribution
This repository is a customized and extended version of:
https://github.com/ahmedhossam32/FullStackJobPortal
The original project is credited above. This repository does not claim the original implementation as entirely my own.

for the detailed walkthrough.
Future Improvements
Possible future improvements include:
- Production deployment
- Email notification configuration
- Advanced job-search filters
- Automated CI testing
- Additional application-status workflows
- Improved production monitoring
Author
Aryan Tawade
GitHub:
https://github.com/aryantawade123-sys
Attribution
This repository is a customized and extended version of:
https://github.com/ahmedhossam32/FullStackJobPortal
The original project is credited above. This repository does not claim the original implementation as entirely my own.
