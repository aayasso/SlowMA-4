# Optimization Integration Guide

## 🎯 Quick Implementation Steps

### Step 1: Update Your Existing Workflow Service

Replace your current workflow service with the optimized version:

```javascript
// In your existing service file (e.g., apiService.ts)
import OptimizedWorkflowService from './optimizedWorkflowService'

// Replace your current analyzeArtwork method with:
async analyzeArtwork(imageBase64: string, userContext?: UserContext): Promise<EnhancedEducationalAnalysis> {
  return await OptimizedWorkflowService.analyzeArtworkOptimized(imageBase64, userContext)
}
```

### Step 2: Update Your Component to Use Enhanced Analysis

```javascript
// In your ArtworkAnalysisScreen.tsx
import { UserContext, EnhancedEducationalAnalysis } from '../services/optimizedWorkflowService'

const [userContext, setUserContext] = useState<UserContext>({
  skillLevel: 'intermediate',
  learningStyle: 'visual',
  interests: ['color', 'composition'],
  learningGoals: ['develop visual literacy', 'understand art history']
})

const [analysis, setAnalysis] = useState<EnhancedEducationalAnalysis | null>(null)

// Update your analysis call
useEffect(() => {
  const performAnalysis = async () => {
    try {
      setLoading(true)
      const result = await apiService.analyzeArtwork(imageBase64, userContext)
      setAnalysis(result)
    } catch (error) {
      console.error('Analysis failed:', error)
      setError('Failed to analyze artwork')
    } finally {
      setLoading(false)
    }
  }

  if (imageBase64) {
    performAnalysis()
  }
}, [imageBase64, userContext])
```

### Step 3: Update Your UI to Display Enhanced Content

```javascript
// Add new sections to your ArtworkAnalysisScreen.tsx
const renderEnhancedContent = () => {
  if (!analysis) return null

  return (
    <View style={styles.container}>
      {/* Existing content */}
      
      {/* Bloom's Taxonomy Learning Objectives */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Objectives</Text>
        
        <Text style={styles.subsectionTitle}>Remember</Text>
        {analysis.learningObjectives.remember.map((objective, index) => (
          <View key={index} style={styles.objectiveItem}>
            <Text style={styles.objectiveText}>• {objective.description}</Text>
          </View>
        ))}
        
        <Text style={styles.subsectionTitle}>Understand</Text>
        {analysis.learningObjectives.understand.map((objective, index) => (
          <View key={index} style={styles.objectiveItem}>
            <Text style={styles.objectiveText}>• {objective.description}</Text>
          </View>
        ))}
        
        {/* Add other Bloom's levels... */}
      </View>

      {/* Categorized Reflection Questions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reflection Questions</Text>
        
        <Text style={styles.subsectionTitle}>Observation</Text>
        {analysis.reflectionQuestions.observation.map((question, index) => (
          <View key={index} style={styles.questionItem}>
            <Text style={styles.questionText}>{question.question}</Text>
            {question.followUp && (
              <Text style={styles.followUpText}>{question.followUp}</Text>
            )}
          </View>
        ))}
        
        {/* Add other question categories... */}
      </View>

      {/* Learning Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Activities</Text>
        
        <Text style={styles.subsectionTitle}>Individual Activities</Text>
        {analysis.learningActivities.individual.map((activity, index) => (
          <View key={index} style={styles.activityItem}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDescription}>{activity.description}</Text>
            <Text style={styles.activityDuration}>Duration: {activity.duration}</Text>
            <Text style={styles.activityMaterials}>Materials: {activity.materials.join(', ')}</Text>
          </View>
        ))}
        
        {/* Add other activity types... */}
      </View>

      {/* Discussion Prompts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discussion Prompts</Text>
        {analysis.discussionPrompts.map((prompt, index) => (
          <View key={index} style={styles.promptItem}>
            <Text style={styles.promptTopic}>{prompt.topic}</Text>
            <Text style={styles.promptQuestion}>{prompt.question}</Text>
            <Text style={styles.promptContext}>{prompt.context}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
```

### Step 4: Add User Context Selection

```javascript
// Add user context selection to your component
const UserContextSelector = () => {
  const [skillLevel, setSkillLevel] = useState('intermediate')
  const [learningStyle, setLearningStyle] = useState('visual')

  return (
    <View style={styles.contextSelector}>
      <Text style={styles.selectorTitle}>Customize Your Learning Experience</Text>
      
      <Text style={styles.selectorLabel}>Skill Level:</Text>
      <Picker
        selectedValue={skillLevel}
        onValueChange={(value) => setSkillLevel(value)}
        style={styles.picker}
      >
        <Picker.Item label="Beginner" value="beginner" />
        <Picker.Item label="Intermediate" value="intermediate" />
        <Picker.Item label="Advanced" value="advanced" />
      </Picker>
      
      <Text style={styles.selectorLabel}>Learning Style:</Text>
      <Picker
        selectedValue={learningStyle}
        onValueChange={(value) => setLearningStyle(value)}
        style={styles.picker}
      >
        <Picker.Item label="Visual" value="visual" />
        <Picker.Item label="Auditory" value="auditory" />
        <Picker.Item label="Kinesthetic" value="kinesthetic" />
        <Picker.Item label="Reading" value="reading" />
      </Picker>
    </View>
  )
}
```

## 🔧 Configuration Options

### 1. Adaptive Prompting Configuration

```javascript
// Customize artwork type detection
const typeIndicators = {
  portrait: ['face', 'person', 'portrait', 'facial', 'human', 'head', 'eyes'],
  landscape: ['landscape', 'nature', 'sky', 'mountain', 'tree', 'water', 'field'],
  stillLife: ['object', 'bowl', 'fruit', 'vase', 'table', 'arrangement', 'bottle'],
  abstract: ['abstract', 'geometric', 'pattern', 'color', 'shape', 'form', 'line'],
  sculpture: ['sculpture', 'three-dimensional', 'form', 'volume', 'statue', 'figure'],
  mixed: ['mixed', 'collage', 'assemblage', 'multimedia', 'installation']
}

// Customize skill level prompts
const skillLevelPrompts = {
  beginner: "Use simple, accessible language...",
  intermediate: "Include art historical context...",
  advanced: "Provide sophisticated analysis..."
}
```

### 2. API Selection Configuration

```javascript
// Customize API quality scores
const apiQualityScores = {
  wikipedia: 0.8,      // High for general knowledge
  metMuseum: 0.9,      // High for art history
  artInstitute: 0.85,  // High for educational content
  harvard: 0.7         // Medium for specialized content
}

// Customize search term generation
const searchTermWeights = {
  primary: 1.0,        // Base terms from vision data
  secondary: 0.8,      // Contextual terms from insights
  educational: 0.9,    // Educational terms
  historical: 0.7      // Historical terms
}
```

### 3. Educational Content Configuration

```javascript
// Customize Bloom's Taxonomy objectives
const bloomLevels = {
  remember: { difficulty: 'beginner', focus: 'basic identification' },
  understand: { difficulty: 'intermediate', focus: 'comprehension' },
  apply: { difficulty: 'intermediate', focus: 'practical application' },
  analyze: { difficulty: 'advanced', focus: 'critical analysis' },
  evaluate: { difficulty: 'advanced', focus: 'judgment and critique' },
  create: { difficulty: 'advanced', focus: 'synthesis and creation' }
}

// Customize learning activities
const activityTypes = {
  individual: { duration: '30-60 minutes', focus: 'personal learning' },
  collaborative: { duration: '20-45 minutes', focus: 'peer interaction' },
  handsOn: { duration: '45-90 minutes', focus: 'practical application' },
  digital: { duration: '60-120 minutes', focus: 'technology integration' },
  creative: { duration: '60-180 minutes', focus: 'artistic expression' }
}
```

## 📊 Testing Your Implementation

### 1. Test Adaptive Prompting

```javascript
// Test different artwork types
const testArtworkTypes = [
  { type: 'portrait', expectedFocus: 'facial expression, psychological depth' },
  { type: 'landscape', expectedFocus: 'atmospheric perspective, natural elements' },
  { type: 'stillLife', expectedFocus: 'composition, symbolism, material properties' },
  { type: 'abstract', expectedFocus: 'color relationships, form, emotional expression' },
  { type: 'sculpture', expectedFocus: 'three-dimensional form, material properties' }
]

// Test different skill levels
const testSkillLevels = [
  { level: 'beginner', expectedLanguage: 'simple, accessible' },
  { level: 'intermediate', expectedLanguage: 'art historical context' },
  { level: 'advanced', expectedLanguage: 'sophisticated analysis' }
]
```

### 2. Test API Selection

```javascript
// Test search term generation
const testSearchTerms = {
  input: { labels: ['face', 'portrait', 'expression'], insights: ['psychological depth', 'human emotion'] },
  expected: {
    primary: ['face', 'portrait', 'expression'],
    secondary: ['psychological depth', 'human emotion'],
    educational: ['art education', 'visual literacy'],
    historical: ['art history', 'artistic movements']
  }
}

// Test API quality scores
const testAPIScores = {
  portrait: { wikipedia: 0.8, metMuseum: 0.9, artInstitute: 0.85, harvard: 0.7 },
  landscape: { wikipedia: 0.9, metMuseum: 0.8, artInstitute: 0.7, harvard: 0.6 },
  abstract: { wikipedia: 0.7, metMuseum: 0.6, artInstitute: 0.8, harvard: 0.9 }
}
```

### 3. Test Educational Content

```javascript
// Test Bloom's Taxonomy objectives
const testBloomObjectives = {
  remember: { count: 2, difficulty: 'beginner', focus: 'identification' },
  understand: { count: 2, difficulty: 'intermediate', focus: 'comprehension' },
  apply: { count: 2, difficulty: 'intermediate', focus: 'application' },
  analyze: { count: 2, difficulty: 'advanced', focus: 'analysis' },
  evaluate: { count: 2, difficulty: 'advanced', focus: 'evaluation' },
  create: { count: 2, difficulty: 'advanced', focus: 'creation' }
}

// Test learning activities
const testActivities = {
  individual: { count: 1, duration: '45 minutes', materials: ['Paint', 'Paper', 'Brushes'] },
  collaborative: { count: 1, duration: '30 minutes', materials: ['Discussion guide', 'Notebook'] },
  digital: { count: 1, duration: '60 minutes', materials: ['Computer', 'Presentation software'] }
}
```

## 🚀 Performance Optimization

### 1. Caching Strategy

```javascript
// Cache artwork type detection results
const artworkTypeCache = new Map()

const getCachedArtworkType = (visionData) => {
  const key = JSON.stringify(visionData.combined?.labels || [])
  if (artworkTypeCache.has(key)) {
    return artworkTypeCache.get(key)
  }
  
  const type = determineArtworkType(visionData)
  artworkTypeCache.set(key, type)
  return type
}

// Cache API responses
const apiResponseCache = new Map()

const getCachedAPIResponse = async (api, searchTerms) => {
  const key = `${api}-${JSON.stringify(searchTerms)}`
  if (apiResponseCache.has(key)) {
    return apiResponseCache.get(key)
  }
  
  const response = await callAPIWithQualityAssessment(api, searchTerms)
  apiResponseCache.set(key, response)
  return response
}
```

### 2. Parallel Processing

```javascript
// Process multiple APIs in parallel
const processAPIsInParallel = async (apis, searchTerms) => {
  const promises = apis.map(api => 
    getCachedAPIResponse(api, searchTerms)
  )
  
  const results = await Promise.allSettled(promises)
  return results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value)
}
```

### 3. Error Handling

```javascript
// Graceful degradation for API failures
const handleAPIFailure = (api, error) => {
  console.warn(`API ${api} failed:`, error)
  
  // Fallback strategies
  const fallbacks = {
    wikipedia: 'Use cached historical data',
    metMuseum: 'Use Art Institute data',
    artInstitute: 'Use Met Museum data',
    harvard: 'Skip specialized content'
  }
  
  return fallbacks[api] || 'Continue with available data'
}
```

## 📈 Monitoring and Analytics

### 1. Track Usage Metrics

```javascript
// Track user interactions
const trackUserInteraction = (action, data) => {
  console.log(`User ${action}:`, data)
  
  // Send to analytics service
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: 'educational_analysis',
      event_label: data.type || 'unknown',
      value: data.confidence || 0
    })
  }
}

// Track learning outcomes
const trackLearningOutcome = (objective, success) => {
  console.log(`Learning outcome ${objective}:`, success)
  
  // Send to learning analytics
  if (window.gtag) {
    window.gtag('event', 'learning_outcome', {
      event_category: 'educational_analysis',
      event_label: objective,
      value: success ? 1 : 0
    })
  }
}
```

### 2. Quality Assessment

```javascript
// Assess content quality
const assessContentQuality = (content) => {
  const metrics = {
    depthScore: calculateDepthScore(content),
    pedagogicalAlignment: calculatePedagogicalAlignment(content),
    engagementScore: calculateEngagementScore(content),
    learningEffectiveness: calculateLearningEffectiveness(content)
  }
  
  console.log('Content quality metrics:', metrics)
  return metrics
}

// Calculate depth score
const calculateDepthScore = (content) => {
  const factors = [
    content.styleAnalysis?.educationalInsights?.length || 0,
    content.techniqueAnalysis?.educationalValue?.length || 0,
    content.learningObjectives?.remember?.length || 0,
    content.reflectionQuestions?.observation?.length || 0
  ]
  
  return factors.reduce((sum, factor) => sum + factor, 0) / 20 // Normalize to 0-1
}
```

This integration guide provides everything you need to implement the three key optimizations: adaptive prompting, enhanced educational content structure, and intelligent API selection. The implementation is designed to be modular and easy to integrate with your existing workflow.
