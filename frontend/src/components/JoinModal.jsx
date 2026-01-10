import React, { useState } from 'react'
import './Modal.css'

function JoinModal({ room, onClose, onJoin }) {
  const [userName, setUserName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!userName.trim()) {
      alert('Please enter your name')
      return
    }
    onJoin(userName.trim())
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-small" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="modal-header">
          <h2>Join Room</h2>
          <p>Enter the discussion</p>
        </div>

        <div className="modal-content">
          <div className="selected-movie-preview join-preview">
            <div className="preview-poster">
              {room.movie.poster ? (
                <img src={room.movie.poster} alt={room.movie.title} />
              ) : (
                <div className="movie-placeholder">🎬</div>
              )}
            </div>
            <div className="preview-info">
              <h3>{room.movie.title}</h3>
              <p>{room.movie.year} • {room.movie.genre}</p>
              <span className="user-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
                {room.userCount} {room.userCount === 1 ? 'person' : 'people'} in room
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="userName">Your Name</label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="Enter your display name"
                maxLength={30}
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Join Discussion
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default JoinModal

