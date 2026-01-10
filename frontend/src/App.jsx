import React, { useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import Header from './components/Header'
import RoomList from './components/RoomList'
import Room from './components/Room'
import CreateRoomModal from './components/CreateRoomModal'
import JoinModal from './components/JoinModal'
import Stats from './components/Stats'
import './App.css'

const SOCKET_URL = import.meta.env.PROD ? '' : 'http://localhost:3001'
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'

function App() {
  const [socket, setSocket] = useState(null)
  const [rooms, setRooms] = useState([])
  const [stats, setStats] = useState({ totalRooms: 0, totalUsers: 0 })
  const [currentRoom, setCurrentRoom] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedRoomToJoin, setSelectedRoomToJoin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [movies, setMovies] = useState([])

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to server')
    })

    newSocket.on('roomCreated', (room) => {
      setRooms(prev => [room, ...prev])
      setStats(prev => ({ ...prev, totalRooms: prev.totalRooms + 1 }))
    })

    newSocket.on('roomUpdated', ({ roomId, userCount }) => {
      setRooms(prev => prev.map(room => 
        room.id === roomId ? { ...room, userCount } : room
      ))
    })

    newSocket.on('roomDeleted', ({ roomId }) => {
      setRooms(prev => prev.filter(room => room.id !== roomId))
    })

    return () => {
      newSocket.close()
    }
  }, [])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, statsRes, moviesRes] = await Promise.all([
          fetch(`${API_URL}/rooms`),
          fetch(`${API_URL}/stats`),
          fetch(`${API_URL}/movies`)
        ])

        const roomsData = await roomsRes.json()
        const statsData = await statsRes.json()
        const moviesData = await moviesRes.json()

        setRooms(roomsData.rooms)
        setStats(statsData)
        setMovies(moviesData.movies)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateRoom = async (roomData) => {
    try {
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      })

      if (!response.ok) throw new Error('Failed to create room')

      const data = await response.json()
      setCurrentUser({ id: data.userId, name: roomData.hostName })
      
      // Fetch full room details
      const roomResponse = await fetch(`${API_URL}/rooms/${data.roomId}`)
      const roomDetails = await roomResponse.json()
      
      setCurrentRoom(roomDetails)
      setShowCreateModal(false)
      
      // Join socket room
      socket?.emit('joinRoom', { roomId: data.roomId, userId: data.userId })
      
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }))
    } catch (error) {
      console.error('Error creating room:', error)
      alert('Failed to create room. Please try again.')
    }
  }

  const handleJoinRoom = async (userName) => {
    if (!selectedRoomToJoin) return

    try {
      const response = await fetch(`${API_URL}/rooms/${selectedRoomToJoin.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName })
      })

      if (!response.ok) throw new Error('Failed to join room')

      const data = await response.json()
      setCurrentUser({ id: data.userId, name: userName })
      
      // Fetch full room details
      const roomResponse = await fetch(`${API_URL}/rooms/${selectedRoomToJoin.id}`)
      const roomDetails = await roomResponse.json()
      
      setCurrentRoom(roomDetails)
      setShowJoinModal(false)
      setSelectedRoomToJoin(null)
      
      // Join socket room
      socket?.emit('joinRoom', { roomId: selectedRoomToJoin.id, userId: data.userId })
      
      setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }))
    } catch (error) {
      console.error('Error joining room:', error)
      alert('Failed to join room. Please try again.')
    }
  }

  const handleLeaveRoom = useCallback(() => {
    if (currentRoom && currentUser && socket) {
      socket.emit('leaveRoom', { roomId: currentRoom.id, userId: currentUser.id })
    }
    setCurrentRoom(null)
    setCurrentUser(null)
    setStats(prev => ({ ...prev, totalUsers: Math.max(0, prev.totalUsers - 1) }))
  }, [currentRoom, currentUser, socket])

  const handleRoomClick = (room) => {
    setSelectedRoomToJoin(room)
    setShowJoinModal(true)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <span className="logo-icon">🎬</span>
            <span className="logo-text">Flixpert</span>
          </div>
          <div className="loading-spinner"></div>
          <p>Loading movie rooms...</p>
        </div>
      </div>
    )
  }

  if (currentRoom) {
    return (
      <Room
        room={currentRoom}
        user={currentUser}
        socket={socket}
        onLeave={handleLeaveRoom}
        apiUrl={API_URL}
      />
    )
  }

  return (
    <div className="app">
      <Header onCreateRoom={() => setShowCreateModal(true)} />
      
      <main className="main-content">
        <div className="hero-section">
          <h1 className="hero-title">
            <span className="hero-line">Join the</span>
            <span className="hero-line text-gradient">Conversation</span>
          </h1>
          <p className="hero-subtitle">
            Discuss your favorite movies with fellow film enthusiasts in real-time
          </p>
        </div>

        <Stats stats={stats} />
        
        <RoomList 
          rooms={rooms} 
          onRoomClick={handleRoomClick}
          onCreateRoom={() => setShowCreateModal(true)}
        />
      </main>

      <footer className="footer">
        <p>© 2024 Flixpert. Made with 🎬 for movie lovers.</p>
      </footer>

      {showCreateModal && (
        <CreateRoomModal
          movies={movies}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
        />
      )}

      {showJoinModal && selectedRoomToJoin && (
        <JoinModal
          room={selectedRoomToJoin}
          onClose={() => {
            setShowJoinModal(false)
            setSelectedRoomToJoin(null)
          }}
          onJoin={handleJoinRoom}
        />
      )}
    </div>
  )
}

export default App

