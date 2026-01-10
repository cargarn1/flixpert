const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage
const rooms = new Map();
const users = new Map();

// Sample movie data for room creation
const sampleMovies = [
  { id: 1, title: 'Inception', year: 2010, poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg', genre: 'Sci-Fi' },
  { id: 2, title: 'The Dark Knight', year: 2008, poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', genre: 'Action' },
  { id: 3, title: 'Pulp Fiction', year: 1994, poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', genre: 'Crime' },
  { id: 4, title: 'The Shawshank Redemption', year: 1994, poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', genre: 'Drama' },
  { id: 5, title: 'Interstellar', year: 2014, poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', genre: 'Sci-Fi' },
  { id: 6, title: 'The Matrix', year: 1999, poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', genre: 'Sci-Fi' },
  { id: 7, title: 'Fight Club', year: 1999, poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', genre: 'Drama' },
  { id: 8, title: 'Forrest Gump', year: 1994, poster: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', genre: 'Drama' }
];

// Initialize some sample rooms
function initializeSampleRooms() {
  const sampleRooms = [
    { movieId: 1, hostName: 'CinemaLover' },
    { movieId: 3, hostName: 'FilmBuff92' },
    { movieId: 5, hostName: 'SpaceExplorer' }
  ];

  sampleRooms.forEach(({ movieId, hostName }) => {
    const movie = sampleMovies.find(m => m.id === movieId);
    if (movie) {
      const roomId = uuidv4();
      const hostId = uuidv4();
      
      users.set(hostId, {
        id: hostId,
        name: hostName,
        roomId: roomId,
        joinedAt: new Date().toISOString()
      });

      rooms.set(roomId, {
        id: roomId,
        movie: movie,
        hostId: hostId,
        users: [hostId],
        messages: [
          { id: uuidv4(), userId: hostId, userName: hostName, text: `Welcome to the ${movie.title} discussion room! 🎬`, timestamp: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      });
    }
  });
}

initializeSampleRooms();

// ============== REST API ENDPOINTS ==============

// GET /api/stats - Get overall statistics
app.get('/api/stats', (req, res) => {
  const totalRooms = rooms.size;
  const totalUsers = users.size;
  
  res.json({
    totalRooms,
    totalUsers,
    timestamp: new Date().toISOString()
  });
});

// GET /api/rooms - Get all rooms with details
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    movie: room.movie,
    userCount: room.users.length,
    hostId: room.hostId,
    createdAt: room.createdAt
  }));
  
  res.json({
    rooms: roomList,
    count: roomList.length
  });
});

// GET /api/rooms/:roomId - Get specific room details
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  const roomUsers = room.users.map(userId => {
    const user = users.get(userId);
    return user ? { id: user.id, name: user.name, joinedAt: user.joinedAt } : null;
  }).filter(Boolean);
  
  res.json({
    id: room.id,
    movie: room.movie,
    users: roomUsers,
    userCount: roomUsers.length,
    messages: room.messages.slice(-50), // Last 50 messages
    createdAt: room.createdAt
  });
});

// POST /api/rooms - Create a new room
app.post('/api/rooms', (req, res) => {
  const { movieId, movieTitle, movieYear, moviePoster, movieGenre, hostName } = req.body;
  
  if (!hostName) {
    return res.status(400).json({ error: 'Host name is required' });
  }
  
  let movie;
  if (movieId) {
    movie = sampleMovies.find(m => m.id === movieId);
    if (!movie) {
      return res.status(400).json({ error: 'Invalid movie ID' });
    }
  } else if (movieTitle) {
    movie = {
      id: Date.now(),
      title: movieTitle,
      year: movieYear || new Date().getFullYear(),
      poster: moviePoster || null,
      genre: movieGenre || 'Unknown'
    };
  } else {
    return res.status(400).json({ error: 'Movie ID or movie title is required' });
  }
  
  const roomId = uuidv4();
  const hostId = uuidv4();
  
  users.set(hostId, {
    id: hostId,
    name: hostName,
    roomId: roomId,
    joinedAt: new Date().toISOString()
  });
  
  const newRoom = {
    id: roomId,
    movie: movie,
    hostId: hostId,
    users: [hostId],
    messages: [
      { id: uuidv4(), userId: hostId, userName: hostName, text: `Welcome to the ${movie.title} discussion room! 🎬`, timestamp: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString()
  };
  
  rooms.set(roomId, newRoom);
  
  // Broadcast new room to all connected clients
  io.emit('roomCreated', {
    id: newRoom.id,
    movie: newRoom.movie,
    userCount: 1,
    createdAt: newRoom.createdAt
  });
  
  res.status(201).json({
    roomId: roomId,
    userId: hostId,
    room: {
      id: newRoom.id,
      movie: newRoom.movie,
      userCount: 1,
      createdAt: newRoom.createdAt
    }
  });
});

// POST /api/rooms/:roomId/join - Join an existing room
app.post('/api/rooms/:roomId/join', (req, res) => {
  const { roomId } = req.params;
  const { userName } = req.body;
  
  if (!userName) {
    return res.status(400).json({ error: 'User name is required' });
  }
  
  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  const userId = uuidv4();
  
  users.set(userId, {
    id: userId,
    name: userName,
    roomId: roomId,
    joinedAt: new Date().toISOString()
  });
  
  room.users.push(userId);
  
  // Add join message
  const joinMessage = {
    id: uuidv4(),
    userId: 'system',
    userName: 'System',
    text: `${userName} joined the room`,
    timestamp: new Date().toISOString(),
    isSystem: true
  };
  room.messages.push(joinMessage);
  
  // Broadcast to room
  io.to(roomId).emit('userJoined', { userId, userName, userCount: room.users.length });
  io.to(roomId).emit('newMessage', joinMessage);
  
  // Broadcast updated room count to all
  io.emit('roomUpdated', { roomId, userCount: room.users.length });
  
  res.json({
    userId: userId,
    roomId: roomId,
    movie: room.movie,
    userCount: room.users.length
  });
});

// GET /api/movies - Get available movies for room creation
app.get('/api/movies', (req, res) => {
  res.json({ movies: sampleMovies });
});

// ============== SOCKET.IO FOR REAL-TIME CHAT ==============

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join a room
  socket.on('joinRoom', ({ roomId, userId }) => {
    const room = rooms.get(roomId);
    const user = users.get(userId);
    
    if (room && user) {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.userId = userId;
      console.log(`User ${user.name} joined room ${roomId}`);
    }
  });
  
  // Send a message
  socket.on('sendMessage', ({ roomId, userId, text }) => {
    const room = rooms.get(roomId);
    const user = users.get(userId);
    
    if (room && user && text.trim()) {
      const message = {
        id: uuidv4(),
        userId: userId,
        userName: user.name,
        text: text.trim(),
        timestamp: new Date().toISOString()
      };
      
      room.messages.push(message);
      io.to(roomId).emit('newMessage', message);
    }
  });
  
  // Leave room
  socket.on('leaveRoom', ({ roomId, userId }) => {
    handleUserLeave(socket, roomId, userId);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    if (socket.roomId && socket.userId) {
      handleUserLeave(socket, socket.roomId, socket.userId);
    }
    console.log('User disconnected:', socket.id);
  });
});

function handleUserLeave(socket, roomId, userId) {
  const room = rooms.get(roomId);
  const user = users.get(userId);
  
  if (room && user) {
    // Remove user from room
    room.users = room.users.filter(id => id !== userId);
    
    // Add leave message
    const leaveMessage = {
      id: uuidv4(),
      userId: 'system',
      userName: 'System',
      text: `${user.name} left the room`,
      timestamp: new Date().toISOString(),
      isSystem: true
    };
    room.messages.push(leaveMessage);
    
    io.to(roomId).emit('userLeft', { userId, userName: user.name, userCount: room.users.length });
    io.to(roomId).emit('newMessage', leaveMessage);
    io.emit('roomUpdated', { roomId, userCount: room.users.length });
    
    // Remove user from users map
    users.delete(userId);
    
    // If room is empty, optionally delete it (keeping for demo purposes)
    if (room.users.length === 0) {
      // rooms.delete(roomId);
      // io.emit('roomDeleted', { roomId });
    }
    
    socket.leave(roomId);
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎬 Flixpert Backend running on port ${PORT}`);
  console.log(`   REST API: http://localhost:${PORT}/api`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
});

