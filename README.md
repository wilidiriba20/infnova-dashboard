# Infnova Applicant Management Dashboard

## Project Overview

A React and TypeScript application for viewing and managing internship applicants.

---

## Technologies Used

### Frontend
- **React 19** – Building the user interface using reusable components.
- **TypeScript** – Adding static typing for better code quality and maintainability.
- **React Router DOM** – Client-side routing and navigation between views.
- **Tailwind CSS 4** – Utility-first CSS framework for styling.
- **CSS** – Additional custom styling where needed.

### Build & Development Tools
- **Vite** – Fast development server and build tool.
- **@vitejs/plugin-react** – Enables React support in Vite.
- **Oxlint** – Linting tool used to identify code quality issues.
---

## Setup Instructions

### Prerequisites

Make sure you have the following installed:

- Node.js (v18 or later recommended)
- npm

### Installation

1. Clone the repository

```bash
git clone https://github.com/wilidiriba20/infnova-dashboard.git
```

2. Navigate to the project directory

```bash
cd infnova-dashboard
```

3. Install dependencies

```bash
npm install
```

4. Start the development server

```bash
npm run dev
```

5. Open your browser and visit

```
http://localhost:5173
```

---

## Architecture

The project follows a simple component-based architecture using React and TypeScript. The application is organized to separate UI components, API communication, shared types, and static assets.

```
src/
├── assets/          # Static assets such as images and logos
├── components/      # Reusable React components and application views
│   ├── ApplicantDetail.tsx
│   ├── ApplicantsView.tsx
│   ├── DashboardView.tsx
│   ├── LoginPage.tsx
│   ├── Sidebar.tsx
│   └── StatusBadge.tsx
├── api.ts           # Handles communication with the backend API
├── types.ts         # Shared TypeScript interfaces and type definitions
├── App.tsx          # Root application component
├── main.tsx         # Application entry point
└── index.css        # Global styles
```

### Folder Responsibilities

- **assets/** – Stores static resources such as the company logo and images.
- **components/** – Contains reusable UI components and page-level views that make up the application's interface.
- **api.ts** – Centralizes all API requests, keeping backend communication separate from the UI.
- **types.ts** – Defines shared TypeScript types and interfaces used throughout the application.
- **App.tsx** – The root component responsible for rendering the application and managing the main layout.
- **main.tsx** – The entry point that initializes React and mounts the application to the DOM.
- **index.css** – Contains global styles that apply across the entire application.
---

## Assumptions

- Backend API is running.
- Applicant IDs are unique.
- Authentication is handled using JWT.
- The dashboard's UI follows the branding and visual style of the official **INFNOVA Technolgies** website to maintain a consistent user experience.

---
