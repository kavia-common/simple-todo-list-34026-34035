//
// Storage service that auto-detects a backend API or falls back to localStorage.
// Backend auto-detect convention: looks for window.__TODO_API__ or env REACT_APP_TODO_API_URL,
// and tries a health check on `${baseUrl}/todos`.
//
const DEFAULT_STORAGE_KEY = 'retro_todo_items_v1';

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function hasWindow() {
  return typeof window !== 'undefined';
}

async function detectApiBaseUrl() {
  // Allow injecting a global in index.html or hosting environment
  let baseUrl =
    (hasWindow() && window.__TODO_API__) ||
    process.env.REACT_APP_TODO_API_URL ||
    '';

  if (!baseUrl) return '';

  // Strip trailing slash
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

  // Try health check
  try {
    const res = await fetch(`${baseUrl}/todos`, { method: 'GET' });
    if (res.ok) return baseUrl;
  } catch {
    // Ignore; will fallback to localStorage
  }
  return '';
}

// PUBLIC_INTERFACE
export async function createStorage() {
  /**
   * Creates a storage interface that uses an HTTP API if available, otherwise localStorage.
   * API contract expected:
   *   GET    /todos                -> [{id, text, completed}]
   *   POST   /todos                -> body {text} returns created {id, text, completed:false}
   *   PUT    /todos/:id            -> body {text?, completed?} returns updated
   *   DELETE /todos/:id            -> 204
   */
  const baseUrl = await detectApiBaseUrl();
  const useApi = !!baseUrl;

  if (useApi) {
    // API-backed storage
    return {
      // PUBLIC_INTERFACE
      async getTodos() {
        const res = await fetch(`${baseUrl}/todos`);
        if (!res.ok) throw new Error('Failed to fetch todos from API');
        return res.json();
      },
      // PUBLIC_INTERFACE
      async addTodo(text) {
        const res = await fetch(`${baseUrl}/todos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error('Failed to add todo via API');
        return res.json();
      },
      // PUBLIC_INTERFACE
      async updateTodo(id, updates) {
        const res = await fetch(`${baseUrl}/todos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update todo via API');
        return res.json();
      },
      // PUBLIC_INTERFACE
      async deleteTodo(id) {
        const res = await fetch(`${baseUrl}/todos/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete todo via API');
        return true;
      },
      usingApi: true,
    };
  }

  // LocalStorage-backed storage
  const read = () => {
    if (!hasWindow()) return [];
    const raw = window.localStorage.getItem(DEFAULT_STORAGE_KEY);
    return safeParse(raw, []);
  };
  const write = (items) => {
    if (!hasWindow()) return;
    window.localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify(items));
  };

  return {
    // PUBLIC_INTERFACE
    async getTodos() {
      return read();
    },
    // PUBLIC_INTERFACE
    async addTodo(text) {
      const items = read();
      const newItem = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        text,
        completed: false,
      };
      const next = [newItem, ...items];
      write(next);
      return newItem;
    },
    // PUBLIC_INTERFACE
    async updateTodo(id, updates) {
      const items = read();
      const next = items.map((t) => (t.id === id ? { ...t, ...updates } : t));
      write(next);
      return next.find((t) => t.id === id);
    },
    // PUBLIC_INTERFACE
    async deleteTodo(id) {
      const items = read();
      const next = items.filter((t) => t.id !== id);
      write(next);
      return true;
    },
    usingApi: false,
  };
}
