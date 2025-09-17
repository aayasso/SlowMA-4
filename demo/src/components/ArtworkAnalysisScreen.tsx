import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Palette, Eye, AlertCircle, Droplets, BookOpen, MessageCircle, Target, Lightbulb, Search } from 'lucide-react'
import './ArtworkAnalysisScreen.css'
import apiService, { ArtworkAnalysis } from '../services/apiService'

interface ArtworkInfo extends ArtworkAnalysis {
  analysis: string
}

const ArtworkAnalysisScreen: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const imageUri = location.state?.imageUri
  const imageFile = location.state?.imageFile
  const [loading, setLoading] = useState(true)
  const [artworkInfo, setArtworkInfo] = useState<ArtworkInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasAnalyzed = useRef(false)

  useEffect(() => {
    // Prevent multiple analysis runs
    if (hasAnalyzed.current) {
      return
    }

    const analyzeArtwork = async () => {
      hasAnalyzed.current = true
      setLoading(true)
      setError(null)
      
      try {
        if (!imageFile) {
          throw new Error('No image file provided for analysis')
        }
        
        // Use real API analysis
        const analysis = await apiService.analyzeArtwork(imageFile)
        
        const artworkData: ArtworkInfo = {
          ...analysis,
          analysis: analysis.description || "Take your time to observe the artwork carefully, noticing the details, colors, and composition."
        }
        
        setArtworkInfo(artworkData)
      } catch (err) {
        console.error('Analysis error:', err)
        setError(err instanceof Error ? err.message : 'Failed to analyze artwork. Please try again.')
        setArtworkInfo(null)
      } finally {
        setLoading(false)
      }
    }

    if (imageUri && imageFile) {
      analyzeArtwork()
    } else if (!imageUri) {
      navigate('/')
    }
  }, [imageUri, imageFile])

  if (loading) {
    return (
      <div className="analysis-screen">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Analyzing artwork...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analysis-screen">
      {/* Header */}
      <div className="header">
        <button onClick={() => navigate('/')} className="back-button">
          <ArrowLeft size={24} color="#000000" />
        </button>
        <h1 className="header-title">Artwork Analysis</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="content">
        {/* Artwork Image */}
        <div className="image-container">
          <img src={imageUri} alt="Uploaded artwork" className="artwork-image" />
        </div>

        {/* Error message */}
        {error && (
          <div className="error-container">
            <AlertCircle size={20} color="#FF6B6B" />
            <span className="error-text">{error}</span>
          </div>
        )}


        {/* Artwork Analysis */}
        {artworkInfo && (
          <div className="info-container">
            <h2 className="title">Artwork Analysis</h2>
            
            {/* Analysis source and confidence */}
            <div className="analysis-meta">
              <span className="source">Source: {artworkInfo.source}</span>
              {artworkInfo.confidence && (
                <span className="confidence">
                  Confidence: {Math.round(artworkInfo.confidence * 100)}%
                </span>
              )}
            </div>
            
            <div className="section">
              <h3 className="section-title">Visual Analysis</h3>
              <p className="description">{artworkInfo.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtworkAnalysisScreen
