// Optimized Artwork Analysis Screen
// Demonstrates the enhanced educational content structure and adaptive prompting

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import OptimizedWorkflowService, { 
  UserContext, 
  EnhancedEducationalAnalysis,
  ArtworkType 
} from '../services/optimizedWorkflowService'

interface OptimizedArtworkAnalysisScreenProps {
  imageBase64: string
  onAnalysisComplete?: (analysis: EnhancedEducationalAnalysis) => void
}

const OptimizedArtworkAnalysisScreen: React.FC<OptimizedArtworkAnalysisScreenProps> = ({
  imageBase64,
  onAnalysisComplete
}) => {
  const [userContext, setUserContext] = useState<UserContext>({
    skillLevel: 'intermediate',
    learningStyle: 'visual',
    interests: ['color', 'composition'],
    learningGoals: ['develop visual literacy', 'understand art history']
  })
  
  const [analysis, setAnalysis] = useState<EnhancedEducationalAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [artworkType, setArtworkType] = useState<ArtworkType | null>(null)

  useEffect(() => {
    if (imageBase64) {
      performAnalysis()
    }
  }, [imageBase64, userContext])

  const performAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🎓 Starting optimized analysis with user context:', userContext)
      
      const result = await OptimizedWorkflowService.analyzeArtworkOptimized(imageBase64, userContext)
      
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

  const renderUserContextSelector = () => (
    <View style={styles.contextSelector}>
      <Text style={styles.selectorTitle}>Customize Your Learning Experience</Text>
      
      <View style={styles.selectorRow}>
        <Text style={styles.selectorLabel}>Skill Level:</Text>
        <Picker
          selectedValue={userContext.skillLevel}
          onValueChange={(value) => setUserContext(prev => ({ ...prev, skillLevel: value }))}
          style={styles.picker}
        >
          <Picker.Item label="Beginner" value="beginner" />
          <Picker.Item label="Intermediate" value="intermediate" />
          <Picker.Item label="Advanced" value="advanced" />
        </Picker>
      </View>
      
      <View style={styles.selectorRow}>
        <Text style={styles.selectorLabel}>Learning Style:</Text>
        <Picker
          selectedValue={userContext.learningStyle}
          onValueChange={(value) => setUserContext(prev => ({ ...prev, learningStyle: value }))}
          style={styles.picker}
        >
          <Picker.Item label="Visual" value="visual" />
          <Picker.Item label="Auditory" value="auditory" />
          <Picker.Item label="Kinesthetic" value="kinesthetic" />
          <Picker.Item label="Reading" value="reading" />
        </Picker>
      </View>
    </View>
  )

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

  const renderBloomTaxonomyObjectives = () => {
    if (!analysis?.learningObjectives) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Objectives (Bloom's Taxonomy)</Text>
        
        {Object.entries(analysis.learningObjectives).map(([level, objectives]) => (
          <View key={level} style={styles.bloomLevel}>
            <Text style={styles.bloomLevelTitle}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
            {objectives.map((objective, index) => (
              <View key={index} style={styles.objectiveItem}>
                <Text style={styles.objectiveText}>• {objective.description}</Text>
                <Text style={styles.objectiveOutcome}>{objective.learningOutcome}</Text>
                <Text style={styles.objectiveDifficulty}>
                  Difficulty: {objective.difficulty} | Assessment: {objective.assessmentMethod}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    )
  }

  const renderCategorizedQuestions = () => {
    if (!analysis?.reflectionQuestions) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reflection Questions</Text>
        
        {Object.entries(analysis.reflectionQuestions).map(([category, questions]) => (
          <View key={category} style={styles.questionCategory}>
            <Text style={styles.questionCategoryTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            {questions.map((question, index) => (
              <View key={index} style={styles.questionItem}>
                <Text style={styles.questionText}>{question.question}</Text>
                {question.followUp && (
                  <Text style={styles.followUpText}>{question.followUp}</Text>
                )}
                <Text style={styles.questionGoal}>{question.educationalGoal}</Text>
                <Text style={styles.questionDifficulty}>
                  Difficulty: {question.difficulty} | 
                  Learning Style: {question.learningStyle?.join(', ') || 'All'}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    )
  }

  const renderLearningActivities = () => {
    if (!analysis?.learningActivities) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Activities</Text>
        
        {Object.entries(analysis.learningActivities).map(([type, activities]) => (
          <View key={type} style={styles.activityType}>
            <Text style={styles.activityTypeTitle}>
              {type.charAt(0).toUpperCase() + type.slice(1)} Activities
            </Text>
            {activities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityDuration}>Duration: {activity.duration}</Text>
                <Text style={styles.activityMaterials}>
                  Materials: {activity.materials.join(', ')}
                </Text>
                <Text style={styles.activityInstructions}>
                  Instructions: {activity.instructions.join('; ')}
                </Text>
                <Text style={styles.activityOutcomes}>
                  Learning Outcomes: {activity.learningOutcomes.join('; ')}
                </Text>
                <Text style={styles.activityDifficulty}>
                  Difficulty: {activity.difficulty} | 
                  Learning Style: {activity.learningStyle.join(', ')}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    )
  }

  const renderDiscussionPrompts = () => {
    if (!analysis?.discussionPrompts) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discussion Prompts</Text>
        
        {analysis.discussionPrompts.map((prompt, index) => (
          <View key={index} style={styles.promptItem}>
            <Text style={styles.promptTopic}>{prompt.topic}</Text>
            <Text style={styles.promptQuestion}>{prompt.question}</Text>
            <Text style={styles.promptContext}>{prompt.context}</Text>
            <Text style={styles.promptDifficulty}>
              Difficulty: {prompt.difficulty} | 
              Learning Outcomes: {prompt.learningOutcomes.join('; ')}
            </Text>
          </View>
        ))}
      </View>
    )
  }

  const renderQualityMetrics = () => {
    if (!analysis?.qualityMetrics) return null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Quality Metrics</Text>
        
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
            <Text style={styles.metricLabel}>Engagement Score</Text>
            <Text style={styles.metricValue}>
              {Math.round(analysis.qualityMetrics.engagementScore * 100)}%
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Learning Effectiveness</Text>
            <Text style={styles.metricValue}>
              {Math.round(analysis.qualityMetrics.learningEffectiveness * 100)}%
            </Text>
          </View>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Analyzing artwork with enhanced educational insights...</Text>
        <Text style={styles.loadingSubtext}>
          This may take a moment as we gather comprehensive data and generate personalized content
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
      {renderUserContextSelector()}
      {renderArtworkTypeInfo()}
      {renderBloomTaxonomyObjectives()}
      {renderCategorizedQuestions()}
      {renderLearningActivities()}
      {renderDiscussionPrompts()}
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
  contextSelector: {
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
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    color: '#666',
    minWidth: 100
  },
  picker: {
    flex: 1,
    height: 50
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
  bloomLevel: {
    marginBottom: 16
  },
  bloomLevelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
    textTransform: 'capitalize'
  },
  objectiveItem: {
    marginBottom: 12,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e0e0e0'
  },
  objectiveText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  objectiveOutcome: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 2
  },
  objectiveDifficulty: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500'
  },
  questionCategory: {
    marginBottom: 16
  },
  questionCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
    textTransform: 'capitalize'
  },
  questionItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6
  },
  questionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4
  },
  followUpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4
  },
  questionGoal: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '500',
    marginBottom: 2
  },
  questionDifficulty: {
    fontSize: 10,
    color: '#999'
  },
  activityType: {
    marginBottom: 16
  },
  activityTypeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
    textTransform: 'capitalize'
  },
  activityItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4caf50'
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  activityDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  activityDuration: {
    fontSize: 11,
    color: '#4caf50',
    fontWeight: '500',
    marginBottom: 2
  },
  activityMaterials: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2
  },
  activityInstructions: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2
  },
  activityOutcomes: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '500',
    marginBottom: 2
  },
  activityDifficulty: {
    fontSize: 10,
    color: '#999'
  },
  promptItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9800'
  },
  promptTopic: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  promptQuestion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  promptContext: {
    fontSize: 11,
    color: '#1976d2',
    fontStyle: 'italic',
    marginBottom: 2
  },
  promptDifficulty: {
    fontSize: 10,
    color: '#999'
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

export default OptimizedArtworkAnalysisScreen
