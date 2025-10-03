// Simplified Artwork Analysis Screen
// Focuses on rich educational information without user questions or skill levels

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import SimplifiedOptimizedService, { 
  SimplifiedEducationalAnalysis,
  ArtworkType 
} from '../services/simplifiedOptimizedService'

interface SimplifiedArtworkAnalysisScreenProps {
  imageBase64: string
  onAnalysisComplete?: (analysis: SimplifiedEducationalAnalysis) => void
}

const SimplifiedArtworkAnalysisScreen: React.FC<SimplifiedArtworkAnalysisScreenProps> = ({
  imageBase64,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<SimplifiedEducationalAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [artworkType, setArtworkType] = useState<ArtworkType | null>(null)

  useEffect(() => {
    if (imageBase64) {
      performAnalysis()
    }
  }, [imageBase64])

  const performAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🎓 Starting simplified educational analysis...')
      
      const result = await SimplifiedOptimizedService.analyzeArtworkSimplified(imageBase64)
      
      setAnalysis(result)
      setArtworkType(result.artworkType)
      
      console.log('✅ Analysis complete:', result)
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result)
      }
    } catch (err) {
      console.error('❌ Analysis failed:', err)
      setError('Failed to analyze artwork. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderArtworkTypeInfo = () => {
    if (!artworkType) return null

    return (
      <View style={styles.artworkTypeInfo}>
        <Text style={styles.artworkTypeTitle}>Artwork Type Detected</Text>
        <Text style={styles.artworkTypeText}>
          {artworkType.type.charAt(0).toUpperCase() + artworkType.type.slice(1)} 
          (Confidence: {Math.round(artworkType.confidence * 100)}%)
        </Text>
        <Text style={styles.artworkTypeCharacteristics}>
          Characteristics: {artworkType.characteristics.join(', ')}
        </Text>
      </View>
    )
  }

  const renderStyleAnalysis = () => {
    if (!analysis?.styleAnalysis) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Style Analysis</Text>
        
        <Text style={styles.subsectionTitle}>Primary Style</Text>
        <Text style={styles.contentText}>{analysis.styleAnalysis.primaryStyle}</Text>
        
        <Text style={styles.subsectionTitle}>Style Characteristics</Text>
        {analysis.styleAnalysis.styleCharacteristics.map((characteristic, index) => (
          <Text key={index} style={styles.bulletText}>• {characteristic}</Text>
        ))}
        
        <Text style={styles.subsectionTitle}>Movement Context</Text>
        <Text style={styles.contentText}>{analysis.styleAnalysis.movementContext}</Text>
        
        <Text style={styles.subsectionTitle}>Educational Insights</Text>
        {analysis.styleAnalysis.educationalInsights.map((insight, index) => (
          <Text key={index} style={styles.bulletText}>• {insight}</Text>
        ))}
        
        <Text style={styles.subsectionTitle}>Historical Significance</Text>
        <Text style={styles.contentText}>{analysis.styleAnalysis.historicalSignificance}</Text>
        
        <Text style={styles.subsectionTitle}>Cultural Context</Text>
        <Text style={styles.contentText}>{analysis.styleAnalysis.culturalContext}</Text>
      </View>
    )
  }

  const renderTechniqueAnalysis = () => {
    if (!analysis?.techniqueAnalysis) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Technique Analysis</Text>
        
        <Text style={styles.subsectionTitle}>Primary Techniques</Text>
        {analysis.techniqueAnalysis.primaryTechniques.map((technique, index) => (
          <Text key={index} style={styles.bulletText}>• {technique}</Text>
        ))}
        
        <Text style={styles.subsectionTitle}>Material Properties</Text>
        {analysis.techniqueAnalysis.materialProperties.map((property, index) => (
          <Text key={index} style={styles.bulletText}>• {property}</Text>
        ))}
        
        <Text style={styles.subsectionTitle}>Technical Innovations</Text>
        {analysis.techniqueAnalysis.technicalInnovations.map((innovation, index) => (
          <Text key={index} style={styles.bulletText}>• {innovation}</Text>
        ))}
        
        <Text style={styles.subsectionTitle}>Educational Value</Text>
        {analysis.techniqueAnalysis.educationalValue.map((value, index) => (
          <Text key={index} style={styles.bulletText}>• {value}</Text>
        ))}
      </View>
    )
  }

  const renderColorAnalysis = () => {
    if (!analysis?.colorAnalysis) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color Analysis</Text>
        
        <Text style={styles.subsectionTitle}>Color Palette</Text>
        {analysis.colorAnalysis.colorPalette.map((color, index) => (
          <View key={index} style={styles.colorItem}>
            <View style={[styles.colorSwatch, { backgroundColor: color.hex }]} />
            <View style={styles.colorInfo}>
              <Text style={styles.colorName}>{color.name} ({color.percentage}%)</Text>
              <Text style={styles.colorEmotion}>{color.emotionalAssociation}</Text>
              <Text style={styles.colorSymbolic}>{color.symbolicMeaning}</Text>
              <Text style={styles.colorEducational}>{color.educationalNote}</Text>
            </View>
          </View>
        ))}
        
        <Text style={styles.subsectionTitle}>Color Harmony</Text>
        <Text style={styles.contentText}>{analysis.colorAnalysis.colorHarmony}</Text>
        
        <Text style={styles.subsectionTitle}>Emotional Impact</Text>
        <Text style={styles.contentText}>{analysis.colorAnalysis.emotionalImpact}</Text>
        
        <Text style={styles.subsectionTitle}>Color Theory</Text>
        {analysis.colorAnalysis.colorTheory.map((theory, index) => (
          <Text key={index} style={styles.bulletText}>• {theory}</Text>
        ))}
      </View>
    )
  }

  const renderArtisticMovements = () => {
    if (!analysis?.artisticMovements) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Artistic Movements</Text>
        
        {analysis.artisticMovements.map((movement, index) => (
          <View key={index} style={styles.movementItem}>
            <Text style={styles.movementName}>{movement.name}</Text>
            <Text style={styles.movementPeriod}>{movement.timePeriod}</Text>
            <Text style={styles.movementCharacteristics}>
              Characteristics: {movement.characteristics.join(', ')}
            </Text>
            <Text style={styles.movementArtists}>
              Key Artists: {movement.keyArtists.join(', ')}
            </Text>
            <Text style={styles.movementContext}>{movement.culturalContext}</Text>
            <Text style={styles.movementRelevance}>{movement.educationalRelevance}</Text>
          </View>
        ))}
      </View>
    )
  }

  const renderVisualElements = () => {
    if (!analysis?.visualElements) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visual Elements</Text>
        
        {analysis.visualElements.map((element, index) => (
          <View key={index} style={styles.elementItem}>
            <Text style={styles.elementName}>{element.element}</Text>
            <Text style={styles.elementDescription}>{element.description}</Text>
            <Text style={styles.elementValue}>{element.educationalValue}</Text>
            <Text style={styles.elementTips}>
              Observation Tips: {element.observationTips.join('; ')}
            </Text>
            <Text style={styles.elementConcepts}>
              Related Concepts: {element.relatedConcepts.join('; ')}
            </Text>
          </View>
        ))}
      </View>
    )
  }

  const renderHistoricalContext = () => {
    if (!analysis?.historicalContext) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historical Context</Text>
        
        <Text style={styles.subsectionTitle}>Time Period</Text>
        <Text style={styles.contentText}>{analysis.historicalContext.timePeriod}</Text>
        
        <Text style={styles.subsectionTitle}>Cultural Background</Text>
        <Text style={styles.contentText}>{analysis.historicalContext.culturalBackground}</Text>
        
        <Text style={styles.subsectionTitle}>Artistic Climate</Text>
        <Text style={styles.contentText}>{analysis.historicalContext.artisticClimate}</Text>
        
        <Text style={styles.subsectionTitle}>Social Influences</Text>
        {analysis.historicalContext.socialInfluences.map((influence, index) => (
          <Text key={index} style={styles.bulletText}>• {influence}</Text>
        ))}
        
        <Text style={styles.subsectionTitle}>Educational Significance</Text>
        <Text style={styles.contentText}>{analysis.historicalContext.educationalSignificance}</Text>
      </View>
    )
  }

  const renderLearningResources = () => {
    if (!analysis?.learningResources) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Resources</Text>
        
        <Text style={styles.subsectionTitle}>Key Concepts</Text>
        {analysis.learningResources.keyConcepts.map((concept, index) => (
          <Text key={index} style={styles.bulletText}>• {concept}</Text>
        ))}
        
        <Text style={styles.subsectionTitle}>Vocabulary</Text>
        {analysis.learningResources.vocabulary.map((term, index) => (
          <Text key={index} style={styles.bulletText}>• {term}</Text>
        ))}
        
        <Text style={styles.subsectionTitle}>Related Artworks</Text>
        {analysis.learningResources.relatedArtworks.map((artwork, index) => (
          <Text key={index} style={styles.bulletText}>• {artwork}</Text>
        ))}
        
        <Text style={styles.subsectionTitle}>Further Reading</Text>
        {analysis.learningResources.furtherReading.map((resource, index) => (
          <Text key={index} style={styles.bulletText}>• {resource}</Text>
        ))}
      </View>
    )
  }

  const renderQualityMetrics = () => {
    if (!analysis?.qualityMetrics) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Quality</Text>
        
        <View style={styles.metricsContainer}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Depth Score</Text>
            <Text style={styles.metricValue}>
              {Math.round(analysis.qualityMetrics.depthScore * 100)}%
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Pedagogical Alignment</Text>
            <Text style={styles.metricValue}>
              {Math.round(analysis.qualityMetrics.pedagogicalAlignment * 100)}%
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Educational Value</Text>
            <Text style={styles.metricValue}>
              {Math.round(analysis.qualityMetrics.educationalValue * 100)}%
            </Text>
          </View>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Analyzing artwork for rich educational insights...</Text>
        <Text style={styles.loadingSubtext}>
          This may take a moment as we gather comprehensive data and generate educational content
        </Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={performAnalysis}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {renderArtworkTypeInfo()}
      {renderStyleAnalysis()}
      {renderTechniqueAnalysis()}
      {renderColorAnalysis()}
      {renderArtisticMovements()}
      {renderVisualElements()}
      {renderHistoricalContext()}
      {renderLearningResources()}
      {renderQualityMetrics()}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  artworkTypeInfo: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3'
  },
  artworkTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4
  },
  artworkTypeText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  artworkTypeCharacteristics: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    borderBottomWidth: 2,
    borderBottomColor: '#2196f3',
    paddingBottom: 8
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 12,
    marginBottom: 8
  },
  contentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8
  },
  bulletText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    paddingLeft: 8
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  colorInfo: {
    flex: 1
  },
  colorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  colorEmotion: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  colorSymbolic: {
    fontSize: 12,
    color: '#1976d2'
  },
  colorEducational: {
    fontSize: 11,
    color: '#4caf50'
  },
  movementItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9800'
  },
  movementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  movementPeriod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  movementCharacteristics: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2
  },
  movementArtists: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2
  },
  movementContext: {
    fontSize: 12,
    color: '#1976d2',
    fontStyle: 'italic',
    marginBottom: 2
  },
  movementRelevance: {
    fontSize: 11,
    color: '#4caf50'
  },
  elementItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4caf50'
  },
  elementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  elementDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  elementValue: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
    marginBottom: 4
  },
  elementTips: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2
  },
  elementConcepts: {
    fontSize: 11,
    color: '#4caf50'
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  metricItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center'
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})

export default SimplifiedArtworkAnalysisScreen
