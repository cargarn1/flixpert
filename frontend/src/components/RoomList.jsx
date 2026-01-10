import React from 'react'
import RoomCard from './RoomCard'
import './RoomList.css'

function RoomList({ rooms, onRoomClick, onCreateRoom }) {
  if (rooms.length === 0) {
    return (
      <div className="room-list-empty">
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>No active rooms yet</h3>
          <p>Be the first to start a movie discussion!</p>
          <button className="empty-create-btn" onClick={onCreateRoom}>
            Create First Room
          </button>
        </div>
      </div>
    )
  }

  return (
    <section className="room-list-section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="title-icon">🎭</span>
          Active Rooms
        </h2>
        <span className="room-count">{rooms.length} rooms</span>
      </div>
      
      <div className="room-grid">
        {rooms.map((room, index) => (
          <RoomCard 
            key={room.id} 
            room={room} 
            onClick={() => onRoomClick(room)}
            delay={index * 0.05}
          />
        ))}
      </div>
    </section>
  )
}

export default RoomList

