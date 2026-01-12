import React, { useState, useEffect, useCallback } from 'react'
import './Modal.css'

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'
const API_KEY = 'flx_sk_a1b2c3d4e5f6g7h8i9j0'

const authFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    }
  })
}

function CreateRoomModal({ movies, onClose, onCreate }) {
  const [step, setStep] = useState(1)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [hostName, setHostName] = useState('')
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await authFetch(`${API_URL}/movies/search?query=${encodeURIComponent(searchQuery)}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.movies || [])
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!hostName.trim()) {
      alert('Please enter your name')
      return
    }

    if (!selectedMovie) {
      alert('Please select a movie')
      return
    }

    onCreate({
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      movieYear: selectedMovie.year,
      moviePoster: selectedMovie.poster,
      movieGenre: selectedMovie.genre,
      movieOverview: selectedMovie.overview,
      hostName: hostName.trim()
    })
  }

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie)
    setStep(2)
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([])
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="modal-header">
          <h2>Create a Room</h2>
          <p>Start a discussion about your favorite movie</p>
        </div>

        <div className="modal-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Choose Movie</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Your Details</span>
          </div>
        </div>

        {step === 1 && (
          <div className="modal-content">
            <div className="movie-selection">
              {/* Search Section */}
              <div className="search-section">
                <h3>🔍 Search Movies</h3>
                <div className="search-input-container">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowSearch(true)
                    }}
                    placeholder="Search for any movie..."
                    className="search-input"
                    autoFocus
                  />
                  {isSearching && <div className="search-spinner"></div>}
                </div>
                
                {/* Search Results */}
                {showSearch && searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map(movie => (
                      <div 
                        key={movie.id}
                        className="search-result-item"
                        onClick={() => handleMovieSelect(movie)}
                      >
                        <div className="search-result-poster">
                          {movie.poster ? (
                            <img src={movie.poster} alt={movie.title} />
                          ) : (
                            <div className="poster-placeholder-small">🎬</div>
                          )}
                        </div>
                        <div className="search-result-info">
                          <span className="search-result-title">{movie.title}</span>
                          <span className="search-result-year">{movie.year}</span>
                          {movie.overview && (
                            <p className="search-result-overview">
                              {movie.overview.length > 100 
                                ? movie.overview.substring(0, 100) + '...' 
                                : movie.overview}
                            </p>
                          )}
                        </div>
                        {movie.rating > 0 && (
                          <div className="search-result-rating">
                            ⭐ {movie.rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {showSearch && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                  <div className="no-results">No movies found for "{searchQuery}"</div>
                )}
              </div>

              <div className="custom-movie-divider">
                <span>or choose from popular</span>
              </div>

              {/* Popular Movies Grid */}
              <div className="movie-grid">
                {movies.map(movie => (
                  <div 
                    key={movie.id}
                    className={`movie-option ${selectedMovie?.id === movie.id ? 'selected' : ''}`}
                    onClick={() => handleMovieSelect(movie)}
                  >
                    {movie.poster ? (
                      <img src={movie.poster} alt={movie.title} />
                    ) : (
                      <div className="movie-placeholder">🎬</div>
                    )}
                    <div className="movie-option-info">
                      <span className="movie-option-title">{movie.title}</span>
                      <span className="movie-option-year">{movie.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <form className="modal-content" onSubmit={handleSubmit}>
            {selectedMovie && (
              <div className="selected-movie-preview">
                <div className="preview-poster">
                  {selectedMovie.poster ? (
                    <img src={selectedMovie.poster} alt={selectedMovie.title} />
                  ) : (
                    <div className="movie-placeholder">🎬</div>
                  )}
                </div>
                <div className="preview-info">
                  <h3>{selectedMovie.title}</h3>
                  <p>{selectedMovie.year} {selectedMovie.genre && `• ${selectedMovie.genre}`}</p>
                  {selectedMovie.overview && (
                    <p className="movie-overview">
                      {selectedMovie.overview.length > 150 
                        ? selectedMovie.overview.substring(0, 150) + '...' 
                        : selectedMovie.overview}
                    </p>
                  )}
                </div>
                <button 
                  type="button" 
                  className="change-movie-btn"
                  onClick={() => setStep(1)}
                >
                  Change
                </button>
              </div>
            )}

            <div className="host-details">
              <h3>Your Details</h3>
              <div className="form-group">
                <label htmlFor="hostName">Your Name *</label>
                <input
                  type="text"
                  id="hostName"
                  value={hostName}
                  onChange={e => setHostName(e.target.value)}
                  placeholder="Enter your display name"
                  maxLength={30}
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="submit" className="btn-primary">
                Create Room
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CreateRoomModal
