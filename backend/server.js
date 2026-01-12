const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// TMDB API Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || '104733250bbaad9c341eabb34c007b64';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

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

// API Key for authentication
const API_KEY = process.env.API_KEY || 'flx_sk_a1b2c3d4e5f6g7h8i9j0';

// Health check endpoint (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'flixpert-api', timestamp: new Date().toISOString() });
});

// API Key authentication middleware
const authenticateApiKey = (req, res, next) => {
  // Accept API key from header OR query parameter
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required. Include x-api-key header or api_key query parameter.' });
  }
  
  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  next();
};

// Apply authentication to all /api routes except /api/health
app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  authenticateApiKey(req, res, next);
});

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
  const { movieId, movieTitle, movieYear, moviePoster, movieGenre, movieOverview, hostName } = req.body;
  
  if (!hostName) {
    return res.status(400).json({ error: 'Host name is required' });
  }
  
  let movie;
  if (movieId && typeof movieId === 'number' && movieId < 100) {
    // Check sample movies for small IDs (legacy support)
    movie = sampleMovies.find(m => m.id === movieId);
    if (!movie) {
      return res.status(400).json({ error: 'Invalid movie ID' });
    }
  } else if (movieTitle) {
    // TMDB movie or custom movie
    movie = {
      id: movieId || Date.now(),
      title: movieTitle,
      year: movieYear || new Date().getFullYear(),
      poster: moviePoster || null,
      genre: movieGenre || 'Unknown',
      overview: movieOverview || null
    };
  } else {
    return res.status(400).json({ error: 'Movie title is required' });
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

// GET /api/movies - Get available movies for room creation (fallback to sample movies)
app.get('/api/movies', (req, res) => {
  res.json({ movies: sampleMovies });
});

// GET /api/movies/search - Search movies from TMDB
app.get('/api/movies/search', async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }
  
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error('TMDB API error');
    }
    
    const data = await response.json();
    
    // Transform TMDB results to our format
    const movies = data.results.slice(0, 10).map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
      overview: movie.overview,
      rating: movie.vote_average,
      genre: 'Movie' // TMDB returns genre_ids, we'd need another call to get names
    }));
    
    res.json({ movies, total: data.total_results });
  } catch (error) {
    console.error('TMDB search error:', error);
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

// GET /api/movies/:movieId - Get movie details from TMDB
app.get('/api/movies/:movieId', async (req, res) => {
  const { movieId } = req.params;
  
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      throw new Error('TMDB API error');
    }
    
    const movie = await response.json();
    
    res.json({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
      backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}` : null,
      overview: movie.overview,
      rating: movie.vote_average,
      runtime: movie.runtime,
      genre: movie.genres?.map(g => g.name).join(', ') || 'Unknown',
      tagline: movie.tagline
    });
  } catch (error) {
    console.error('TMDB movie details error:', error);
    res.status(500).json({ error: 'Failed to get movie details' });
  }
});

// GET /api/movies/popular - Get popular movies from TMDB
app.get('/api/movies/popular', async (req, res) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      throw new Error('TMDB API error');
    }
    
    const data = await response.json();
    
    const movies = data.results.slice(0, 12).map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      poster: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
      overview: movie.overview,
      rating: movie.vote_average,
      genre: 'Movie'
    }));
    
    res.json({ movies });
  } catch (error) {
    console.error('TMDB popular movies error:', error);
    // Fallback to sample movies if TMDB fails
    res.json({ movies: sampleMovies });
  }
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

