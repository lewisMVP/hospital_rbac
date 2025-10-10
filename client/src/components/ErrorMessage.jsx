import React from 'react'
import './ErrorMessage.css'

const ErrorMessage = ({ error, onRetry, fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="error-fullscreen">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Oops! Something went wrong</h2>
        <p className="error-message">{error || 'An unexpected error occurred'}</p>
        {onRetry && (
          <button className="error-retry-btn" onClick={onRetry}>
            <span>🔄</span>
            <span>Try Again</span>
          </button>
        )}
      </div>
    )
  }
  
  return (
    <div className="error-inline">
      <span className="error-icon-small">⚠️</span>
      <span className="error-text">{error || 'Failed to load data'}</span>
      {onRetry && (
        <button className="error-retry-btn-small" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
