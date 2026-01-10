# 🎬 Flixpert

A real-time movie discussion platform where film enthusiasts can create and join rooms to discuss their favorite movies.

![Flixpert](https://img.shields.io/badge/Flixpert-Movie%20Discussions-ff6b35?style=for-the-badge)

## Features

- **Create Discussion Rooms** - Start a room for any movie and invite others to join
- **Join Existing Rooms** - Browse active rooms and join conversations
- **Real-time Chat** - Instant messaging with Socket.IO
- **Beautiful UI** - Modern, cinematic design with smooth animations
- **Live Statistics** - See active rooms and online users in real-time

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Socket.IO** for real-time communication
- **In-memory storage** (easily extendable to a database)

### Frontend
- **React 18** with Vite
- **Socket.IO Client** for real-time updates
- **CSS3** with custom properties and animations
- **Google Fonts** (Bebas Neue, Outfit)

## API Endpoints

### Statistics
```
GET /api/stats
```
Returns total rooms and total users online.

### Rooms
```
GET /api/rooms
```
Get all active rooms with details.

```
GET /api/rooms/:roomId
```
Get specific room details including users and messages.

```
POST /api/rooms
```
Create a new room.

**Body:**
```json
{
  "movieId": 1,           // OR use custom movie fields below
  "movieTitle": "Movie Name",
  "movieYear": 2024,
  "movieGenre": "Drama",
  "hostName": "YourName"
}
```

```
POST /api/rooms/:roomId/join
```
Join an existing room.

**Body:**
```json
{
  "userName": "YourName"
}
```

### Movies
```
GET /api/movies
```
Get available movies for room creation.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd Flixpert
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Start the backend server** (Terminal 1)
```bash
cd backend
npm start
```
The API will be available at `http://localhost:3001`

2. **Start the frontend development server** (Terminal 2)
```bash
cd frontend
npm run dev
```
The app will be available at `http://localhost:3000`

### Production Build

```bash
cd frontend
npm run build
```

## Project Structure

```
Flixpert/
├── backend/
│   ├── server.js          # Express server with Socket.IO
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Stats.jsx
│   │   │   ├── RoomList.jsx
│   │   │   ├── RoomCard.jsx
│   │   │   ├── Room.jsx
│   │   │   ├── CreateRoomModal.jsx
│   │   │   └── JoinModal.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Socket.IO Events

### Client → Server
- `joinRoom` - Join a room's chat
- `sendMessage` - Send a message to the room
- `leaveRoom` - Leave the current room

### Server → Client
- `newMessage` - New message in the room
- `userJoined` - A user joined the room
- `userLeft` - A user left the room
- `roomCreated` - A new room was created
- `roomUpdated` - Room user count changed
- `roomDeleted` - A room was deleted

## Screenshots

The app features:
- 🎭 Cinematic dark theme with orange accents
- 🎬 Movie poster cards with hover effects
- 💬 Real-time chat with message bubbles
- 📊 Live statistics dashboard
- 🎨 Smooth animations and transitions

## License

MIT License - feel free to use this project for learning or building your own movie discussion platform!

---

Made with 🎬 for movie lovers

