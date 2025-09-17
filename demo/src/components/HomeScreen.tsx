import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Upload, Palette, Eye, Settings } from 'lucide-react'
import './HomeScreen.css'

const HomeScreen: React.FC = () => {
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSelectedImage(result)
        // Navigate to analysis screen with both image URI and file
        navigate('/analysis', { 
          state: { 
            imageUri: result,
            imageFile: file
          } 
        })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="home-screen">
      {/* Header with house icon and settings */}
      <div className="header">
        <Home size={32} color="#2196F3" />
        <button 
          onClick={() => navigate('/api-status')} 
          className="settings-button"
          title="API Status"
        >
          <Settings size={24} color="#2196F3" />
        </button>
      </div>

      {/* Welcome text */}
      <div className="welcome-container">
        <h1 className="welcome-text">Welcome to Slow Look</h1>
      </div>

      {/* Level section */}
      <div className="level-container">
        <span className="level-label">Slow Look level</span>
        <div className="level-badge">
          <span className="level-number">3</span>
          <span className="level-text">LEVEL</span>
        </div>
      </div>

      {/* Upload button */}
      <div className="upload-container">
        <label htmlFor="image-upload" className="upload-button">
          <Upload size={24} color="#2196F3" />
          <span className="upload-text">Upload new artwork</span>
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Recent uploads or placeholder */}
      {selectedImage && (
        <div className="recent-container">
          <span className="recent-label">Recent upload:</span>
          <img src={selectedImage} alt="Recent upload" className="recent-image" />
        </div>
      )}

      {/* Demo features */}
      <div className="demo-features">
        <h3 className="demo-title">Demo Features</h3>
        <div className="feature-list">
          <div className="feature-item">
            <Palette size={16} color="#2196F3" />
            <span>AI-powered artwork analysis</span>
          </div>
          <div className="feature-item">
            <Eye size={16} color="#2196F3" />
            <span>Educational content about art techniques</span>
          </div>
          <div className="feature-item">
            <Home size={16} color="#2196F3" />
            <span>Level progression system</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
