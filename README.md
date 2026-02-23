# Cohort Project - Event Management Platform

A modern Event Management Platform with features for booking demos, managing attendees, engagement games, and email marketing.

## Features
- **Book a Demo**: Scheduling and capturing attendee data.
- **Event Dashboard**: Manage attendees (approve, check-in, delete).
- **Engagement**: Interactive quizzes and games (scores logged).
- **Marketing**: Generate and send email campaigns.
- **Data Export**: CSV download for participants and logs.

## Tech Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + SQLite
- **Deployment**: Vercel (Frontend) / Render (Backend)

## How to Run Locally

### 1. Install Dependencies
```bash
npm install
cd backend
npm install
```

### 2. Start Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### 3. Start Frontend Client
In a new terminal:
```bash
npm run dev
# App runs on http://localhost:5173
```

## Deployment

### Backend (Render/Railway)
1. Push code to GitHub.
2. Link repo to Render.
3. Use Build Command: `npm install`
4. Use Start Command: `npm start`
5. Set Environment Variable: `PORT` (automatically handled by most platforms)

### Frontend (Vercel)
1. Push code to GitHub.
2. Link repo to Vercel.
3. Set Environment Variable: `VITE_API_URL` -> URL of your deployed backend (e.g., `https://my-backend.onrender.com`).
4. Deploy.
