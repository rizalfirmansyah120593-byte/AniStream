import React from 'react'
import './style.css'
import { Play } from 'lucide-react'

interface LoadingProps {
  variant?: 'default' | 'fullscreen' | 'inline' | 'skeleton'
  text?: string
}

const Loading = ({ variant = 'default', text }: LoadingProps) => {
  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="netflix-loader">
          <div className="logo-container">
            <Play className="logo-icon" />
            <span className="logo-text">AniStream</span>
          </div>
          <div className="loading-bar">
            <div className="loading-bar-inner"></div>
          </div>
        </div>
        {text && <p className="loading-text">{text}</p>}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="inline-loader">
        <div className="spinner"></div>
        {text && <span className="ml-2 text-gray-400 text-sm">{text}</span>}
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className="skeleton-loader">
        <div className="skeleton-image"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
      </div>
    )
  }

  // Default variant
  return (
    <div className="default-loader">
      <div className="pulse-container">
        <Play className="pulse-icon" />
      </div>
      <div className="wave-text">
        {'AniStream'.split('').map((char, index) => (
          <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
            {char}
          </span>
        ))}
      </div>
      {text && <p className="loading-subtext">{text}</p>}
    </div>
  )
}

export default Loading