# MediBook - Doctor Appointment Booking System

A simple but complete student-level project for doctor appointment booking using Java Spring Boot and React.

## Stack

- Backend: Java 17, Spring Boot 3, Spring Security, JWT, JPA, MySQL
- Frontend: React + Vite + React Router

## Setup

### 1) MySQL

Create a database:

```sql
CREATE DATABASE medibook;
```

### 2) Backend

```bash
cd backend
mvn clean spring-boot:run
```

Make sure you have Java 17 or newer and MySQL running. The backend requires database and account secrets through environment variables; do not commit real credentials. In PowerShell, set these in the terminal before starting the backend:

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "<your-local-mysql-password>"
$env:APP_ADMIN_EMAIL = "admin@medibook.com"
$env:APP_ADMIN_PASSWORD = "<choose-a-strong-admin-password>"
$env:JWT_SECRET = "<a-long-random-secret>"
mvn spring-boot:run
```

Stop any existing backend process before restarting so updated classes and configuration are loaded.

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

## Initial Admin

The project creates an administrator automatically if none exists, using `APP_ADMIN_EMAIL` and `APP_ADMIN_PASSWORD` from the backend environment. Choose a strong password and keep it private.

- Default local email: `admin@medibook.com`

## Adding a Doctor (Admin)

1. Sign in with the admin account and open **Manage doctors** from the admin dashboard.
2. Enter the doctor's profile details, login email, and an initial password. The password must be at least 8 characters and include a letter, a number, and a symbol.
3. Choose whether the profile should be active and visible to patients, then select **Create doctor account**.
4. Share the login email and initial password with the doctor through a secure channel. The password is stored as a hash, not returned by the API.

Doctor availability is not configurable in the current frontend, so creating an account does not add appointment slots.

## Role-specific pages

- Public visitors use `/` to browse the site, find doctors, sign in, or register.
- Patients land on `/user` for their appointments and profile.
- Doctors land on `/doctor` for their appointment dashboard.
- Administrators land on `/admin` for system overview and doctor account management.

The previous `/patient/dashboard`, `/doctor/dashboard`, and `/admin/dashboard` links continue to work.

Doctor browsing and profiles are public. Selecting **Book appointment** opens the request form; visitors sign in before submitting, and the selected doctor and entered booking details are retained through sign-in. Booking requests are restricted to patient accounts. Admins can review patient, doctor, and admin accounts from **Users** in the admin navigation.

Admins can activate or deactivate patient and doctor accounts from the user directory. Deactivated accounts cannot sign in; deactivated doctors are also hidden from the public doctor directory. Admin accounts are protected from this action.

## Frontend structure

The React entry point in `frontend/src/main.jsx` mounts the router and global styles. Routes live in `frontend/src/App.jsx`; shared navigation, route guards, dashboard UI, and toast notifications are under `frontend/src/components/`. Page implementations are organized under `frontend/src/pages/` by public, authentication, patient, doctor, and admin areas.

## Notes

This project focuses on clean code and core functionality for learning. It uses simple role-based access and a manageable database structure.

Patient registration passwords must be at least 8 characters and contain a letter, a number, and a symbol (for example `@` or `!`).
