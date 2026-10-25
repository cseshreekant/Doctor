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

Make sure you have Java 17 or newer and MySQL running. Copy `backend/.env.example` to `backend/.env` (or edit the provided local `backend/.env`) and set your local database username/password, a strong admin password, and a random JWT secret of at least 32 bytes. The local `.env` file is ignored by Git; do not commit real credentials.

```dotenv
DB_URL=jdbc:mysql://localhost:3306/medibook?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=your-mysql-password
APP_ADMIN_EMAIL=admin@medibook.com
APP_ADMIN_PASSWORD=choose-a-strong-admin-password
JWT_SECRET=replace-with-at-least-32-random-bytes
```

For a hosted MySQL service such as Aiven, set `DB_URL` to its JDBC URL, for example `jdbc:mysql://your-host:12394/defaultdb?sslMode=REQUIRED`, and set `DB_USERNAME` and `DB_PASSWORD` separately. Do not put credentials in the URL or commit them.

You can generate a random JWT secret in PowerShell:

```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Paste the generated value into `JWT_SECRET` in `backend/.env`, then start the backend:

```powershell
cd backend
mvn spring-boot:run
```

Stop any existing backend process before restarting so updated classes and configuration are loaded.

#### Run the backend with Docker

From the repository root, build the backend image and run it with the environment values from `backend/.env`:

```powershell
docker build -t medibook-backend .\backend
docker run --rm -p 8080:8080 --env-file backend\.env medibook-backend
```

The container listens on port 8080 by default and honors the `PORT` environment variable when the hosting platform provides one. Do not bake `.env` or database credentials into the image.

### 3) Frontend

Set the backend API URL in `frontend/.env` before starting Vite:

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
```

The frontend reads this value when creating its API client. Restart the Vite dev server after changing `.env`.

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

After signing in, doctors can set or update weekly clinic hours from their dashboard. Patients can choose only dates and 30-minute appointment times within those hours.

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
