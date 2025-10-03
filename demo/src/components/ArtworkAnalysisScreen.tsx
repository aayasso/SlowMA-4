import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Palette, Eye, AlertCircle, Droplets, BookOpen, MessageCircle, Target, Lightbulb, Search } from 'lucide-react'
import './ArtworkAnalysisScreen.css'
import ArtEducationService, { ArtEducationResult } from '../services/artEducationService'

type ArtworkInfo = ArtEducationResult

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

        const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            // result is data:url; extract base64
            const base64 = result.split(',')[1] || ''
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const imageBase64 = await fileToBase64(imageFile)

        // Use art education service to teach concepts and themes
        const analysis = await ArtEducationService.analyzeArtworkForEducation(imageBase64)

        setArtworkInfo(analysis)
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


        {/* Art Education Analysis */}
        {artworkInfo && (
          <div className="info-container">
            <h2 className="title">Art Education Analysis</h2>
            
            {/* Analysis source and confidence */}
            <div className="analysis-meta">
              <span className="source">Sources: {artworkInfo.sources?.join(', ') || 'Art Education'}</span>
              {artworkInfo.confidence && (
                <span className="confidence">Confidence: {Math.round(artworkInfo.confidence * 100)}%</span>
              )}
            </div>

            {/* Visual Concepts */}
            {artworkInfo.visualConcepts && (
              <div className="section">
                <h3 className="section-title">🎨 Visual Concepts</h3>
                
                {/* Composition */}
                {artworkInfo.visualConcepts.composition && (
                  <div className="subsection">
                    <h4 className="subsection-title">Composition</h4>
                    <p className="description">{artworkInfo.visualConcepts.composition.description}</p>
                    <div className="learning-points">
                      <h5>Learning Points:</h5>
                      <ul className="bullet-list">
                        {artworkInfo.visualConcepts.composition.learningPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Color */}
                {artworkInfo.visualConcepts.color && (
                  <div className="subsection">
                    <h4 className="subsection-title">Color</h4>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      {artworkInfo.visualConcepts.color.palette.map((color, i) => (
                        <div key={i} style={{ 
                          width: '30px', 
                          height: '30px', 
                          backgroundColor: color, 
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }} title={color}></div>
                      ))}
                    </div>
                    <p className="description"><strong>Harmony:</strong> {artworkInfo.visualConcepts.color.harmony}</p>
                    <p className="description"><strong>Mood:</strong> {artworkInfo.visualConcepts.color.mood}</p>
                    <div className="learning-points">
                      <h5>Learning Points:</h5>
                      <ul className="bullet-list">
                        {artworkInfo.visualConcepts.color.learningPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Form */}
                {artworkInfo.visualConcepts.form && (
                  <div className="subsection">
                    <h4 className="subsection-title">Form</h4>
                    <p className="description"><strong>Elements:</strong> {artworkInfo.visualConcepts.form.elements.join(', ')}</p>
                    <p className="description"><strong>Techniques:</strong> {artworkInfo.visualConcepts.form.techniques.join(', ')}</p>
                    <div className="learning-points">
                      <h5>Learning Points:</h5>
                      <ul className="bullet-list">
                        {artworkInfo.visualConcepts.form.learningPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Space */}
                {artworkInfo.visualConcepts.space && (
                  <div className="subsection">
                    <h4 className="subsection-title">Space</h4>
                    <p className="description"><strong>Depth:</strong> {artworkInfo.visualConcepts.space.depth}</p>
                    <p className="description"><strong>Perspective:</strong> {artworkInfo.visualConcepts.space.perspective}</p>
                    <div className="learning-points">
                      <h5>Learning Points:</h5>
                      <ul className="bullet-list">
                        {artworkInfo.visualConcepts.space.learningPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Themes */}
            {artworkInfo.themes && (
              <div className="section">
                <h3 className="section-title">🎭 Themes & Meaning</h3>
                <p className="description"><strong>Primary Themes:</strong> {artworkInfo.themes.primary.join(', ')}</p>
                <p className="description"><strong>Emotional Tone:</strong> {artworkInfo.themes.emotional}</p>
                <p className="description"><strong>Cultural Context:</strong> {artworkInfo.themes.cultural.join(', ')}</p>
                <div className="learning-points">
                  <h5>Understanding Themes:</h5>
                  <ul className="bullet-list">
                    {artworkInfo.themes.learningPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Techniques */}
            {artworkInfo.techniques && (
              <div className="section">
                <h3 className="section-title">🖌️ Techniques & Skills</h3>
                <p className="description"><strong>Identified Techniques:</strong> {artworkInfo.techniques.identified.join(', ')}</p>
                <div className="learning-points">
                  <h5>Educational Techniques:</h5>
                  <ul className="bullet-list">
                    {artworkInfo.techniques.educational.map((technique, i) => (
                      <li key={i}>{technique}</li>
                    ))}
                  </ul>
                </div>
                <div className="learning-points">
                  <h5>Examples to Study:</h5>
                  <ul className="bullet-list">
                    {artworkInfo.techniques.examples.map((example, i) => (
                      <li key={i}>{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Learning Journey */}
            {artworkInfo.learningJourney && (
              <div className="section">
                <h3 className="section-title">📚 Your Learning Journey</h3>
                
                <div className="subsection">
                  <h4 className="subsection-title">👁️ Observe</h4>
                  <ul className="bullet-list">
                    {artworkInfo.learningJourney.observation.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="subsection">
                  <h4 className="subsection-title">🔍 Analyze</h4>
                  <ul className="bullet-list">
                    {artworkInfo.learningJourney.analysis.map((question, i) => (
                      <li key={i}>{question}</li>
                    ))}
                  </ul>
                </div>

                <div className="subsection">
                  <h4 className="subsection-title">💭 Interpret</h4>
                  <ul className="bullet-list">
                    {artworkInfo.learningJourney.interpretation.map((question, i) => (
                      <li key={i}>{question}</li>
                    ))}
                  </ul>
                </div>

                <div className="subsection">
                  <h4 className="subsection-title">🔗 Connect</h4>
                  <ul className="bullet-list">
                    {artworkInfo.learningJourney.connection.map((question, i) => (
                      <li key={i}>{question}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtworkAnalysisScreen
