# HR Connect — Leave Management System

A modern, enterprise-grade Human Resources application built to streamline employee onboarding, leave requests, and administrative approvals.

![HR Connect Dashboard](https://via.placeholder.com/1200x600.png?text=HR+Connect+Dashboard)

## 🌟 Overview

HR Connect eliminates the friction of manual leave tracking. It provides a beautiful, dynamic interface for employees to request time off, view their leave balances, and track their request history. For HR administrators, it offers a centralized dashboard to onboard new hires, manage leave categories, and securely approve or reject time-off requests.

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Distinct experiences and secure routing for `Admin` and `Employee` roles.
- **Automated Employee Onboarding:** Admins can create an employee profile which instantly generates a secure setup link for the new hire to register their credentials.
- **Leave Balance Tracking:** Employees can view real-time metrics of their remaining and used days across various leave categories (e.g., Sick, Vacation, Sabbatical).
- **Time-Off Workflows:** Employees can apply for leave; Admins have a dedicated pipeline to review, approve, or reject these requests with reasons.
- **Dynamic Leave Types:** Admins have full CRUD capabilities to define custom leave categories and their default maximum days.
- **Responsive & Modern UI:** A fully responsive interface featuring a collapsible sidebar, dynamic data tables, modal dialogs, and a premium design system.

## 🛠️ Tech Stack

This project is built using a modern decoupled architecture:

### Frontend
- **Framework:** Next.js (React)
- **Routing:** App Router with Edge Middleware for JWT protection
- **Styling:** Tailwind CSS + Lucide React Icons
- **Data Fetching:** Custom strongly-typed `fetch` API client proxying to the backend

### Backend
- **Framework:** ASP.NET Core Web API (C#)
- **Architecture:** N-Tier (API, BLL - Business Logic, DAL - Data Access)
- **Database:** Entity Framework Core (SQL Server)
- **Authentication:** JWT (JSON Web Tokens) with claim-based authorization

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- .NET 8 SDK
- SQL Server (LocalDB or Docker)

### Running the Backend (API)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Apply Entity Framework migrations to create the database:
   ```bash
   dotnet ef database update
   ```
3. Start the ASP.NET Core dev server:
   ```bash
   dotnet watch run
   ```
   *The API will typically run on `https://localhost:7125`.*

### Running the Frontend (UI)
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:3000`.

## 🔒 Security

This application enforces security at both the gateway and the resource levels:
- **Middleware Proxy:** The Next.js Edge middleware intercepts all routes to verify the presence of a valid JWT, protecting authenticated pages from unauthorized access.
- **API Proxy:** API calls from the Next.js client are securely proxied to bypass CORS issues and inject the secure HttpOnly token.
- **Attribute-Based Authorization:** The ASP.NET Core endpoints are strictly protected using `[Authorize(Roles = "Admin")]` to ensure zero privilege escalation.

## 📄 License

This project is licensed under the MIT License.
