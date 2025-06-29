# Task Manager

This is a simple task management application built with a NestJS backend and an Angular frontend. It allows you to manage your tasks efficiently and includes a simulated AI to help you take notes

https://github.com/user-attachments/assets/6a8895a9-2822-4062-9f15-439a1a7919b1


## Features

- **Full CRUD Operations:** Create, read, update, and delete tasks.
- **Simulated AI Notes:** Generate AI-powered (simulated) notes for your tasks.
- **Filtering & Sorting:** Search, filter by status, and sort tasks.
- **Pagination:** Browse through a set of tasks with server-side pagination.
- **Task Statistics:** Get a quick overview of your progress with a stats dashboard.
- **Responsive Design:** A clean UI that works on any device.
- **State Management:** Built with NgRx for predictable state management in the frontend.

## Tech Stack

- **Backend:** NestJS, TypeScript, PostgreSQL, TypeORM
- **Frontend:** Angular, TypeScript, NgRx, Angular Material

## Getting Started

### Prerequisites

- Node.js (v22+)
- Docker and Docker Compose
- Angular CLI

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Copy the example environment file
cp env.example .env

# Install dependencies
npm install

# Start the PostgreSQL database using Docker
docker-compose up -d

# Run database migrations
npm run migration:run

# Start the backend server
npm run start:dev
```

The backend API will be available at `http://localhost:3000`.

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm istall

# Start the frontend development server
npm start
```

Open your browser and navigate to `http://localhost:4200` to use the application.

**Note on Frontend Dependencies:** This project uses Angular 20. While NgRx does not have official support for Angular 20 at the time of this writing, it has been tested and works correctly. The `npm i --legacy-peer-deps` command is used to bypass peer dependency conflicts during installation. For more details, you can refer to the discussion on the [NgRx GitHub repository](https://github.com/ngrx/platform/issues/4787).

## Running Unit Tests

You can run the unit tests for both the backend and frontend to ensure everything is working as expected.

### Backend Unit Tests

```bash
# Navigate to the backend directory
cd backend

# Run unit tests
npm test
```

### Frontend Unit Tests

```bash
# Navigate to the frontend directory
cd frontend

# Run unit tests
npm test
```

## API Documentation

The API is documented using Swagger. Once the backend is running, you can access the interactive API documentation at:

[http://localhost:3000/api](http://localhost:3000/api)

