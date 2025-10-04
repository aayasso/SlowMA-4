// Enhanced response processing and validation system
import { ApiResponse } from './optimizedApiClient'

// Response validation schemas
export interface VisionAnalysisResult {
  labels: string[]
  objects: string[]
  text: string[]
  colors: string[]
  faces: number
  confidence?: number
  source: string
  timestamp: number
}

export interface EducationalAnalysisResult {
  styleAnalysis: {
    primaryStyle: string
    styleCharacteristics: string[]
    movementContext: string
    stylisticInfluences: string[]
    visualLanguage: string
    educationalInsights: string[]
  }
  techniqueAnalysis: {
    primaryTechniques: string[]
    materialProperties: string[]
    applicationMethods: string[]
    technicalInnovations: string[]
    skillLevel: string
    educationalValue: string[]
  }
  themeAnalysis: {
    primaryThemes: string[]
    symbolicElements: string[]
    emotionalTone: string
    culturalContext: string
    narrativeElements: string[]
    interpretiveApproaches: string[]
  }
  colorAnalysis: {
    colorPalette: Array<{
      hex: string
      name: string
      percentage: number
      emotionalAssociation: string
      symbolicMeaning: string
      educationalNote: string
    }>
    colorHarmony: string
    emotionalImpact: string
    symbolicMeaning: string[]
    colorTheory: string[]
    educationalInsights: string[]
  }
  compositionAnalysis: {
    compositionalPrinciples: string[]
    visualFlow: string
    focalPoints: string[]
    spatialRelationships: string[]
    balanceAndRhythm: string[]
    educationalApplications: string[]
  }
  reflectionQuestions: Array<{
    category: 'observation' | 'interpretation' | 'connection' | 'technique'
    question: string
    followUp?: string
    educationalGoal: string
  }>
  learningObjectives: Array<{
    skill: string
    description: string
    assessmentMethod: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }>
  confidence: number
  sources: string[]
  timestamp: number
}

export interface MuseumData {
  title: string
  artist?: string
  period?: string
  culture?: string
  medium?: string
  description?: string
  source: string
  url?: string
  confidence: number
}

export interface WikipediaData {
  title: string
  extract: string
  description: string
  url: string
  relevance: number
  timestamp: number
}

// Validation error types
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any,
    public expected: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class ProcessingError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
    public context?: any
  ) {
    super(message)
    this.name = 'ProcessingError'
  }
}

// Response processor class
export class ResponseProcessor {
  private validationRules = new Map<string, (data: any) => boolean>()
  
  constructor() {
    this.initializeValidationRules()
  }

  private initializeValidationRules(): void {
    // Vision analysis validation
    this.validationRules.set('vision-analysis', (data: any) => {
      return (
        data &&
        Array.isArray(data.labels) &&
        Array.isArray(data.objects) &&
        Array.isArray(data.text) &&
        Array.isArray(data.colors) &&
        typeof data.faces === 'number' &&
        data.faces >= 0
      )
    })

    // Educational analysis validation
    this.validationRules.set('educational-analysis', (data: any) => {
      return (
        data &&
        data.styleAnalysis &&
        data.techniqueAnalysis &&
        data.themeAnalysis &&
        data.colorAnalysis &&
        data.compositionAnalysis &&
        Array.isArray(data.reflectionQuestions) &&
        Array.isArray(data.learningObjectives) &&
        typeof data.confidence === 'number' &&
        data.confidence >= 0 &&
        data.confidence <= 1
      )
    })

    // Museum data validation
    this.validationRules.set('museum-data', (data: any) => {
      return (
        data &&
        typeof data.title === 'string' &&
        data.title.length > 0 &&
        typeof data.source === 'string' &&
        data.source.length > 0
      )
    })

    // Wikipedia data validation
    this.validationRules.set('wikipedia-data', (data: any) => {
      return (
        data &&
        typeof data.title === 'string' &&
        data.title.length > 0 &&
        typeof data.extract === 'string' &&
        data.extract.length > 0
      )
    })
  }

  // Process and validate vision analysis responses
  processVisionAnalysis(responses: ApiResponse<any>[]): VisionAnalysisResult {
    const validResponses = responses.filter(response => 
      response.success && this.validateResponse(response.data, 'vision-analysis')
    )

    if (validResponses.length === 0) {
      throw new ProcessingError('No valid vision analysis responses received', undefined, { responses })
    }

    // Combine and deduplicate results
    const combined = this.combineVisionResults(validResponses.map(r => r.data))
    
    return {
      ...combined,
      confidence: this.calculateConfidence(validResponses),
      source: validResponses.map(r => r.source).join(', '),
      timestamp: Date.now()
    }
  }

  private combineVisionResults(results: any[]): Omit<VisionAnalysisResult, 'confidence' | 'source' | 'timestamp'> {
    const combined = {
      labels: [] as string[],
      objects: [] as string[],
      text: [] as string[],
      colors: [] as string[],
      faces: 0
    }

    // Combine and deduplicate arrays
    const labelCounts = new Map<string, number>()
    const objectCounts = new Map<string, number>()
    const textCounts = new Map<string, number>()
    const colorCounts = new Map<string, number>()

    results.forEach(result => {
      // Process labels with confidence weighting
      if (result.labels) {
        result.labels.forEach((label: string) => {
          if (typeof label === 'string' && label.trim().length > 0) {
            const cleanLabel = label.trim().toLowerCase()
            labelCounts.set(cleanLabel, (labelCounts.get(cleanLabel) || 0) + 1)
          }
        })
      }

      // Process objects
      if (result.objects) {
        result.objects.forEach((obj: string) => {
          if (typeof obj === 'string' && obj.trim().length > 0) {
            const cleanObj = obj.trim().toLowerCase()
            objectCounts.set(cleanObj, (objectCounts.get(cleanObj) || 0) + 1)
          }
        })
      }

      // Process text
      if (result.text) {
        result.text.forEach((txt: string) => {
          if (typeof txt === 'string' && txt.trim().length > 0) {
            const cleanText = txt.trim().toLowerCase()
            textCounts.set(cleanText, (textCounts.get(cleanText) || 0) + 1)
          }
        })
      }

      // Process colors
      if (result.colors) {
        result.colors.forEach((color: string) => {
          if (typeof color === 'string' && color.trim().length > 0) {
            const cleanColor = color.trim().toLowerCase()
            colorCounts.set(cleanColor, (colorCounts.get(cleanColor) || 0) + 1)
          }
        })
      }

      // Sum faces
      if (typeof result.faces === 'number') {
        combined.faces += result.faces
      }
    })

    // Sort by frequency and take top results
    combined.labels = this.getTopItems(labelCounts, 15)
    combined.objects = this.getTopItems(objectCounts, 10)
    combined.text = this.getTopItems(textCounts, 5)
    combined.colors = this.getTopItems(colorCounts, 8)

    return combined
  }

  private getTopItems(counts: Map<string, number>, limit: number): string[] {
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item]) => item)
  }

  // Process and validate educational analysis responses
  processEducationalAnalysis(response: ApiResponse<any>): EducationalAnalysisResult {
    if (!response.success || !this.validateResponse(response.data, 'educational-analysis')) {
      throw new ProcessingError('Invalid educational analysis response', undefined, { response })
    }

    const data = response.data

    // Ensure all required fields exist with fallbacks
    const processed = {
      styleAnalysis: this.processStyleAnalysis(data.styleAnalysis || {}),
      techniqueAnalysis: this.processTechniqueAnalysis(data.techniqueAnalysis || {}),
      themeAnalysis: this.processThemeAnalysis(data.themeAnalysis || {}),
      colorAnalysis: this.processColorAnalysis(data.colorAnalysis || {}),
      compositionAnalysis: this.processCompositionAnalysis(data.compositionAnalysis || {}),
      reflectionQuestions: this.processReflectionQuestions(data.reflectionQuestions || []),
      learningObjectives: this.processLearningObjectives(data.learningObjectives || []),
      confidence: Math.min(Math.max(data.confidence || 0.8, 0), 1),
      sources: Array.isArray(data.sources) ? data.sources : [response.source],
      timestamp: Date.now()
    }

    return processed
  }

  private processStyleAnalysis(data: any): EducationalAnalysisResult['styleAnalysis'] {
    return {
      primaryStyle: this.ensureString(data.primaryStyle, 'Unknown Style'),
      styleCharacteristics: this.ensureStringArray(data.styleCharacteristics, ['Artistic expression']),
      movementContext: this.ensureString(data.movementContext, 'Historical context'),
      stylisticInfluences: this.ensureStringArray(data.stylisticInfluences, ['Artistic traditions']),
      visualLanguage: this.ensureString(data.visualLanguage, 'Visual communication'),
      educationalInsights: this.ensureStringArray(data.educationalInsights, ['Visual literacy development'])
    }
  }

  private processTechniqueAnalysis(data: any): EducationalAnalysisResult['techniqueAnalysis'] {
    return {
      primaryTechniques: this.ensureStringArray(data.primaryTechniques, ['Artistic technique']),
      materialProperties: this.ensureStringArray(data.materialProperties, ['Material characteristics']),
      applicationMethods: this.ensureStringArray(data.applicationMethods, ['Application methods']),
      technicalInnovations: this.ensureStringArray(data.technicalInnovations, ['Technical approach']),
      skillLevel: this.ensureString(data.skillLevel, 'Intermediate'),
      educationalValue: this.ensureStringArray(data.educationalValue, ['Educational significance'])
    }
  }

  private processThemeAnalysis(data: any): EducationalAnalysisResult['themeAnalysis'] {
    return {
      primaryThemes: this.ensureStringArray(data.primaryThemes, ['Artistic theme']),
      symbolicElements: this.ensureStringArray(data.symbolicElements, ['Symbolic meaning']),
      emotionalTone: this.ensureString(data.emotionalTone, 'Emotional expression'),
      culturalContext: this.ensureString(data.culturalContext, 'Cultural significance'),
      narrativeElements: this.ensureStringArray(data.narrativeElements, ['Narrative content']),
      interpretiveApproaches: this.ensureStringArray(data.interpretiveApproaches, ['Interpretive methods'])
    }
  }

  private processColorAnalysis(data: any): EducationalAnalysisResult['colorAnalysis'] {
    return {
      colorPalette: this.processColorPalette(data.colorPalette || []),
      colorHarmony: this.ensureString(data.colorHarmony, 'Color relationships'),
      emotionalImpact: this.ensureString(data.emotionalImpact, 'Emotional response'),
      symbolicMeaning: this.ensureStringArray(data.symbolicMeaning, ['Color symbolism']),
      colorTheory: this.ensureStringArray(data.colorTheory, ['Color principles']),
      educationalInsights: this.ensureStringArray(data.educationalInsights, ['Color education'])
    }
  }

  private processColorPalette(data: any[]): EducationalAnalysisResult['colorAnalysis']['colorPalette'] {
    if (!Array.isArray(data)) return []

    return data.slice(0, 8).map((color, index) => ({
      hex: this.ensureString(color.hex, this.generateDefaultHex(index)),
      name: this.ensureString(color.name, this.getDefaultColorName(index)),
      percentage: Math.min(Math.max(color.percentage || (20 - index * 2), 0), 100),
      emotionalAssociation: this.ensureString(color.emotionalAssociation, 'Emotional response'),
      symbolicMeaning: this.ensureString(color.symbolicMeaning, 'Symbolic value'),
      educationalNote: this.ensureString(color.educationalNote, 'Educational significance')
    }))
  }

  private processCompositionAnalysis(data: any): EducationalAnalysisResult['compositionAnalysis'] {
    return {
      compositionalPrinciples: this.ensureStringArray(data.compositionalPrinciples, ['Compositional balance']),
      visualFlow: this.ensureString(data.visualFlow, 'Visual movement'),
      focalPoints: this.ensureStringArray(data.focalPoints, ['Focal elements']),
      spatialRelationships: this.ensureStringArray(data.spatialRelationships, ['Spatial organization']),
      balanceAndRhythm: this.ensureString(data.balanceAndRhythm, 'Visual rhythm'),
      educationalApplications: this.ensureStringArray(data.educationalApplications, ['Educational uses'])
    }
  }

  private processReflectionQuestions(data: any[]): EducationalAnalysisResult['reflectionQuestions'] {
    if (!Array.isArray(data)) return this.getDefaultReflectionQuestions()

    return data.slice(0, 8).map((question, index) => ({
      category: this.ensureValidCategory(question.category, index),
      question: this.ensureString(question.question, this.getDefaultQuestion(index)),
      followUp: question.followUp ? this.ensureString(question.followUp, '') : undefined,
      educationalGoal: this.ensureString(question.educationalGoal, 'Learning objective')
    }))
  }

  private processLearningObjectives(data: any[]): EducationalAnalysisResult['learningObjectives'] {
    if (!Array.isArray(data)) return this.getDefaultLearningObjectives()

    return data.slice(0, 6).map((objective, index) => ({
      skill: this.ensureString(objective.skill, this.getDefaultSkill(index)),
      description: this.ensureString(objective.description, 'Learning description'),
      assessmentMethod: this.ensureString(objective.assessmentMethod, 'Observation and discussion'),
      difficulty: this.ensureValidDifficulty(objective.difficulty, index)
    }))
  }

  // Process museum data responses
  processMuseumData(responses: ApiResponse<any>[]): MuseumData[] {
    const validResponses = responses.filter(response => 
      response.success && this.validateResponse(response.data, 'museum-data')
    )

    if (validResponses.length === 0) {
      return []
    }

    return validResponses.map(response => this.processSingleMuseumData(response.data, response.source))
  }

  private processSingleMuseumData(data: any, source: string): MuseumData {
    return {
      title: this.ensureString(data.title, 'Untitled'),
      artist: data.artist || data.artistDisplayName || 'Unknown Artist',
      period: data.period || data.objectDate || data.date_display || 'Unknown Period',
      culture: data.culture || 'Unknown Culture',
      medium: data.medium || data.medium_display || 'Unknown Medium',
      description: data.description || '',
      source: source,
      url: data.url || data.objectURL || data.linkResource || '',
      confidence: 0.8
    }
  }

  // Process Wikipedia data responses
  processWikipediaData(response: ApiResponse<any>): WikipediaData | null {
    if (!response.success || !this.validateResponse(response.data, 'wikipedia-data')) {
      return null
    }

    const data = response.data
    return {
      title: this.ensureString(data.title, 'Wikipedia Article'),
      extract: this.ensureString(data.extract, 'No content available'),
      description: this.ensureString(data.description, ''),
      url: this.ensureString(data.url, ''),
      relevance: this.calculateRelevance(data.extract, data.title),
      timestamp: Date.now()
    }
  }

  // Utility methods for data validation and processing
  private validateResponse(data: any, type: string): boolean {
    const validator = this.validationRules.get(type)
    return validator ? validator(data) : true
  }

  private ensureString(value: any, defaultValue: string): string {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : defaultValue
  }

  private ensureStringArray(value: any, defaultValue: string[]): string[] {
    if (!Array.isArray(value)) return defaultValue
    return value
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .map(item => item.trim())
      .slice(0, 10) // Limit array size
  }

  private ensureValidCategory(value: any, index: number): 'observation' | 'interpretation' | 'connection' | 'technique' {
    const validCategories = ['observation', 'interpretation', 'connection', 'technique']
    const defaultCategories = ['observation', 'interpretation', 'connection', 'technique']
    
    if (typeof value === 'string' && validCategories.includes(value)) {
      return value
    }
    
    return defaultCategories[index % defaultCategories.length]
  }

  private ensureValidDifficulty(value: any, index: number): 'beginner' | 'intermediate' | 'advanced' {
    const validDifficulties = ['beginner', 'intermediate', 'advanced']
    const defaultDifficulties = ['beginner', 'intermediate', 'advanced']
    
    if (typeof value === 'string' && validDifficulties.includes(value)) {
      return value
    }
    
    return defaultDifficulties[index % defaultDifficulties.length]
  }

  private calculateConfidence(responses: ApiResponse<any>[]): number {
    if (responses.length === 0) return 0
    
    const avgRetryCount = responses.reduce((sum, r) => sum + r.retryCount, 0) / responses.length
    const successRate = responses.filter(r => r.success).length / responses.length
    
    // Higher confidence with more successful responses and fewer retries
    return Math.min(0.9, successRate * (1 - avgRetryCount * 0.1))
  }

  private calculateRelevance(extract: string, title: string): number {
    const artKeywords = ['art', 'painting', 'artist', 'artwork', 'museum', 'gallery', 'artistic', 'visual', 'creative']
    const text = (extract + ' ' + title).toLowerCase()
    
    const keywordCount = artKeywords.filter(keyword => text.includes(keyword)).length
    return Math.min(keywordCount / artKeywords.length, 1)
  }

  // Default value generators
  private generateDefaultHex(index: number): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
    return colors[index % colors.length]
  }

  private getDefaultColorName(index: number): string {
    const names = ['Coral Red', 'Turquoise', 'Sky Blue', 'Mint Green', 'Soft Yellow', 'Plum', 'Seafoam', 'Golden']
    return names[index % names.length]
  }

  private getDefaultReflectionQuestions(): EducationalAnalysisResult['reflectionQuestions'] {
    return [
      {
        category: 'observation',
        question: 'What do you notice first when looking at this artwork?',
        educationalGoal: 'Develop observational skills'
      },
      {
        category: 'interpretation',
        question: 'What emotions does this artwork evoke in you?',
        educationalGoal: 'Understand emotional response to art'
      },
      {
        category: 'connection',
        question: 'How does this artwork relate to your personal experiences?',
        educationalGoal: 'Make personal connections to art'
      },
      {
        category: 'technique',
        question: 'What artistic techniques can you identify?',
        educationalGoal: 'Analyze technical aspects of art'
      }
    ]
  }

  private getDefaultLearningObjectives(): EducationalAnalysisResult['learningObjectives'] {
    return [
      {
        skill: 'Visual Analysis',
        description: 'Learn to analyze visual elements and composition',
        assessmentMethod: 'Observation and discussion',
        difficulty: 'beginner'
      },
      {
        skill: 'Color Theory',
        description: 'Understand color relationships and their impact',
        assessmentMethod: 'Color analysis exercises',
        difficulty: 'intermediate'
      },
      {
        skill: 'Artistic Context',
        description: 'Explore historical and cultural context of artworks',
        assessmentMethod: 'Research and presentation',
        difficulty: 'advanced'
      }
    ]
  }

  private getDefaultQuestion(index: number): string {
    const questions = [
      'What draws your attention first in this artwork?',
      'How does the artist use color to create mood?',
      'What techniques can you identify in the composition?',
      'How does this artwork make you feel?',
      'What story might this artwork be telling?',
      'How does the artist create depth and perspective?',
      'What cultural elements do you notice?',
      'How might this artwork relate to other works you know?'
    ]
    return questions[index % questions.length]
  }

  private getDefaultSkill(index: number): string {
    const skills = [
      'Visual Literacy',
      'Color Analysis',
      'Compositional Understanding',
      'Cultural Awareness',
      'Artistic Technique',
      'Critical Thinking'
    ]
    return skills[index % skills.length]
  }

  // Error handling and recovery
  handleProcessingError(error: Error, context: any): EducationalAnalysisResult {
    console.error('Processing error occurred:', error, context)
    
    // Return a minimal valid structure that won't break the UI
    return {
      styleAnalysis: {
        primaryStyle: 'Analysis',
        styleCharacteristics: ['Artistic expression'],
        movementContext: 'Historical context',
        stylisticInfluences: ['Artistic traditions'],
        visualLanguage: 'Visual communication',
        educationalInsights: ['Visual literacy development']
      },
      techniqueAnalysis: {
        primaryTechniques: ['Artistic technique'],
        materialProperties: ['Material characteristics'],
        applicationMethods: ['Application methods'],
        technicalInnovations: ['Technical approach'],
        skillLevel: 'Intermediate',
        educationalValue: ['Educational significance']
      },
      themeAnalysis: {
        primaryThemes: ['Artistic theme'],
        symbolicElements: ['Symbolic meaning'],
        emotionalTone: 'Emotional expression',
        culturalContext: 'Cultural significance',
        narrativeElements: ['Narrative content'],
        interpretiveApproaches: ['Interpretive methods']
      },
      colorAnalysis: {
        colorPalette: [],
        colorHarmony: 'Color relationships',
        emotionalImpact: 'Emotional response',
        symbolicMeaning: ['Color symbolism'],
        colorTheory: ['Color principles'],
        educationalInsights: ['Color education']
      },
      compositionAnalysis: {
        compositionalPrinciples: ['Compositional balance'],
        visualFlow: 'Visual movement',
        focalPoints: ['Focal elements'],
        spatialRelationships: ['Spatial organization'],
        balanceAndRhythm: 'Visual rhythm',
        educationalApplications: ['Educational uses']
      },
      reflectionQuestions: this.getDefaultReflectionQuestions(),
      learningObjectives: this.getDefaultLearningObjectives(),
      confidence: 0.3,
      sources: ['Error Recovery'],
      timestamp: Date.now()
    }
  }
}

// Export singleton instance
export const responseProcessor = new ResponseProcessor()
