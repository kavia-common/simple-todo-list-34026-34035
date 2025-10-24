import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './index.css';
import Header from './components/Header';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import { createStorage } from './services/storage';

// PUBLIC_INTERFACE
function App() {
  /** Main app: retro-themed todo with add/edit/delete and storage fallback. */
  const [theme, setTheme] = useState('light');
  const [storage, setStorage] = useState(null);
  const [usingApi, setUsingApi] = useState(false);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initialize storage and load todos
  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await createStorage();
      if (!mounted) return;
      setStorage(s);
      setUsingApi(!!s.usingApi);
      try {
        const data = await s.getTodos();
        if (!mounted) return;
        setTodos(Array.isArray(data) ? data : []);
      } catch {
        setTodos([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  // PUBLIC_INTERFACE
  const handleAdd = async (text) => {
    if (!storage) return;
    const created = await storage.addTodo(text);
    setTodos((prev) => [created, ...prev]);
  };

  // PUBLIC_INTERFACE
  const handleToggle = async (id, completed) => {
    if (!storage) return;
    const updated = await storage.updateTodo(id, { completed });
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  // PUBLIC_INTERFACE
  const handleDelete = async (id) => {
    if (!storage) return;
    await storage.deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // PUBLIC_INTERFACE
  const handleEdit = async (id, text) => {
    if (!storage) return;
    const updated = await storage.updateTodo(id, { text });
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const appClass = useMemo(() => `App retro-app`, []);

  return (
    <div className={appClass}>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>

      <div className="container">
        <Header usingApi={usingApi} />
        <main className="content">
          <TodoInput onAdd={handleAdd} />
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <TodoList
              todos={todos}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </main>
        <footer className="footer">
          <span>Built with ❤️ · Retro Theme</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
