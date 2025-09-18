// Enhanced Educational Art Analysis Service
// Implements call-and-recall workflow for deep educational engagement
// Focuses on style, technique, theme, and medium rather than identification

export interface EducationalAnalysis {
  // Core educational content
  styleAnalysis: StyleAnalysis
  techniqueAnalysis: TechniqueAnalysis
  themeAnalysis: ThemeAnalysis
  mediumAnalysis: MediumAnalysis
  colorAnalysis: EducationalColorAnalysis
  compositionAnalysis: CompositionAnalysis
  
  // Educational engagement
  reflectionQuestions: ReflectionQuestion[]
  learningObjectives: LearningObjective[]
  discussionPrompts: DiscussionPrompt[]
  artisticMovements: ArtisticMovement[]
  
  // Interactive features
  visualElements: VisualElement[]
  comparativeExamples: ComparativeExample[]
  historicalContext: HistoricalContext
  
  // Metadata
  confidence: number
  sources: string[]
  analysisStages: AnalysisStage[]
}

export interface StyleAnalysis {
  primaryStyle: string
  styleCharacteristics: string[]
  movementContext: string
  stylisticInfluences: string[]
  visualLanguage: string
  educationalInsights: string[]
}

export interface TechniqueAnalysis {
  primaryTechniques: string[]
  materialProperties: string[]
  applicationMethods: string[]
  technicalInnovations: string[]
  skillLevel: string
  educationalValue: string[]
}

export interface ThemeAnalysis {
  primaryThemes: string[]
  symbolicElements: string[]
  emotionalTone: string
  culturalContext: string
  narrativeElements: string[]
  interpretiveApproaches: string[]
}

export interface MediumAnalysis {
  primaryMedium: string
  materialCharacteristics: string[]
  historicalUsage: string
  technicalAdvantages: string[]
  conservationNotes: string[]
  educationalSignificance: string[]
}

export interface EducationalColorAnalysis {
  colorPalette: ColorPalette[]
  colorHarmony: string
  emotionalImpact: string
  symbolicMeaning: string[]
  colorTheory: string[]
  educationalInsights: string[]
}

export interface CompositionAnalysis {
  compositionalPrinciples: string[]
  visualFlow: string
  focalPoints: string[]
  spatialRelationships: string[]
  balanceAndRhythm: string[]
  educationalApplications: string[]
}

export interface ReflectionQuestion {
  category: 'observation' | 'interpretation' | 'connection' | 'technique'
  question: string
  followUp?: string
  educationalGoal: string
}

export interface LearningObjective {
  skill: string
  description: string
  assessmentMethod: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface DiscussionPrompt {
  topic: string
  question: string
  context: string
  suggestedResponses: string[]
}

export interface ArtisticMovement {
  name: string
  timePeriod: string
  characteristics: string[]
  keyArtists: string[]
  culturalContext: string
  educationalRelevance: string
}

export interface VisualElement {
  element: string
  description: string
  educationalValue: string
  observationTips: string[]
  relatedConcepts: string[]
}

export interface ComparativeExample {
  title: string
  artist: string
  similarity: string
  contrast: string
  educationalValue: string
  imageUrl?: string
}

export interface HistoricalContext {
  timePeriod: string
  culturalBackground: string
  artisticClimate: string
  socialInfluences: string[]
  educationalSignificance: string
}

export interface AnalysisStage {
  stage: 'vision' | 'interpretation' | 'recall' | 'synthesis'
  description: string
  apisUsed: string[]
  insights: string[]
  timestamp: Date
}

export interface ColorPalette {
  hex: string
  name: string
  percentage: number
  emotionalAssociation: string
  symbolicMeaning: string
  educationalNote: string
}

class EducationalArtService {
  private apiKeys = {
    googleVision: import.meta.env.VITE_GOOGLE_VISION_API_KEY || '',
    microsoftVision: import.meta.env.VITE_MICROSOFT_VISION_API_KEY || '',
    microsoftEndpoint: import.meta.env.VITE_MICROSOFT_VISION_ENDPOINT || '',
    clarifai: import.meta.env.VITE_CLARIFAI_API_KEY || '',
    openai: import.meta.env.VITE_OPENAI_API_KEY || '',
    harvard: import.meta.env.VITE_HARVARD_ART_MUSEUMS_API_KEY || '',
    artsearch: import.meta.env.VITE_ARTSEARCH_API_KEY || '',
  }

  private analysisStages: AnalysisStage[] = []

  // Stage 1: Visual Analysis - Collect raw visual data from multiple APIs
  async performVisualAnalysis(imageBase64: string): Promise<{
    clarifai: any
    google: any
    microsoft: any
    combined: any
  }> {
    this.addAnalysisStage('vision', 'Collecting visual data from multiple vision APIs', [])
    
    const results = await Promise.allSettled([
      this.analyzeWithClarifai(imageBase64),
      this.analyzeWithGoogleVision(imageBase64),
      this.analyzeWithMicrosoftVision(imageBase64)
    ])

    const clarifai = results[0].status === 'fulfilled' ? results[0].value : null
    const google = results[1].status === 'fulfilled' ? results[1].value : null
    const microsoft = results[2].status === 'fulfilled' ? results[2].value : null

    // Combine visual data
    const combined = this.combineVisionData(clarifai, google, microsoft)
    
    this.addAnalysisStage('vision', 'Visual analysis complete', 
      ['Clarifai', 'Google Vision', 'Microsoft Vision'], 
      [`Detected ${combined.labels?.length || 0} visual elements`]
    )

    return { clarifai, google, microsoft, combined }
  }

  // Stage 2: Initial AI Interpretation - Generate educational insights
  async generateInitialInterpretation(visionData: any): Promise<{
    styleInsights: string[]
    techniqueInsights: string[]
    themeInsights: string[]
    mediumInsights: string[]
    reflectionQuestions: string[]
    learningObjectives: string[]
  }> {
    this.addAnalysisStage('interpretation', 'Generating initial educational interpretation', ['OpenAI'])

    if (!this.apiKeys.openai) {
      throw new Error('OpenAI API key required for educational analysis')
    }

    const prompt = this.createEducationalPrompt(visionData)
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKeys.openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert art educator who helps students understand art through deep observation and analysis. 
              Focus on style, technique, theme, and medium rather than identifying specific artists or titles.
              Generate educational insights that encourage slow, thoughtful looking and learning.
              Respond with valid JSON only.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.3
        })
      })

      const data = await response.json()
      const content = data.choices[0]?.message?.content
      
      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      const analysis = JSON.parse(content)
      
      this.addAnalysisStage('interpretation', 'Initial interpretation complete', ['OpenAI'], 
        [`Generated ${analysis.styleInsights?.length || 0} style insights`]
      )

      return analysis
    } catch (error) {
      console.error('OpenAI interpretation error:', error)
      throw error
    }
  }

  // Stage 3: Targeted Recall - Deep dive based on initial insights
  async performTargetedRecall(
    visionData: any, 
    initialInsights: any
  ): Promise<{
    textureAnalysis?: any
    colorAnalysis?: any
    historicalContext?: any
    comparativeExamples?: any
    wikipediaData?: any
  }> {
    this.addAnalysisStage('recall', 'Performing targeted recall based on initial insights', [])
    
    const recallPromises = []

    // Recall for texture/technique if mentioned
    if (this.shouldRecallTexture(initialInsights)) {
      recallPromises.push(
        this.analyzeTextureDetails(visionData).catch(() => null)
      )
    }

    // Recall for color theory if colors are prominent
    if (this.shouldRecallColor(initialInsights, visionData)) {
      recallPromises.push(
        this.analyzeColorTheory(visionData).catch(() => null)
      )
    }

    // Recall for historical context
    if (this.shouldRecallHistory(initialInsights)) {
      recallPromises.push(
        this.searchHistoricalContext(initialInsights).catch(() => null)
      )
    }

    // Recall for comparative examples
    if (this.shouldRecallComparisons(initialInsights)) {
      recallPromises.push(
        this.findComparativeExamples(initialInsights).catch(() => null)
      )
    }

    // Recall for Wikipedia educational content
    recallPromises.push(
      this.searchWikipediaEducational(initialInsights).catch(() => null)
    )

    const results = await Promise.all(recallPromises)
    
    const recallData = {
      textureAnalysis: results[0] || null,
      colorAnalysis: results[1] || null,
      historicalContext: results[2] || null,
      comparativeExamples: results[3] || null,
      wikipediaData: results[4] || null
    }

    this.addAnalysisStage('recall', 'Targeted recall complete', 
      ['Google Vision', 'Wikipedia', 'Art APIs'], 
      [`Retrieved ${Object.values(recallData).filter(Boolean).length} additional data sources`]
    )

    return recallData
  }

  // Stage 4: Final Synthesis - Create comprehensive educational narrative
  async generateFinalSynthesis(
    visionData: any,
    initialInsights: any,
    recallData: any
  ): Promise<EducationalAnalysis> {
    this.addAnalysisStage('synthesis', 'Generating final educational synthesis', ['OpenAI'])

    if (!this.apiKeys.openai) {
      throw new Error('OpenAI API key required for final synthesis')
    }

    const synthesisPrompt = this.createSynthesisPrompt(visionData, initialInsights, recallData)
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKeys.openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a master art educator creating comprehensive educational content.
              Generate engaging, educational analysis that teaches students how to look at art.
              Focus on style, technique, theme, and medium. Include reflection questions and learning objectives.
              Create content that encourages slow, thoughtful engagement with the artwork.
              Respond with valid JSON only.`
            },
            {
              role: 'user',
              content: synthesisPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.4
        })
      })

      const data = await response.json()
      const content = data.choices[0]?.message?.content
      
      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      const synthesis = JSON.parse(content)
      
      // Add metadata
      synthesis.confidence = this.calculateConfidence(visionData, initialInsights, recallData)
      synthesis.sources = this.getUsedSources()
      synthesis.analysisStages = [...this.analysisStages]

      this.addAnalysisStage('synthesis', 'Final synthesis complete', ['OpenAI'], 
        ['Generated comprehensive educational analysis']
      )

      return synthesis
    } catch (error) {
      console.error('Final synthesis error:', error)
      throw error
    }
  }

  // Main educational analysis workflow
  async analyzeArtworkEducationally(imageFile: File): Promise<EducationalAnalysis> {
    console.log('🎓 Starting educational art analysis workflow')
    
    // Reset analysis stages
    this.analysisStages = []

    try {
      // Convert image to base64
      const imageBase64 = await this.fileToBase64(imageFile)

      // Stage 1: Visual Analysis
      const visionData = await this.performVisualAnalysis(imageBase64)

      // Stage 2: Initial Interpretation
      const initialInsights = await this.generateInitialInterpretation(visionData.combined)

      // Stage 3: Targeted Recall
      const recallData = await this.performTargetedRecall(visionData.combined, initialInsights)

      // Stage 4: Final Synthesis
      const finalAnalysis = await this.generateFinalSynthesis(
        visionData.combined,
        initialInsights,
        recallData
      )

      console.log('✅ Educational analysis complete')
      return finalAnalysis

    } catch (error) {
      console.error('Educational analysis error:', error)
      throw error
    }
  }

  // Helper methods for individual API calls
  private async analyzeWithClarifai(imageBase64: string): Promise<any> {
    if (!this.apiKeys.clarifai) {
      throw new Error('Clarifai API key not configured')
    }

    const base64Content = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64

    const response = await fetch(`/proxy/clarifai/v2/models/general-image-recognition/outputs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${this.apiKeys.clarifai}`
      },
      body: JSON.stringify({
        inputs: [{
          data: {
            image: { base64: base64Content }
          }
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Clarifai API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      labels: data.outputs?.[0]?.data?.concepts?.map((c: any) => c.name) || [],
      confidence: data.outputs?.[0]?.data?.concepts?.map((c: any) => c.value) || []
    }
  }

  private async analyzeWithGoogleVision(imageBase64: string): Promise<any> {
    if (!this.apiKeys.googleVision) {
      throw new Error('Google Vision API key not configured')
    }

    const base64Content = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKeys.googleVision}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64Content },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 15 },
              { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
              { type: 'TEXT_DETECTION', maxResults: 5 },
              { type: 'IMAGE_PROPERTIES', maxResults: 1 },
              { type: 'FACE_DETECTION', maxResults: 5 }
            ]
          }]
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.status}`)
    }

    const data = await response.json()
    const result = data.responses[0]

    return {
      labels: result.labelAnnotations?.map((l: any) => l.description) || [],
      objects: result.localizedObjectAnnotations?.map((o: any) => o.name) || [],
      text: result.textAnnotations?.map((t: any) => t.description) || [],
      colors: result.imagePropertiesAnnotation?.dominantColors?.colors?.map((c: any) => 
        `rgb(${c.color.red}, ${c.color.green}, ${c.color.blue})`
      ) || [],
      faces: result.faceAnnotations?.length || 0
    }
  }

  private async analyzeWithMicrosoftVision(imageBase64: string): Promise<any> {
    if (!this.apiKeys.microsoftVision || !this.apiKeys.microsoftEndpoint) {
      throw new Error('Microsoft Vision API not configured')
    }

    const base64Content = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64

    const response = await fetch(
      `${this.apiKeys.microsoftEndpoint}vision/v3.2/analyze?visualFeatures=Categories,Description,Objects,Color,Adult,Tags`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKeys.microsoftVision,
          'Content-Type': 'application/octet-stream',
        },
        body: Buffer.from(base64Content, 'base64')
      }
    )

    if (!response.ok) {
      throw new Error(`Microsoft Vision API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      labels: data.description?.tags || [],
      objects: data.objects?.map((o: any) => o.object) || [],
      text: data.description?.captions?.map((c: any) => c.text) || [],
      colors: data.color?.dominantColors || [],
      categories: data.categories?.map((c: any) => c.name) || []
    }
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

  private createEducationalPrompt(visionData: any): string {
    return `Analyze this artwork for educational purposes. Focus on style, technique, theme, and medium rather than identification.

Visual Data:
- Labels: ${visionData.labels?.join(', ') || 'None detected'}
- Objects: ${visionData.objects?.join(', ') || 'None detected'}
- Colors: ${visionData.colors?.join(', ') || 'None detected'}
- Text: ${visionData.text?.join(', ') || 'None detected'}

Provide educational insights in this JSON format:
{
  "styleInsights": ["Detailed observation about artistic style and movement characteristics", "Analysis of visual language and stylistic choices"],
  "techniqueInsights": ["Technical observations about materials and methods", "Analysis of skill level and application techniques"],
  "themeInsights": ["Thematic content and symbolic elements", "Emotional tone and narrative elements"],
  "mediumInsights": ["Material analysis and historical context", "Technical properties and educational significance"],
  "reflectionQuestions": ["What do you notice first when looking at this artwork?", "How does the artist use color to create mood?", "What techniques can you identify in the brushwork?"],
  "learningObjectives": ["Develop visual literacy skills", "Understand color theory principles", "Analyze compositional techniques"]
}`
  }

  private createSynthesisPrompt(visionData: any, initialInsights: any, recallData: any): string {
    return `Create a comprehensive educational analysis that teaches students how to look at and understand art.

Vision Data: ${JSON.stringify(visionData, null, 2)}
Initial Insights: ${JSON.stringify(initialInsights, null, 2)}
Recall Data: ${JSON.stringify(recallData, null, 2)}

Generate a complete educational analysis in this JSON format:
{
  "styleAnalysis": {
    "primaryStyle": "Artistic style name",
    "styleCharacteristics": ["Characteristic 1", "Characteristic 2"],
    "movementContext": "Historical movement context",
    "stylisticInfluences": ["Influence 1", "Influence 2"],
    "visualLanguage": "Description of visual language",
    "educationalInsights": ["Educational insight 1", "Educational insight 2"]
  },
  "techniqueAnalysis": {
    "primaryTechniques": ["Technique 1", "Technique 2"],
    "materialProperties": ["Property 1", "Property 2"],
    "applicationMethods": ["Method 1", "Method 2"],
    "technicalInnovations": ["Innovation 1", "Innovation 2"],
    "skillLevel": "Assessment of technical skill",
    "educationalValue": ["Value 1", "Value 2"]
  },
  "themeAnalysis": {
    "primaryThemes": ["Theme 1", "Theme 2"],
    "symbolicElements": ["Element 1", "Element 2"],
    "emotionalTone": "Description of emotional impact",
    "culturalContext": "Cultural background",
    "narrativeElements": ["Element 1", "Element 2"],
    "interpretiveApproaches": ["Approach 1", "Approach 2"]
  },
  "mediumAnalysis": {
    "primaryMedium": "Primary medium used",
    "materialCharacteristics": ["Characteristic 1", "Characteristic 2"],
    "historicalUsage": "Historical context of medium",
    "technicalAdvantages": ["Advantage 1", "Advantage 2"],
    "conservationNotes": ["Note 1", "Note 2"],
    "educationalSignificance": ["Significance 1", "Significance 2"]
  },
  "colorAnalysis": {
    "colorPalette": [
      {
        "hex": "#FF0000",
        "name": "Red",
        "percentage": 25,
        "emotionalAssociation": "Passion",
        "symbolicMeaning": "Energy",
        "educationalNote": "Creates focal point"
      }
    ],
    "colorHarmony": "Description of color relationships",
    "emotionalImpact": "How colors affect mood",
    "symbolicMeaning": ["Meaning 1", "Meaning 2"],
    "colorTheory": ["Theory concept 1", "Theory concept 2"],
    "educationalInsights": ["Insight 1", "Insight 2"]
  },
  "compositionAnalysis": {
    "compositionalPrinciples": ["Principle 1", "Principle 2"],
    "visualFlow": "How the eye moves through the composition",
    "focalPoints": ["Point 1", "Point 2"],
    "spatialRelationships": ["Relationship 1", "Relationship 2"],
    "balanceAndRhythm": "Description of balance and rhythm",
    "educationalApplications": ["Application 1", "Application 2"]
  },
  "reflectionQuestions": [
    {
      "category": "observation",
      "question": "What do you notice first?",
      "followUp": "What draws your eye next?",
      "educationalGoal": "Develop observational skills"
    }
  ],
  "learningObjectives": [
    {
      "skill": "Visual Analysis",
      "description": "Learn to analyze visual elements",
      "assessmentMethod": "Observation and discussion",
      "difficulty": "beginner"
    }
  ],
  "discussionPrompts": [
    {
      "topic": "Color and Mood",
      "question": "How do the colors affect your emotional response?",
      "context": "Understanding color psychology",
      "suggestedResponses": ["Response 1", "Response 2"]
    }
  ],
  "artisticMovements": [
    {
      "name": "Movement Name",
      "timePeriod": "Time period",
      "characteristics": ["Characteristic 1", "Characteristic 2"],
      "keyArtists": ["Artist 1", "Artist 2"],
      "culturalContext": "Cultural background",
      "educationalRelevance": "Why this matters for learning"
    }
  ],
  "visualElements": [
    {
      "element": "Line",
      "description": "Description of line usage",
      "educationalValue": "What students can learn",
      "observationTips": ["Tip 1", "Tip 2"],
      "relatedConcepts": ["Concept 1", "Concept 2"]
    }
  ],
  "comparativeExamples": [
    {
      "title": "Example Title",
      "artist": "Artist Name",
      "similarity": "What's similar",
      "contrast": "What's different",
      "educationalValue": "Learning opportunity",
      "imageUrl": "Optional image URL"
    }
  ],
  "historicalContext": {
    "timePeriod": "When this was created",
    "culturalBackground": "Cultural context",
    "artisticClimate": "Artistic environment",
    "socialInfluences": ["Influence 1", "Influence 2"],
    "educationalSignificance": "Why this matters for education"
  }
}`
  }

  // Recall decision methods
  private shouldRecallTexture(insights: any): boolean {
    const text = JSON.stringify(insights).toLowerCase()
    return text.includes('brush') || text.includes('texture') || text.includes('paint')
  }

  private shouldRecallColor(insights: any, visionData: any): boolean {
    return (visionData.colors?.length > 0) || 
           JSON.stringify(insights).toLowerCase().includes('color')
  }

  private shouldRecallHistory(insights: any): boolean {
    const text = JSON.stringify(insights).toLowerCase()
    return text.includes('historical') || text.includes('period') || text.includes('movement')
  }

  private shouldRecallComparisons(insights: any): boolean {
    const text = JSON.stringify(insights).toLowerCase()
    return text.includes('similar') || text.includes('compare') || text.includes('style')
  }

  // Recall implementation methods
  private async analyzeTextureDetails(visionData: any): Promise<any> {
    // Implement texture analysis using Google Vision with specific features
    return { textureDetails: 'Detailed texture analysis' }
  }

  private async analyzeColorTheory(visionData: any): Promise<any> {
    // Implement advanced color theory analysis
    return { colorTheory: 'Advanced color analysis' }
  }

  private async searchHistoricalContext(insights: any): Promise<any> {
    // Search for historical context using Wikipedia and art APIs
    return { historicalContext: 'Historical context data' }
  }

  private async findComparativeExamples(insights: any): Promise<any> {
    // Find similar artworks for comparison
    return { examples: 'Comparative examples' }
  }

  private async searchWikipediaEducational(insights: any): Promise<any> {
    // Search Wikipedia for educational content
    return { wikipedia: 'Educational Wikipedia content' }
  }

  // Utility methods
  private addAnalysisStage(stage: string, description: string, apisUsed: string[], insights: string[] = []) {
    this.analysisStages.push({
      stage: stage as any,
      description,
      apisUsed,
      insights,
      timestamp: new Date()
    })
  }

  private calculateConfidence(visionData: any, initialInsights: any, recallData: any): number {
    // Calculate confidence based on data quality and API responses
    let confidence = 0.5 // Base confidence
    
    if (visionData.labels?.length > 0) confidence += 0.1
    if (visionData.objects?.length > 0) confidence += 0.1
    if (visionData.colors?.length > 0) confidence += 0.1
    if (initialInsights.styleInsights?.length > 0) confidence += 0.1
    if (recallData.historicalContext) confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }

  private getUsedSources(): string[] {
    const sources = new Set<string>()
    this.analysisStages.forEach(stage => {
      stage.apisUsed.forEach(api => sources.add(api))
    })
    return Array.from(sources)
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }
}

export default new EducationalArtService()
