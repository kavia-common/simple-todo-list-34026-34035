import React from 'react';

// PUBLIC_INTERFACE
export default function Header({ usingApi }) {
  /** Retro-styled header for the Todo app. Shows API/local badge. */
  return (
    <header className="retro-header">
      <div className="retro-title">
        <span className="dot-matrix">▦</span>
        <h1>Retro Todos</h1>
      </div>
      <div className="retro-badges">
        <span className={`badge ${usingApi ? 'badge-success' : 'badge-warn'}`}>
          {usingApi ? 'API Connected' : 'Local Storage'}
        </span>
      </div>
    </header>
  );
}
