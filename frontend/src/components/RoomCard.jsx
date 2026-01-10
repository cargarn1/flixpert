import React from 'react'
import './RoomCard.css'

function RoomCard({ room, onClick, delay = 0 }) {
  const { movie, userCount, createdAt } = room
  
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000 / 60) // minutes
    
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  return (
    <article 
      className="room-card" 
      onClick={onClick}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="room-card-poster">
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} loading="lazy" />
        ) : (
          <div className="poster-placeholder">
            <span>🎬</span>
          </div>
        )}
        <div className="poster-overlay">
          <button className="join-btn">Join Discussion</button>
        </div>
        <div className="genre-badge">{movie.genre}</div>
      </div>
      
      <div className="room-card-content">
        <h3 className="movie-title">{movie.title}</h3>
        <span className="movie-year">{movie.year}</span>
        
        <div className="room-meta">
          <div className="meta-item users">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>{userCount} {userCount === 1 ? 'person' : 'people'}</span>
          </div>
          
          <div className="meta-item time">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{formatTime(createdAt)}</span>
          </div>
        </div>
      </div>
      
      <div className="room-card-glow"></div>
    </article>
  )
}

export default RoomCard

