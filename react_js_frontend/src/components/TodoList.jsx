import React from 'react';
import TodoItem from './TodoItem';

// PUBLIC_INTERFACE
export default function TodoList({ todos, onToggle, onDelete, onEdit }) {
  /** Displays a list of TodoItem components or an empty state message. */
  if (!todos || todos.length === 0) {
    return <div className="empty">No tasks yet. Add your first todo!</div>;
  }

  return (
    <ul className="todo-list">
      {todos.map((t) => (
        <TodoItem
          key={t.id}
          todo={t}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}
