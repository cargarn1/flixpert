import React, { useState } from 'react'
import './Modal.css'

function CreateRoomModal({ movies, onClose, onCreate }) {
  const [step, setStep] = useState(1)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [customMovie, setCustomMovie] = useState({ title: '', year: '', genre: '' })
  const [hostName, setHostName] = useState('')
  const [useCustomMovie, setUseCustomMovie] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!hostName.trim()) {
      alert('Please enter your name')
      return
    }

    if (useCustomMovie) {
      if (!customMovie.title.trim()) {
        alert('Please enter a movie title')
        return
      }
      onCreate({
        movieTitle: customMovie.title,
        movieYear: customMovie.year || new Date().getFullYear(),
        movieGenre: customMovie.genre || 'Unknown',
        hostName: hostName.trim()
      })
    } else {
      if (!selectedMovie) {
        alert('Please select a movie')
        return
      }
      onCreate({
        movieId: selectedMovie.id,
        hostName: hostName.trim()
      })
    }
  }

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie)
    setUseCustomMovie(false)
    setStep(2)
  }

  const handleCustomMovieSelect = () => {
    setSelectedMovie(null)
    setUseCustomMovie(true)
    setStep(2)
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
              <h3>Select a Movie</h3>
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

              <div className="custom-movie-divider">
                <span>or</span>
              </div>

              <button 
                type="button" 
                className="custom-movie-btn"
                onClick={handleCustomMovieSelect}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Custom Movie
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form className="modal-content" onSubmit={handleSubmit}>
            {useCustomMovie && (
              <div className="custom-movie-form">
                <h3>Movie Details</h3>
                <div className="form-group">
                  <label htmlFor="movieTitle">Movie Title *</label>
                  <input
                    type="text"
                    id="movieTitle"
                    value={customMovie.title}
                    onChange={e => setCustomMovie({ ...customMovie, title: e.target.value })}
                    placeholder="Enter movie title"
                    autoFocus
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="movieYear">Year</label>
                    <input
                      type="number"
                      id="movieYear"
                      value={customMovie.year}
                      onChange={e => setCustomMovie({ ...customMovie, year: e.target.value })}
                      placeholder="2024"
                      min="1900"
                      max="2030"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="movieGenre">Genre</label>
                    <input
                      type="text"
                      id="movieGenre"
                      value={customMovie.genre}
                      onChange={e => setCustomMovie({ ...customMovie, genre: e.target.value })}
                      placeholder="Drama, Action..."
                    />
                  </div>
                </div>
              </div>
            )}

            {!useCustomMovie && selectedMovie && (
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
                  <p>{selectedMovie.year} • {selectedMovie.genre}</p>
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
                  autoFocus={!useCustomMovie}
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

