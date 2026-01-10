import React, { useState, useEffect, useRef } from 'react'
import './Room.css'

function Room({ room, user, socket, onLeave, apiUrl }) {
  const [messages, setMessages] = useState(room.messages || [])
  const [users, setUsers] = useState(room.users || [])
  const [newMessage, setNewMessage] = useState('')
  const [userCount, setUserCount] = useState(room.userCount || 1)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!socket) return

    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message])
    })

    socket.on('userJoined', ({ userId, userName, userCount: count }) => {
      setUserCount(count)
      setUsers(prev => [...prev, { id: userId, name: userName }])
    })

    socket.on('userLeft', ({ userId, userName, userCount: count }) => {
      setUserCount(count)
      setUsers(prev => prev.filter(u => u.id !== userId))
    })

    return () => {
      socket.off('newMessage')
      socket.off('userJoined')
      socket.off('userLeft')
    }
  }, [socket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket) return

    socket.emit('sendMessage', {
      roomId: room.id,
      userId: user.id,
      text: newMessage.trim()
    })

    setNewMessage('')
    inputRef.current?.focus()
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="room-container">
      {/* Sidebar */}
      <aside className="room-sidebar">
        <div className="sidebar-header">
          <button className="back-btn" onClick={onLeave}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Leave Room
          </button>
        </div>

        <div className="movie-info">
          <div className="movie-poster-container">
            {room.movie.poster ? (
              <img src={room.movie.poster} alt={room.movie.title} className="movie-poster" />
            ) : (
              <div className="poster-placeholder-large">🎬</div>
            )}
          </div>
          <h2 className="movie-title">{room.movie.title}</h2>
          <p className="movie-meta">{room.movie.year} • {room.movie.genre}</p>
        </div>

        <div className="room-users">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            In Room ({userCount})
          </h3>
          <ul className="user-list">
            {users.map((u, index) => (
              <li key={u.id || index} className={u.id === user.id ? 'current-user' : ''}>
                <span className="user-avatar">
                  {u.name?.charAt(0).toUpperCase() || '?'}
                </span>
                <span className="user-name">
                  {u.name}
                  {u.id === user.id && <span className="you-badge">you</span>}
                </span>
                <span className="user-status online"></span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="room-main">
        <header className="chat-header">
          <div className="chat-header-info">
            <h1>{room.movie.title}</h1>
            <span className="chat-subtitle">Movie Discussion Room</span>
          </div>
          <div className="chat-header-actions">
            <span className="online-indicator">
              <span className="pulse"></span>
              {userCount} online
            </span>
          </div>
        </header>

        <div className="messages-container">
          <div className="messages-list">
            {messages.map((message, index) => (
              <div 
                key={message.id || index}
                className={`message ${message.isSystem ? 'system' : ''} ${message.userId === user.id ? 'own' : ''}`}
              >
                {message.isSystem ? (
                  <div className="system-message">
                    <span>{message.text}</span>
                  </div>
                ) : (
                  <>
                    {message.userId !== user.id && (
                      <div className="message-avatar">
                        {message.userName?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="message-content">
                      {message.userId !== user.id && (
                        <span className="message-author">{message.userName}</span>
                      )}
                      <div className="message-bubble">
                        <p>{message.text}</p>
                      </div>
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form className="message-form" onSubmit={handleSendMessage}>
          <div className="message-input-container">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your thoughts about the movie..."
              maxLength={500}
              autoFocus
            />
            <button type="submit" disabled={!newMessage.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default Room

