# Francken Slides

A small full-stack slide system for T.F.V. "Professor Francken": a public TV
view that cycles through scheduled slides, and a protected admin dashboard for
creating, editing, uploading, and managing the content shown on screen.

The app is built for a simple production setup: a Vite React frontend served by
Nginx, an Express API running as a backend service, MongoDB for slide data, and
local disk storage for uploaded images.

## What It Does

- Shows a public, full-screen TV slideshow at `/`.
- Provides an admin dashboard at `/admin`.
- Supports image, quote, countdown, and agenda slide types.
- Lets admins upload and replace slide images.
- Schedules slides by loop, hourly, or daily frequency.
- Pulls agenda items from Google Calendar.
- Pulls quote data from public or API-backed Google Sheets.

## Tech Stack

| Layer        | Tools                                           |
| ------------ | ----------------------------------------------- |
| Frontend     | React 19, Vite, TypeScript, React Router, Axios |
| Backend      | Node.js, Express 5, Mongoose, Multer, JWT       |
| Data         | MongoDB                                         |
| Integrations | Google Calendar API, Google Sheets API          |

## Project Structure

```text
francken_slides/
+-- backend/
|   +-- models/          # Mongoose models
|   +-- routes/          # Express API routes
|   +-- services/        # Google and slide-normalization helpers
|   +-- public/          # Uploaded images served by Express
|   +-- server.js        # API entrypoint
+-- frontend/
|   +-- public/          # Static frontend assets
|   +-- src/
|       +-- components/  # Dashboard, editor, TV view, slide controls
|       +-- App.tsx      # Routing and session bootstrap
|       +-- main.tsx     # React entrypoint
```

## Prerequisites

- Node.js and npm
- MongoDB running locally or reachable over the network

## Environment Variables

Create `backend/.env`:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/slides
GOOGLE_API_KEY=your_google_api_key
ADMIN_PASSWORD=your_admin_passphrase
JWT_SECRET=replace_this_with_a_long_random_secret
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Local Development

Install dependencies:

```bash
npm --prefix backend install
npm --prefix frontend install
```

Start MongoDB, then start the backend:

```bash
npm --prefix backend run dev
```

Start the frontend in another terminal:

```bash
npm --prefix frontend run dev
```

Open the frontend URL printed by Vite

## Available Scripts

Backend:

```bash
npm --prefix backend start
npm --prefix backend run dev
```

Frontend:

```bash
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend run preview
npm --prefix frontend run lint
```

## API Overview

| Method   | Route                        | Purpose                          |
| -------- | ---------------------------- | -------------------------------- |
| `GET`    | `/api/health`                | Backend health check             |
| `POST`   | `/api/auth/login`            | Login and receive an admin token |
| `GET`    | `/api/auth/login`            | Validate the current admin token |
| `GET`    | `/api/slides`                | Fetch public slide data          |
| `POST`   | `/api/slides`                | Create a slide                   |
| `GET`    | `/api/slides/:id`            | Fetch one slide                  |
| `PUT`    | `/api/slides/:id`            | Update one slide                 |
| `DELETE` | `/api/slides/:id`            | Delete one slide                 |
| `POST`   | `/api/slides/agenda-preview` | Preview Google Calendar events   |
| `POST`   | `/api/slides/quote-preview`  | Preview Google Sheet quotes      |
| `POST`   | `/api/uploads`               | Upload an image                  |
| `PUT`    | `/api/uploads/:filename`     | Replace an image                 |
| `DELETE` | `/api/uploads/:filename`     | Delete an uploaded image         |
| `GET`    | `/api/uploads`               | List uploaded images             |

Protected routes expect the JWT in the `token` request header.
