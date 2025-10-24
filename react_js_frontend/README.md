# Retro Todo - React Frontend

A retro-themed Todo application with add, edit, delete, and completion toggle. It auto-detects a backend API if available and falls back to localStorage otherwise.

## Run

- npm install
- npm start
- Open http://localhost:3000

## Components

- Header (retro-styled with connectivity badge)
- TodoInput (form to add todos)
- TodoList (renders list)
- TodoItem (inline edit, checkbox, delete)

## Storage

The app tries to use an API if present:
- It checks `window.__TODO_API__` or `REACT_APP_TODO_API_URL`, then calls GET `${baseUrl}/todos`.
- Expected endpoints:
  - GET /todos
  - POST /todos
  - PUT /todos/:id
  - DELETE /todos/:id
If the check fails, it uses localStorage under the key `retro_todo_items_v1`.

No additional environment variables are required. Optionally, you can set:
- REACT_APP_TODO_API_URL=https://your-backend.example.com

## Theme

Light theme palette:
- Primary: #3b82f6
- Success: #06b6d4
- Error: #EF4444

The UI is responsive and works on mobile and desktop.

## Notes

- Double-click a todo text to start editing.
- Press Enter to save, Escape to cancel, or blur to save.
