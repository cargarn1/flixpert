import React from 'react'
import './Stats.css'

function Stats({ stats }) {
  return (
    <div className="stats-container">
      <div className="stat-card">
        <div className="stat-icon">🎭</div>
        <div className="stat-info">
          <span className="stat-value">{stats.totalRooms}</span>
          <span className="stat-label">Active Rooms</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-info">
          <span className="stat-value">{stats.totalUsers}</span>
          <span className="stat-label">Users Online</span>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">💬</div>
        <div className="stat-info">
          <span className="stat-value">∞</span>
          <span className="stat-label">Discussions</span>
        </div>
      </div>
    </div>
  )
}

export default Stats

