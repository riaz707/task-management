# Task Management System — Backend API

**Stack:** Node.js · Express · MongoDB · Mongoose · JWT

---

## Setup

```bash
npm install
cp .env.example .env
# .env fill up koro
npm run dev
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Access token secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | New user register | ❌ |
| POST | `/login` | Login | ❌ |
| POST | `/refresh` | Access token refresh | ❌ |
| POST | `/logout` | Logout | ❌ |
| GET | `/me` | Current user info | ✅ |

### Users — `/api/users`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | All users (search: `?search=name`) |
| GET | `/:id` | Single user |
| PUT | `/profile` | Update name/avatar (multipart/form-data) |
| PUT | `/change-password` | Change password |

### Projects — `/api/projects`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | My projects |
| POST | `/` | Create project |
| GET | `/:id` | Single project |
| PUT | `/:id` | Update project |
| DELETE | `/:id` | Delete project |
| POST | `/:id/members` | Add member (`{userId}`) |
| DELETE | `/:id/members/:userId` | Remove member |

### Tasks — `/api/tasks`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Project tasks (`?project=id&status=&priority=&assignee=`) |
| POST | `/` | Create task |
| GET | `/my-tasks` | Tasks assigned to me |
| PATCH | `/reorder` | Reorder tasks (drag-drop) |
| GET | `/:id` | Single task |
| PUT | `/:id` | Update task |
| DELETE | `/:id` | Delete task |
| PATCH | `/:id/move` | Move task to column (`{status, order}`) |
| PATCH | `/:id/checklist/:itemId` | Toggle checklist item |

### Comments — `/api/comments`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Add comment (`{taskId, text}`) |
| GET | `/:taskId` | Get task comments |
| DELETE | `/:id` | Delete comment |

---

## Task Status (Kanban Columns)

```
todo → in-progress → review → done
```

## Task Priority

```
low | medium | high | urgent
```

---

## Request Examples

### Register
```json
POST /api/auth/register
{
  "name": "Riaz Islam",
  "email": "ramimriaz420@gmail.com",
  "password": "secret123"
}
```

### Create Task
```json
POST /api/tasks
Authorization: Bearer <token>
{
  "title": "Design login page",
  "description": "Create responsive login UI",
  "project": "PROJECT_ID",
  "status": "todo",
  "priority": "high",
  "assignees": ["USER_ID"],
  "dueDate": "2025-08-01",
  "labels": ["frontend", "ui"],
  "checklist": [
    { "text": "Mobile responsive" },
    { "text": "Dark mode support" }
  ]
}
```

### Move Task (Drag & Drop)
```json
PATCH /api/tasks/:id/move
{
  "status": "in-progress",
  "order": 2
}
```
