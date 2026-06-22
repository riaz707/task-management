# TaskFlow — Task Management System

A full-stack Kanban-style task management application built with the MERN stack.

> 👨‍💻 **Author:** Riaz Islam — [github.com/riaz707](https://github.com/riaz707)

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, Zustand, @dnd-kit, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, JWT Auth (Access + Refresh Token) |
| **Database** | MongoDB, Mongoose |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## Features

- 🔐 JWT authentication with refresh token rotation
- 📋 Kanban board with drag-and-drop (Todo → In Progress → Review → Done)
- ✅ Task checklist with progress tracking
- 💬 Comments per task
- 👥 Project member management (add/remove)
- 🏷️ Priority labels (low / medium / high / urgent)
- 📅 Due date with overdue & today indicators
- 📊 Dashboard with stats overview
- 🌙 Dark theme UI

---

## Project Structure

```
task-management/
├── task-management-backend/     # Node.js + Express API
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
└── taskflow-frontend/           # React + Vite SPA
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   ├── store/
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)

### 1. Clone the repo

```bash
git clone https://github.com/riaz707/task-management.git
cd task-management
```

### 2. Backend Setup

```bash
cd task-management-backend
npm install

cp .env.example .env
# Fill in your values (see Environment Variables below)

npm run dev       # Development
npm start         # Production
```

### 3. Frontend Setup

```bash
cd taskflow-frontend
npm install

cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api

npm run dev       # Development (http://localhost:5173)
npm run build     # Production build
```

---

## Environment Variables

### Backend — `.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskflow
JWT_SECRET=your_strong_jwt_secret
JWT_REFRESH_SECRET=your_strong_refresh_secret
NODE_ENV=production
```

### Frontend — `.env`

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all user projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project by ID |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks?project=:id` | Get tasks (grouped by status) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/my-tasks` | My assigned tasks |
| GET | `/api/tasks/:id` | Get task details |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/move` | Move task (drag-and-drop) |
| PATCH | `/api/tasks/reorder` | Reorder tasks in column |
| PATCH | `/api/tasks/:id/checklist/:itemId` | Toggle checklist item |
| DELETE | `/api/tasks/:id` | Delete task |

---

## Deployment

### Frontend → Vercel

```bash
cd taskflow-frontend
npm run build
# Push to GitHub → connect to Vercel
# Set VITE_API_URL environment variable in Vercel dashboard
```

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect GitHub repo
3. Set **Root Directory** → `task-management-backend`
4. Set **Build Command** → `npm install`
5. Set **Start Command** → `npm start`
6. Add environment variables from `.env`

---

## License

MIT © [Riaz Islam](https://github.com/riaz707)
