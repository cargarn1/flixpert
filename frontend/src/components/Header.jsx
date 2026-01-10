import React from 'react'
import './Header.css'

function Header({ onCreateRoom }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">Flixpert</span>
        </div>
        
        <nav className="nav">
          <button className="create-room-btn" onClick={onCreateRoom}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Room
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header

