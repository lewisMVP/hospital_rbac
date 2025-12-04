import React from 'react'
import './ErrorMessage.css'

// SVG Icons
const Icons = {
  alertTriangle: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  alertSmall: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  refresh: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,4 23,10 17,10"/>
      <polyline points="1,20 1,14 7,14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  )
}

const ErrorMessage = ({ error, onRetry, fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="error-fullscreen">
        <div className="error-icon">{Icons.alertTriangle}</div>
        <h2 className="error-title">Oops! Something went wrong</h2>
        <p className="error-message">{error || 'An unexpected error occurred'}</p>
        {onRetry && (
          <button className="error-retry-btn" onClick={onRetry}>
            {Icons.refresh}
            <span>Try Again</span>
          </button>
        )}
      </div>
    )
  }
  
  return (
    <div className="error-inline">
      <span className="error-icon-small">{Icons.alertSmall}</span>
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
