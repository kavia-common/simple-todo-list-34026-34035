import React, { useState } from 'react';

// PUBLIC_INTERFACE
export default function TodoInput({ onAdd }) {
  /** Input form to add todos with enter key support and button click. */
  const [text, setText] = useState('');

  const submit = (e) => {
    e && e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <form className="todo-input" onSubmit={submit}>
      <input
        aria-label="Add a todo"
        type="text"
        placeholder="What needs to be done?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="btn-primary">Add</button>
    </form>
  );
}
