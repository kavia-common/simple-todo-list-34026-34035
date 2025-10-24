//
//
// Storage service that auto-detects a backend API or falls back to localStorage.
// Backend auto-detect convention: looks for window.__TODO_API__ or env REACT_APP_TODO_API_URL,
// and tries a health check on `${baseUrl}/todos`.
//
const DEFAULT_STORAGE_KEY = 'retro_todo_items_v1';

/**
 * Safely parse JSON and ensure the result is an array for our todos storage.
 * Always returns an array (possibly empty) so callers can safely spread/map.
 */
function safeParseArray(json) {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
        const data = await res.json();
        // Normalize to array
        return Array.isArray(data) ? data : [];
      },
      // PUBLIC_INTERFACE
      async addTodo(text) {
        const res = await fetch(`${baseUrl}/todos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error('Failed to add todo via API');
        const created = await res.json();
        // Ensure shape
        return created && typeof created === 'object'
          ? {
              id: created.id ?? (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
              text: created.text ?? String(text),
              completed: !!created.completed,
            }
          : {
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
              text: String(text),
              completed: false,
            };
      },
      // PUBLIC_INTERFACE
      async updateTodo(id, updates) {
        const res = await fetch(`${baseUrl}/todos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update todo via API');
        const updated = await res.json();
        // Ensure shape
        return updated && typeof updated === 'object'
          ? {
              id: updated.id ?? id,
              text: updated.text ?? '',
              completed: !!updated.completed,
            }
          : { id, ...(updates || {}), completed: !!(updates && updates.completed) };
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
    return safeParseArray(raw);
  };
  const write = (items) => {
    if (!hasWindow()) return;
    // Guard against non-array writes; always persist arrays
    const arr = Array.isArray(items) ? items : [];
    window.localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify(arr));
  };

  return {
    // PUBLIC_INTERFACE
    async getTodos() {
      return read();
    },
    // PUBLIC_INTERFACE
    async addTodo(text) {
      const items = read(); // guaranteed array
      const newItem = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        text,
        completed: false,
      };
      const next = [newItem, ...(Array.isArray(items) ? items : [])];
      write(next);
      return newItem;
    },
    // PUBLIC_INTERFACE
    async updateTodo(id, updates) {
      const items = read(); // guaranteed array
      const next = (Array.isArray(items) ? items : []).map((t) =>
        t && t.id === id ? { ...t, ...(updates || {}) } : t
      );
      write(next);
      return next.find((t) => t && t.id === id);
    },
    // PUBLIC_INTERFACE
    async deleteTodo(id) {
      const items = read(); // guaranteed array
      const next = (Array.isArray(items) ? items : []).filter((t) => t && t.id !== id);
      write(next);
      return true;
    },
    usingApi: false,
  };
}
