import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Palette, Eye, AlertCircle, Droplets, BookOpen, MessageCircle, Target, Lightbulb, Search } from 'lucide-react'
import './ArtworkAnalysisScreen.css'
import SimplifiedOptimizedService, { SimplifiedEducationalAnalysis } from '../services/simplifiedOptimizedService'
// Note: comprehensive service is large and optional; load it dynamically only if enabled

type ArtworkInfo = SimplifiedEducationalAnalysis

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

        // Use real API pipeline when enabled via env, otherwise fallback to simplified
        const useRealApis = import.meta.env.VITE_USE_REAL_APIS === 'true'
        let analysis
        
        if (useRealApis) {
          try {
            const mod = await import('../services/comprehensiveEducationalService')
            analysis = await mod.default.analyzeArtworkComprehensively(imageBase64)
          } catch (realApiError) {
            console.warn('Real API analysis failed, falling back to simplified:', realApiError)
            analysis = await SimplifiedOptimizedService.analyzeArtworkSimplified(imageBase64)
          }
        } else {
          analysis = await SimplifiedOptimizedService.analyzeArtworkSimplified(imageBase64)
        }

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


        {/* Artwork Analysis */}
        {artworkInfo && (
          <div className="info-container">
            <h2 className="title">Artwork Analysis</h2>
            
            {/* Analysis source and confidence */}
            <div className="analysis-meta">
              <span className="source">Sources: {artworkInfo.sources?.join(', ') || 'Multiple'}</span>
              {artworkInfo.confidence && (
                <span className="confidence">Confidence: {Math.round(artworkInfo.confidence * 100)}%</span>
              )}
            </div>

            {/* Style Analysis */}
            {artworkInfo.styleAnalysis && (
              <div className="section">
                <h3 className="section-title">Style Analysis</h3>
                <p className="description"><strong>Primary Style:</strong> {artworkInfo.styleAnalysis.primaryStyle}</p>
                {artworkInfo.styleAnalysis.styleCharacteristics?.length > 0 && (
                  <div className="subsection">
                    <h4 className="subsection-title">Characteristics</h4>
                    <ul className="bullet-list">
                      {artworkInfo.styleAnalysis.styleCharacteristics.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {artworkInfo.styleAnalysis.educationalInsights?.length > 0 && (
                  <div className="subsection">
                    <h4 className="subsection-title">Educational Insights</h4>
                    <ul className="bullet-list">
                      {artworkInfo.styleAnalysis.educationalInsights.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Technique Analysis */}
            {artworkInfo.techniqueAnalysis && (
              <div className="section">
                <h3 className="section-title">Technique Analysis</h3>
                {artworkInfo.techniqueAnalysis.primaryTechniques?.length > 0 && (
                  <div className="subsection">
                    <h4 className="subsection-title">Primary Techniques</h4>
                    <ul className="bullet-list">
                      {artworkInfo.techniqueAnalysis.primaryTechniques.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {artworkInfo.techniqueAnalysis.educationalValue?.length > 0 && (
                  <div className="subsection">
                    <h4 className="subsection-title">Educational Value</h4>
                    <ul className="bullet-list">
                      {artworkInfo.techniqueAnalysis.educationalValue.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Color Analysis */}
            {artworkInfo.colorAnalysis && (
              <div className="section">
                <h3 className="section-title">Color Analysis</h3>
                {artworkInfo.colorAnalysis.colorHarmony && (
                  <p className="description"><strong>Harmony:</strong> {artworkInfo.colorAnalysis.colorHarmony}</p>
                )}
                {artworkInfo.colorAnalysis.emotionalImpact && (
                  <p className="description"><strong>Emotional Impact:</strong> {artworkInfo.colorAnalysis.emotionalImpact}</p>
                )}
                {artworkInfo.colorAnalysis.colorTheory?.length > 0 && (
                  <div className="subsection">
                    <h4 className="subsection-title">Color Theory</h4>
                    <ul className="bullet-list">
                      {artworkInfo.colorAnalysis.colorTheory.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Artistic Movements */}
            {artworkInfo.artisticMovements?.length > 0 && (
              <div className="section">
                <h3 className="section-title">Artistic Movements</h3>
                <ul className="bullet-list">
                  {artworkInfo.artisticMovements.map((m, i) => (
                    <li key={i}><strong>{m.name}</strong> — {m.timePeriod}. {m.educationalRelevance}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Visual Elements */}
            {artworkInfo.visualElements?.length > 0 && (
              <div className="section">
                <h3 className="section-title">Visual Elements</h3>
                <ul className="bullet-list">
                  {artworkInfo.visualElements.map((e, i) => (
                    <li key={i}><strong>{e.element}:</strong> {e.description} — {e.educationalValue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Historical Context */}
            {artworkInfo.historicalContext && (
              <div className="section">
                <h3 className="section-title">Historical Context</h3>
                <p className="description"><strong>Time Period:</strong> {artworkInfo.historicalContext.timePeriod}</p>
                <p className="description"><strong>Cultural Background:</strong> {artworkInfo.historicalContext.culturalBackground}</p>
                <p className="description"><strong>Artistic Climate:</strong> {artworkInfo.historicalContext.artisticClimate}</p>
              </div>
            )}

            {/* Key Concepts & Vocabulary */}
            {artworkInfo.learningResources && (
              <div className="section">
                <h3 className="section-title">Key Concepts & Vocabulary</h3>
                {artworkInfo.learningResources.keyConcepts?.length > 0 && (
                  <div className="subsection">
                    <h4 className="subsection-title">Key Concepts</h4>
                    <ul className="bullet-list">
                      {artworkInfo.learningResources.keyConcepts.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {artworkInfo.learningResources.vocabulary?.length > 0 && (
                  <div className="subsection">
                    <h4 className="subsection-title">Vocabulary</h4>
                    <ul className="bullet-list">
                      {artworkInfo.learningResources.vocabulary.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtworkAnalysisScreen
