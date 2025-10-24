import React, { useState } from 'react';

// PUBLIC_INTERFACE
export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  /** Renders a single todo item with checkbox, inline edit, and delete. */
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);

  const handleToggle = () => onToggle(todo.id, !todo.completed);

  const handleSave = () => {
    const text = draft.trim();
    if (text && text !== todo.text) onEdit(todo.id, text);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setDraft(todo.text);
      setEditing(false);
    }
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <label className="checkbox">
        <input type="checkbox" checked={!!todo.completed} onChange={handleToggle} />
        <span className="checkmark" />
      </label>

      {!editing ? (
        <span className="todo-text" onDoubleClick={() => setEditing(true)} title="Double-click to edit">
          {todo.text}
        </span>
      ) : (
        <input
          className="todo-edit"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      )}

      <div className="actions">
        <button className="btn-ghost" onClick={() => setEditing((v) => !v)}>
          {editing ? 'Save' : 'Edit'}
        </button>
        <button className="btn-danger" onClick={() => onDelete(todo.id)}>Delete</button>
      </div>
    </li>
  );
}
