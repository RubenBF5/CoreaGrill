import React from 'react'

const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'loader-sm',
    md: 'loader-md',
    lg: 'loader-lg'
  }
  
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className={`loader ${sizes[size]}`}>
          <div className="loader-spinner"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`loader ${sizes[size]}`}>
      <div className="loader-spinner"></div>
    </div>
  )
}

export default Loader