// Unified Multistage Educational Art Analysis Workflow
// Consolidates and optimizes the call-and-recall pattern across all implementations

export interface WorkflowStage {
  stage: 'vision' | 'interpretation' | 'recall' | 'synthesis'
  description: string
  apisUsed: string[]
  insights: string[]
  timestamp: Date
  duration?: number
  success: boolean
  error?: string
}

export interface WorkflowConfig {
  enableVisionAPIs: {
    clarifai: boolean
    googleVision: boolean
    microsoftVision: boolean
  }
  enableRecallAPIs: {
    wikipedia: boolean
    metMuseum: boolean
    artInstitute: boolean
    harvard: boolean
    artSearch: boolean
    colorAnalysis: boolean
    textureAnalysis: boolean
    emotionalAnalysis: boolean
  }
  enableAI: {
    openai: boolean
  }
  performance: {
    parallelExecution: boolean
    timeoutMs: number
    retryAttempts: number
  }
}

export interface WorkflowResult {
  success: boolean
  stages: WorkflowStage[]
  totalDuration: number
  data: {
    visionData: any
    initialInsights: any
    recallData: any
    finalAnalysis: any
  }
  errors: string[]
  sources: string[]
}

class UnifiedWorkflowService {
  private config: WorkflowConfig
  private stages: WorkflowStage[] = []
  private startTime: number = 0

  constructor(config?: Partial<WorkflowConfig>) {
    this.config = {
      enableVisionAPIs: {
        clarifai: true,
        googleVision: true,
        microsoftVision: true
      },
      enableRecallAPIs: {
        wikipedia: true,
        metMuseum: true,
        artInstitute: true,
        harvard: false, // Requires API key
        artSearch: false, // Requires API key
        colorAnalysis: true,
        textureAnalysis: true,
        emotionalAnalysis: true
      },
      enableAI: {
        openai: true
      },
      performance: {
        parallelExecution: true,
        timeoutMs: 30000,
        retryAttempts: 2
      },
      ...config
    }
  }

  // Main workflow orchestrator
  async analyzeArtwork(imageBase64: string): Promise<WorkflowResult> {
    this.startTime = Date.now()
    this.stages = []
    const errors: string[] = []

    try {
      console.log('🎨 Starting unified educational artwork analysis workflow...')

      // Stage 1: Vision Analysis
      const visionData = await this.executeStage1_VisionAnalysis(imageBase64)
      
      // Stage 2: Initial AI Interpretation
      const initialInsights = await this.executeStage2_InitialInterpretation(visionData)
      
      // Stage 3: Targeted Recall
      const recallData = await this.executeStage3_TargetedRecall(visionData, initialInsights)
      
      // Stage 4: Final Synthesis
      const finalAnalysis = await this.executeStage4_FinalSynthesis(visionData, initialInsights, recallData)

      const totalDuration = Date.now() - this.startTime
      const sources = this.extractUsedSources()

      console.log(`✅ Workflow complete in ${totalDuration}ms`)

      return {
        success: true,
        stages: this.stages,
        totalDuration,
        data: {
          visionData,
          initialInsights,
          recallData,
          finalAnalysis
        },
        errors,
        sources
      }

    } catch (error) {
      console.error('❌ Workflow failed:', error)
      errors.push(error instanceof Error ? error.message : 'Unknown error')
      
      return {
        success: false,
        stages: this.stages,
        totalDuration: Date.now() - this.startTime,
        data: {
          visionData: null,
          initialInsights: null,
          recallData: null,
          finalAnalysis: null
        },
        errors,
        sources: this.extractUsedSources()
      }
    }
  }

  // Stage 1: Vision Analysis - Parallel execution of all vision APIs
  private async executeStage1_VisionAnalysis(imageBase64: string): Promise<any> {
    const stageStart = Date.now()
    this.addStage('vision', 'Performing comprehensive visual analysis', [])

    const visionPromises: Array<Promise<any>> = []
    const apisUsed: string[] = []

    // Clarifai
    if (this.config.enableVisionAPIs.clarifai) {
      visionPromises.push(
        this.analyzeWithClarifai(imageBase64)
          .then(result => ({ clarifai: result, api: 'Clarifai' }))
          .catch(error => ({ clarifai: null, api: 'Clarifai', error }))
      )
      apisUsed.push('Clarifai')
    }

    // Google Vision
    if (this.config.enableVisionAPIs.googleVision) {
      visionPromises.push(
        this.analyzeWithGoogleVision(imageBase64)
          .then(result => ({ google: result, api: 'Google Vision' }))
          .catch(error => ({ google: null, api: 'Google Vision', error }))
      )
      apisUsed.push('Google Vision')
    }

    // Microsoft Vision
    if (this.config.enableVisionAPIs.microsoftVision) {
      visionPromises.push(
        this.analyzeWithMicrosoftVision(imageBase64)
          .then(result => ({ microsoft: result, api: 'Microsoft Vision' }))
          .catch(error => ({ microsoft: null, api: 'Microsoft Vision', error }))
      )
      apisUsed.push('Microsoft Vision')
    }

    // Execute all vision APIs in parallel
    const results = await Promise.allSettled(visionPromises)
    
    // Process results
    const visionData = {
      clarifai: null,
      google: null,
      microsoft: null,
      combined: {
        labels: [],
        objects: [],
        colors: [],
        text: [],
        faces: 0,
        categories: []
      }
    }

    const insights: string[] = []
    let successCount = 0

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && !result.value.error) {
        const data = result.value
        if (data.clarifai) visionData.clarifai = data.clarifai
        if (data.google) visionData.google = data.google
        if (data.microsoft) visionData.microsoft = data.microsoft
        successCount++
        insights.push(`${data.api} analysis completed`)
      } else {
        const error = result.status === 'rejected' ? result.reason : result.value?.error
        console.warn(`Vision API failed:`, error)
      }
    })

    // Combine all vision data
    visionData.combined = this.combineVisionData(visionData.clarifai, visionData.google, visionData.microsoft)
    insights.push(`Combined ${visionData.combined.labels.length} visual elements`)

    this.updateStage('vision', `Vision analysis complete (${successCount}/${apisUsed.length} APIs)`, 
      apisUsed, insights, Date.now() - stageStart, successCount > 0)

    return visionData
  }

  // Stage 2: Initial AI Interpretation
  private async executeStage2_InitialInterpretation(visionData: any): Promise<any> {
    const stageStart = Date.now()
    this.addStage('interpretation', 'Generating initial AI interpretation', ['OpenAI'])

    if (!this.config.enableAI.openai) {
      this.updateStage('interpretation', 'OpenAI disabled, using fallback', [], 
        ['Using basic analysis fallback'], Date.now() - stageStart, true)
      return this.generateFallbackInsights(visionData)
    }

    try {
      const insights = await this.generateInitialInterpretation(visionData.combined)
      this.updateStage('interpretation', 'Initial interpretation complete', ['OpenAI'], 
        [`Generated ${insights.styleInsights?.length || 0} style insights`], 
        Date.now() - stageStart, true)
      return insights
    } catch (error) {
      console.warn('OpenAI interpretation failed, using fallback:', error)
      const fallback = this.generateFallbackInsights(visionData)
      this.updateStage('interpretation', 'OpenAI failed, using fallback', ['OpenAI'], 
        ['Using fallback analysis'], Date.now() - stageStart, false, error instanceof Error ? error.message : 'Unknown error')
      return fallback
    }
  }

  // Stage 3: Targeted Recall - Dynamic API calls based on initial insights
  private async executeStage3_TargetedRecall(visionData: any, initialInsights: any): Promise<any> {
    const stageStart = Date.now()
    this.addStage('recall', 'Performing targeted recall based on AI insights', [])

    const recallData = {
      colorAnalysis: null,
      wikipediaData: null,
      metMuseumData: null,
      artInstituteData: null,
      harvardData: null,
      artSearchData: null,
      textureAnalysis: null,
      emotionalAnalysis: null
    }

    const recallPromises: Array<Promise<any>> = []
    const apisUsed: string[] = []

    // Always perform color analysis (fundamental for art education)
    if (this.config.enableRecallAPIs.colorAnalysis) {
      recallPromises.push(
        this.performColorAnalysis(visionData.combined.colors)
          .then(result => { recallData.colorAnalysis = result; return 'Color Analysis' })
          .catch(error => { console.warn('Color analysis failed:', error); return null })
      )
      apisUsed.push('Color Analysis')
    }

    // Wikipedia search for historical context
    if (this.config.enableRecallAPIs.wikipedia) {
      const searchTerms = this.extractSearchTerms(visionData.combined.labels, initialInsights)
      if (searchTerms.length > 0) {
        recallPromises.push(
          this.searchWikipedia(searchTerms[0])
            .then(result => { recallData.wikipediaData = result; return 'Wikipedia' })
            .catch(error => { console.warn('Wikipedia search failed:', error); return null })
        )
        apisUsed.push('Wikipedia')
      }
    }

    // Met Museum search
    if (this.config.enableRecallAPIs.metMuseum) {
      const searchTerms = this.extractSearchTerms(visionData.combined.labels, initialInsights)
      if (searchTerms.length > 0) {
        recallPromises.push(
          this.searchMetMuseum(searchTerms[0])
            .then(result => { recallData.metMuseumData = result; return 'Met Museum' })
            .catch(error => { console.warn('Met Museum search failed:', error); return null })
        )
        apisUsed.push('Met Museum')
      }
    }

    // Art Institute search
    if (this.config.enableRecallAPIs.artInstitute) {
      const searchTerms = this.extractSearchTerms(visionData.combined.labels, initialInsights)
      if (searchTerms.length > 0) {
        recallPromises.push(
          this.searchArtInstitute(searchTerms[0])
            .then(result => { recallData.artInstituteData = result; return 'Art Institute' })
            .catch(error => { console.warn('Art Institute search failed:', error); return null })
        )
        apisUsed.push('Art Institute')
      }
    }

    // Harvard Art Museums (if API key available)
    if (this.config.enableRecallAPIs.harvard) {
      const searchTerms = this.extractSearchTerms(visionData.combined.labels, initialInsights)
      if (searchTerms.length > 0) {
        recallPromises.push(
          this.searchHarvardArtwork(searchTerms[0])
            .then(result => { recallData.harvardData = result; return 'Harvard' })
            .catch(error => { console.warn('Harvard search failed:', error); return null })
        )
        apisUsed.push('Harvard')
      }
    }

    // Texture analysis if technique mentioned
    if (this.config.enableRecallAPIs.textureAnalysis && this.shouldRecallTexture(initialInsights)) {
      recallPromises.push(
        this.performTextureAnalysis(visionData.combined)
          .then(result => { recallData.textureAnalysis = result; return 'Texture Analysis' })
          .catch(error => { console.warn('Texture analysis failed:', error); return null })
      )
      apisUsed.push('Texture Analysis')
    }

    // Emotional analysis
    if (this.config.enableRecallAPIs.emotionalAnalysis) {
      recallPromises.push(
        this.performEmotionalAnalysis(visionData.combined, initialInsights)
          .then(result => { recallData.emotionalAnalysis = result; return 'Emotional Analysis' })
          .catch(error => { console.warn('Emotional analysis failed:', error); return null })
      )
      apisUsed.push('Emotional Analysis')
    }

    // Execute all recall operations
    const results = await Promise.allSettled(recallPromises)
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value !== null).length
    const insights = results
      .filter(r => r.status === 'fulfilled' && r.value !== null)
      .map(r => r.value)

    this.updateStage('recall', `Targeted recall complete (${successCount}/${apisUsed.length} APIs)`, 
      apisUsed, insights, Date.now() - stageStart, successCount > 0)

    return recallData
  }

  // Stage 4: Final Synthesis
  private async executeStage4_FinalSynthesis(visionData: any, initialInsights: any, recallData: any): Promise<any> {
    const stageStart = Date.now()
    this.addStage('synthesis', 'Generating final educational synthesis', ['OpenAI'])

    if (!this.config.enableAI.openai) {
      this.updateStage('synthesis', 'OpenAI disabled, using fallback', [], 
        ['Using basic synthesis fallback'], Date.now() - stageStart, true)
      return this.generateFallbackSynthesis(visionData, initialInsights, recallData)
    }

    try {
      const synthesis = await this.generateFinalSynthesis(visionData, initialInsights, recallData)
      this.updateStage('synthesis', 'Final synthesis complete', ['OpenAI'], 
        ['Generated comprehensive educational analysis'], Date.now() - stageStart, true)
      return synthesis
    } catch (error) {
      console.warn('OpenAI synthesis failed, using fallback:', error)
      const fallback = this.generateFallbackSynthesis(visionData, initialInsights, recallData)
      this.updateStage('synthesis', 'OpenAI failed, using fallback', ['OpenAI'], 
        ['Using fallback synthesis'], Date.now() - stageStart, false, error instanceof Error ? error.message : 'Unknown error')
      return fallback
    }
  }

  // Helper methods for stage management
  private addStage(stage: string, description: string, apisUsed: string[]) {
    this.stages.push({
      stage: stage as any,
      description,
      apisUsed,
      insights: [],
      timestamp: new Date(),
      success: false
    })
  }

  private updateStage(stage: string, description: string, apisUsed: string[], insights: string[], 
                     duration?: number, success: boolean = true, error?: string) {
    const stageIndex = this.stages.findIndex(s => s.stage === stage)
    if (stageIndex !== -1) {
      this.stages[stageIndex] = {
        ...this.stages[stageIndex],
        description,
        apisUsed,
        insights,
        duration,
        success,
        error
      }
    }
  }

  private extractUsedSources(): string[] {
    const sources = new Set<string>()
    this.stages.forEach(stage => {
      stage.apisUsed.forEach(api => sources.add(api))
    })
    return Array.from(sources)
  }

  // API implementation methods (to be implemented based on existing services)
  private async analyzeWithClarifai(imageBase64: string): Promise<any> {
    // Implementation from existing services
    throw new Error('Clarifai analysis not implemented')
  }

  private async analyzeWithGoogleVision(imageBase64: string): Promise<any> {
    // Implementation from existing services
    throw new Error('Google Vision analysis not implemented')
  }

  private async analyzeWithMicrosoftVision(imageBase64: string): Promise<any> {
    // Implementation from existing services
    throw new Error('Microsoft Vision analysis not implemented')
  }

  private async generateInitialInterpretation(visionData: any): Promise<any> {
    // Implementation from existing services
    throw new Error('Initial interpretation not implemented')
  }

  private async performColorAnalysis(colors: string[]): Promise<any> {
    // Implementation from existing services
    throw new Error('Color analysis not implemented')
  }

  private async searchWikipedia(query: string): Promise<any> {
    // Implementation from existing services
    throw new Error('Wikipedia search not implemented')
  }

  private async searchMetMuseum(query: string): Promise<any> {
    // Implementation from existing services
    throw new Error('Met Museum search not implemented')
  }

  private async searchArtInstitute(query: string): Promise<any> {
    // Implementation from existing services
    throw new Error('Art Institute search not implemented')
  }

  private async searchHarvardArtwork(query: string): Promise<any> {
    // Implementation from existing services
    throw new Error('Harvard search not implemented')
  }

  private async performTextureAnalysis(visionData: any): Promise<any> {
    // Implementation from existing services
    throw new Error('Texture analysis not implemented')
  }

  private async performEmotionalAnalysis(visionData: any, initialInsights: any): Promise<any> {
    // Implementation from existing services
    throw new Error('Emotional analysis not implemented')
  }

  private async generateFinalSynthesis(visionData: any, initialInsights: any, recallData: any): Promise<any> {
    // Implementation from existing services
    throw new Error('Final synthesis not implemented')
  }

  // Utility methods
  private combineVisionData(clarifai: any, google: any, microsoft: any): any {
    return {
      labels: [
        ...(clarifai?.labels || []),
        ...(google?.labels || []),
        ...(microsoft?.labels || [])
      ].filter((label, index, self) => self.indexOf(label) === index),
      
      objects: [
        ...(google?.objects || []),
        ...(microsoft?.objects || [])
      ].filter((obj, index, self) => self.indexOf(obj) === index),
      
      colors: [
        ...(google?.colors || []),
        ...(microsoft?.colors || [])
      ].filter((color, index, self) => self.indexOf(color) === index),
      
      text: [
        ...(google?.text || []),
        ...(microsoft?.text || [])
      ].filter((text, index, self) => self.indexOf(text) === index),
      
      faces: (google?.faces || 0) + (microsoft?.faces || 0),
      categories: microsoft?.categories || []
    }
  }

  private extractSearchTerms(labels: string[], insights: any): string[] {
    const terms = [...labels]
    
    if (insights.styleInsights) {
      terms.push(...insights.styleInsights.slice(0, 3))
    }
    if (insights.themeInsights) {
      terms.push(...insights.themeInsights.slice(0, 3))
    }
    if (insights.techniqueInsights) {
      terms.push(...insights.techniqueInsights.slice(0, 2))
    }
    if (insights.mediumInsights) {
      terms.push(...insights.mediumInsights.slice(0, 2))
    }
    
    return [...new Set(terms)]
      .map(term => term.replace(/[^a-zA-Z0-9\s-]/g, ' ').trim())
      .filter(term => term.length > 2)
      .slice(0, 5)
  }

  private shouldRecallTexture(insights: any): boolean {
    const text = JSON.stringify(insights).toLowerCase()
    return text.includes('brush') || text.includes('texture') || text.includes('paint')
  }

  private generateFallbackInsights(visionData: any): any {
    return {
      styleInsights: ['Basic visual analysis completed'],
      techniqueInsights: ['Technique analysis not available'],
      themeInsights: ['Theme analysis not available'],
      mediumInsights: ['Medium analysis not available'],
      reflectionQuestions: ['What do you notice about this artwork?'],
      learningObjectives: ['Develop basic visual literacy skills']
    }
  }

  private generateFallbackSynthesis(visionData: any, initialInsights: any, recallData: any): any {
    return {
      styleAnalysis: {
        primaryStyle: 'Unknown',
        styleCharacteristics: ['Visual elements detected'],
        movementContext: 'Analysis not available',
        stylisticInfluences: [],
        visualLanguage: 'Basic visual analysis',
        educationalInsights: ['Focus on visual observation']
      },
      techniqueAnalysis: {
        primaryTechniques: ['Visual composition'],
        materialProperties: ['Unknown'],
        applicationMethods: ['Unknown'],
        technicalInnovations: [],
        skillLevel: 'Unknown',
        educationalValue: ['Basic visual literacy']
      },
      themeAnalysis: {
        primaryThemes: ['Visual expression'],
        symbolicElements: [],
        emotionalTone: 'Unknown',
        culturalContext: 'Unknown',
        narrativeElements: [],
        interpretiveApproaches: ['Visual observation']
      },
      mediumAnalysis: {
        primaryMedium: 'Unknown',
        materialCharacteristics: ['Unknown'],
        historicalUsage: 'Unknown',
        technicalAdvantages: [],
        conservationNotes: [],
        educationalSignificance: ['Visual learning']
      },
      colorAnalysis: {
        colorPalette: [],
        colorHarmony: 'Unknown',
        emotionalImpact: 'Unknown',
        symbolicMeaning: [],
        colorTheory: [],
        educationalInsights: ['Color observation']
      },
      compositionAnalysis: {
        compositionalPrinciples: ['Visual balance'],
        visualFlow: 'Unknown',
        focalPoints: [],
        spatialRelationships: [],
        balanceAndRhythm: 'Unknown',
        educationalApplications: ['Visual analysis']
      },
      reflectionQuestions: [
        {
          category: 'observation',
          question: 'What do you notice first?',
          educationalGoal: 'Develop observational skills'
        }
      ],
      learningObjectives: [
        {
          skill: 'Visual Analysis',
          description: 'Learn to observe visual elements',
          assessmentMethod: 'Observation and discussion',
          difficulty: 'beginner'
        }
      ],
      discussionPrompts: [
        {
          topic: 'Visual Elements',
          question: 'What visual elements can you identify?',
          context: 'Understanding visual composition',
          suggestedResponses: ['Color', 'Shape', 'Line', 'Texture']
        }
      ],
      artisticMovements: [],
      visualElements: [],
      comparativeExamples: [],
      historicalContext: {
        timePeriod: 'Unknown',
        culturalBackground: 'Unknown',
        artisticClimate: 'Unknown',
        socialInfluences: [],
        educationalSignificance: 'Visual learning opportunity'
      },
      learningResources: {
        keyConcepts: ['Visual Elements', 'Composition', 'Color'],
        discussionPrompts: ['What do you see?', 'How does it make you feel?'],
        learningActivities: ['Visual observation', 'Color identification'],
        vocabulary: ['Color', 'Shape', 'Line', 'Texture', 'Composition']
      },
      confidence: 0.3,
      sources: ['Fallback Analysis'],
      analysisStages: []
    }
  }
}

export default new UnifiedWorkflowService()
