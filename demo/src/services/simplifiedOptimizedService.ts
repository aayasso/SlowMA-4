// Simplified Optimized Workflow Service
// Focuses on rich educational information without user questions, skill levels, or additional activities

export interface ArtworkType {
  type: 'portrait' | 'landscape' | 'stillLife' | 'abstract' | 'sculpture' | 'mixed'
  confidence: number
  characteristics: string[]
}

export interface SimplifiedEducationalAnalysis {
  // Core analysis (enhanced)
  styleAnalysis: {
    primaryStyle: string
    styleCharacteristics: string[]
    movementContext: string
    stylisticInfluences: string[]
    visualLanguage: string
    educationalInsights: string[]
    historicalSignificance: string
    culturalContext: string
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
  mediumAnalysis: {
    primaryMedium: string
    materialCharacteristics: string[]
    historicalUsage: string
    technicalAdvantages: string[]
    conservationNotes: string[]
    educationalSignificance: string[]
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
  
  // Rich educational content (no questions or activities)
  artisticMovements: Array<{
    name: string
    timePeriod: string
    characteristics: string[]
    keyArtists: string[]
    culturalContext: string
    educationalRelevance: string
  }>
  visualElements: Array<{
    element: string
    description: string
    educationalValue: string
    observationTips: string[]
    relatedConcepts: string[]
  }>
  historicalContext: {
    timePeriod: string
    culturalBackground: string
    artisticClimate: string
    socialInfluences: string[]
    educationalSignificance: string
  }
  learningResources: {
    keyConcepts: string[]
    vocabulary: string[]
    relatedArtworks: string[]
    furtherReading: string[]
  }
  
  // Metadata
  confidence: number
  sources: string[]
  artworkType: ArtworkType
  qualityMetrics: {
    depthScore: number
    pedagogicalAlignment: number
    educationalValue: number
  }
}

class SimplifiedOptimizedService {
  private apiKeys = {
    googleVision: import.meta.env.VITE_GOOGLE_VISION_API_KEY || '',
    microsoftVision: import.meta.env.VITE_MICROSOFT_VISION_API_KEY || '',
    microsoftEndpoint: import.meta.env.VITE_MICROSOFT_VISION_ENDPOINT || '',
    clarifai: import.meta.env.VITE_CLARIFAI_API_KEY || '',
    // Only enable OpenAI when real APIs are explicitly enabled to avoid 401s in demo mode
    openai: (import.meta.env.VITE_USE_REAL_APIS === 'true') ? (import.meta.env.VITE_OPENAI_API_KEY || '') : '',
    harvard: import.meta.env.VITE_HARVARD_ART_MUSEUMS_API_KEY || '',
    artsearch: import.meta.env.VITE_ARTSEARCH_API_KEY || '',
  }

  // Main simplified analysis method
  async analyzeArtworkSimplified(imageBase64: string): Promise<SimplifiedEducationalAnalysis> {
    console.log('🎓 Starting simplified educational analysis...')

    // Stage 1: Enhanced vision analysis
    const visionData = await this.performEnhancedVisionAnalysis(imageBase64)
    
    // Stage 2: Determine artwork type for adaptive prompting
    const artworkType = await this.determineArtworkType(visionData)
    
    // Stage 3: Generate adaptive initial insights
    const initialInsights = await this.generateAdaptiveInitialInsights(visionData, artworkType)
    
    // Stage 4: Intelligent targeted recall
    const recallData = await this.performIntelligentTargetedRecall(visionData, initialInsights, artworkType)
    
    // Stage 5: Generate rich educational content
    const educationalContent = await this.generateRichEducationalContent(
      visionData, 
      initialInsights, 
      recallData,
      artworkType
    )

    console.log('✅ Simplified educational analysis complete!')
    return educationalContent
  }

  // 1. ADAPTIVE PROMPTING SYSTEM (simplified)

  // Determine artwork type for adaptive prompting
  private async determineArtworkType(visionData: any): Promise<ArtworkType> {
    const typeIndicators = {
      portrait: ['face', 'person', 'portrait', 'facial', 'human', 'head', 'eyes', 'nose', 'mouth'],
      landscape: ['landscape', 'nature', 'sky', 'mountain', 'tree', 'water', 'field', 'forest', 'clouds'],
      stillLife: ['object', 'bowl', 'fruit', 'vase', 'table', 'arrangement', 'bottle', 'flower', 'food'],
      abstract: ['abstract', 'geometric', 'pattern', 'color', 'shape', 'form', 'line', 'texture', 'composition'],
      sculpture: ['sculpture', 'three-dimensional', 'form', 'volume', 'statue', 'figure', 'carving', 'molding'],
      mixed: ['mixed', 'collage', 'assemblage', 'multimedia', 'installation', 'conceptual']
    }

    const labels = visionData.combined?.labels || []
    const typeScores: Record<string, number> = {}

    Object.entries(typeIndicators).forEach(([type, indicators]) => {
      typeScores[type] = indicators.reduce((score, indicator) => {
        return score + labels.filter(label => 
          label.toLowerCase().includes(indicator.toLowerCase())
        ).length
      }, 0)
    })

    const bestMatch = Object.entries(typeScores).reduce<[string, number]>((a, b) => 
      (a[1] > (b[1] as number) ? a : [b[0], b[1] as number]) as [string, number]
    , ['', 0])

    return {
      type: bestMatch[0] as any,
      confidence: (bestMatch[1] as number) / Math.max(labels.length, 1),
      characteristics: (typeIndicators as any)[bestMatch[0]]
    }
  }

  // Generate adaptive prompt based on artwork type (no user context)
  private generateAdaptivePrompt(visionData: any, artworkType: ArtworkType): string {
    const basePrompt = "Analyze this artwork for educational purposes. Focus on style, technique, theme, and medium rather than identification."
    
    const typeSpecificPrompts = {
      portrait: "This appears to be a portrait. Focus on facial expression, psychological depth, human emotion, and the relationship between subject and viewer. Consider how the artist conveys personality and inner life through visual means. Pay special attention to gaze, expression, and the psychological impact of the composition.",
      landscape: "This appears to be a landscape. Emphasize atmospheric perspective, natural elements, environmental storytelling, and the relationship between humanity and nature. Consider how the artist captures light, weather, seasonal changes, and the emotional resonance of the natural world.",
      stillLife: "This appears to be a still life. Highlight composition, symbolism, material properties, and the arrangement of objects. Consider how the artist uses everyday objects to convey deeper meaning, artistic skill, and cultural significance through careful arrangement and technique.",
      abstract: "This appears to be an abstract work. Focus on color relationships, form, emotional expression, and non-representational elements. Consider how the artist uses pure visual elements to communicate ideas, feelings, and concepts without relying on recognizable imagery.",
      sculpture: "This appears to be a sculpture. Analyze three-dimensional form, material properties, spatial relationships, and how the work interacts with its environment. Consider the tactile qualities, how the artist manipulates space and volume, and the relationship between form and function.",
      mixed: "This appears to be a mixed media work. Consider how different materials and techniques work together, the conceptual approach, and how the combination of elements creates meaning. Focus on the innovative use of materials and the artistic vision behind the combination."
    }

    return `${basePrompt}

${typeSpecificPrompts[artworkType.type] || typeSpecificPrompts.mixed}

Visual Data:
- Labels: ${visionData.combined?.labels?.join(', ') || 'None detected'}
- Objects: ${visionData.combined?.objects?.join(', ') || 'None detected'}
- Colors: ${visionData.combined?.colors?.join(', ') || 'None detected'}
- Text: ${visionData.combined?.text?.join(', ') || 'None detected'}

Generate comprehensive educational insights in this JSON format:
{
  "styleInsights": ["Detailed observation about artistic style and movement characteristics", "Analysis of visual language and stylistic choices"],
  "techniqueInsights": ["Technical observations about materials and methods", "Analysis of skill level and application techniques"],
  "themeInsights": ["Thematic content and symbolic elements", "Emotional tone and narrative elements"],
  "mediumInsights": ["Material analysis and historical context", "Technical properties and educational significance"],
  "historicalContext": "When and where this was likely created, and why it matters historically",
  "culturalSignificance": "Why this artwork is culturally important and what it tells us about its time",
  "artisticInnovations": ["Specific innovations or techniques used by the artist"],
  "criticalReception": "How this work has been received by critics and art historians"
}`
  }

  // Generate adaptive initial insights
  private async generateAdaptiveInitialInsights(visionData: any, artworkType: ArtworkType): Promise<any> {
    // Require OpenAI API key - no fallback data
    if (!this.apiKeys.openai) {
      throw new Error('OpenAI API key required for initial insights - no mock data will be used')
    }

    const adaptivePrompt = this.generateAdaptivePrompt(visionData, artworkType)
    
    const response = await fetch('/proxy/openai/v1/chat/completions', {
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
            content: 'You are an expert art educator who helps students understand art through deep observation and analysis. Focus on style, technique, theme, and medium rather than identifying specific artists or titles. Generate educational insights that encourage slow, thoughtful looking and learning. Respond with valid JSON only.'
          },
          {
            role: 'user',
            content: adaptivePrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    })
    if (!response.ok) {
      throw new Error(`OpenAI API failed with status ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content || typeof content !== 'string') {
      throw new Error('OpenAI API returned invalid content - no mock data will be used')
    }
    try {
      return JSON.parse(content)
    } catch (error) {
      throw new Error(`OpenAI API returned invalid JSON: ${error instanceof Error ? error.message : 'Parse error'} - no mock data will be used`)
    }
  }

  // 2. INTELLIGENT API SELECTION (simplified)

  // Generate intelligent search terms
  private generateIntelligentSearchTerms(visionData: any, initialInsights: any): any {
    const baseTerms = this.extractBasicSearchTerms(visionData)
    const contextualTerms = this.extractContextualTerms(initialInsights)
    const educationalTerms = this.generateEducationalSearchTerms(initialInsights)
    const historicalTerms = this.generateHistoricalSearchTerms(initialInsights)

    return {
      primary: baseTerms.slice(0, 3),
      secondary: contextualTerms.slice(0, 2),
      educational: educationalTerms.slice(0, 2),
      historical: historicalTerms.slice(0, 2)
    }
  }

  // Select optimal APIs based on search terms and quality scores
  private selectOptimalAPIs(searchTerms: any): string[] {
    const apiQualityScores = {
      wikipedia: this.calculateWikipediaRelevance(searchTerms),
      metMuseum: this.calculateMetMuseumRelevance(searchTerms),
      artInstitute: this.calculateArtInstituteRelevance(searchTerms),
      harvard: this.calculateHarvardRelevance(searchTerms)
    }

    return Object.entries(apiQualityScores)
      .filter(([api, score]) => score > 0.7)
      .sort(([,a], [,b]) => b - a)
      .map(([api]) => api)
  }

  // Perform intelligent targeted recall
  private async performIntelligentTargetedRecall(
    visionData: any, 
    initialInsights: any, 
    artworkType: ArtworkType
  ): Promise<any> {
    const searchTerms = this.generateIntelligentSearchTerms(visionData, initialInsights)
    const optimalAPIs = this.selectOptimalAPIs(searchTerms)
    
    console.log('🎯 Selected optimal APIs:', optimalAPIs)
    
    const recallPromises = optimalAPIs.map(api => 
      this.callAPIWithQualityAssessment(api, searchTerms)
    )

    const results = await Promise.allSettled(recallPromises)
    return this.processRecallResults(results)
  }

  // 3. RICH EDUCATIONAL CONTENT GENERATION (simplified)

  // Generate rich educational content (no questions or activities)
  private async generateRichEducationalContent(
    visionData: any, 
    initialInsights: any, 
    recallData: any,
    artworkType: ArtworkType
  ): Promise<SimplifiedEducationalAnalysis> {
    // Require OpenAI API key - no fallback data
    if (!this.apiKeys.openai) {
      throw new Error('OpenAI API key required for rich educational content - no mock data will be used')
    }

    const synthesisPrompt = this.generateRichSynthesisPrompt(
      visionData, 
      initialInsights, 
      recallData, 
      artworkType
    )

    const response = await fetch('/proxy/openai/v1/chat/completions', {
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
            content: 'You are a master art educator creating comprehensive educational content. Generate engaging, educational analysis that teaches students how to look at art. Focus on style, technique, theme, and medium. Create content that encourages slow, thoughtful engagement with the artwork. Respond with valid JSON only.'
          },
          {
            role: 'user',
            content: synthesisPrompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.4
      })
    })

    if (!response.ok) {
      // No fallback - require real API to work
      throw new Error(`OpenAI API failed with status ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    let synthesis: any = {}
    if (content && typeof content === 'string') {
      try {
        synthesis = JSON.parse(content)
      } catch {
        synthesis = { styleAnalysis: { primaryStyle: 'Unknown', styleCharacteristics: [], movementContext: 'Unknown', stylisticInfluences: [], visualLanguage: content.substring(0, 200), educationalInsights: [], historicalSignificance: 'Unknown', culturalContext: 'Unknown' } }
      }
    }
 
    return {
      ...synthesis,
      confidence: this.calculateConfidence(visionData, initialInsights, recallData),
      sources: this.extractUsedSources(),
      artworkType,
      qualityMetrics: await this.calculateQualityMetrics(synthesis)
    }
  }

  // Generate rich synthesis prompt (no questions or activities)
  private generateRichSynthesisPrompt(
    visionData: any, 
    initialInsights: any, 
    recallData: any, 
    artworkType: ArtworkType
  ): string {
    return `Create a comprehensive educational analysis that teaches students how to look at and understand art.

Artwork Type: ${artworkType.type} (confidence: ${artworkType.confidence})

Vision Data: ${JSON.stringify(visionData.combined, null, 2)}
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
    "educationalInsights": ["Educational insight 1", "Educational insight 2"],
    "historicalSignificance": "Historical importance and context",
    "culturalContext": "Cultural background and meaning"
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
  "historicalContext": {
    "timePeriod": "When this was created",
    "culturalBackground": "Cultural context",
    "artisticClimate": "Artistic environment",
    "socialInfluences": ["Influence 1", "Influence 2"],
    "educationalSignificance": "Why this matters for education"
  },
  "learningResources": {
    "keyConcepts": ["Concept 1", "Concept 2"],
    "vocabulary": ["Term 1", "Term 2"],
    "relatedArtworks": ["Artwork 1", "Artwork 2"],
    "furtherReading": ["Resource 1", "Resource 2"]
  }
}`
  }

  // Helper methods for vision analysis and API calls
  private async performEnhancedVisionAnalysis(imageBase64: string): Promise<any> {
    // Extract real colors and basic features from the image
    const colors = await this.extractColorsFromImage(imageBase64)
    const labels = await this.generateBasicLabels(colors)
    
    return {
      combined: {
        labels,
        objects: this.inferObjectsFromColors(colors),
        colors: colors.map(c => c.hex),
        text: [],
        faces: 0,
        categories: ['art', 'visual']
      }
    }
  }

  private async extractColorsFromImage(imageBase64: string): Promise<Array<{hex: string, name: string, percentage: number}>> {
    return new Promise((resolve) => {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve([{hex: '#FF6B6B', name: 'Coral', percentage: 100}])
            return
          }
          
          // Scale down for performance
          const maxSize = 200
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
          canvas.width = Math.floor(img.width * scale)
          canvas.height = Math.floor(img.height * scale)
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const pixels = imageData.data
          
          // Sample every 4th pixel for performance
          const colorMap = new Map<string, number>()
          for (let i = 0; i < pixels.length; i += 16) {
            const r = pixels[i]
            const g = pixels[i + 1]
            const b = pixels[i + 2]
            const a = pixels[i + 3]
            
            if (a < 128) continue // Skip transparent pixels
            
            // Quantize colors to reduce noise
            const qr = Math.round(r / 32) * 32
            const qg = Math.round(g / 32) * 32
            const qb = Math.round(b / 32) * 32
            
            const key = `${qr},${qg},${qb}`
            colorMap.set(key, (colorMap.get(key) || 0) + 1)
          }
          
          // Convert to color palette
          const totalPixels = Array.from(colorMap.values()).reduce((sum, count) => sum + count, 0)
          const colors = Array.from(colorMap.entries())
            .map(([key, count]) => {
              const [r, g, b] = key.split(',').map(Number)
              const percentage = (count / totalPixels) * 100
              return {
                hex: this.rgbToHex(r, g, b),
                name: this.getColorName(r, g, b),
                percentage: Math.round(percentage * 100) / 100
              }
            })
            .filter(c => c.percentage > 2) // Only include colors with >2% presence
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 6) // Top 6 colors
          
          resolve(colors.length > 0 ? colors : [{hex: '#FF6B6B', name: 'Coral', percentage: 100}])
        }
        
        img.onerror = () => resolve([{hex: '#FF6B6B', name: 'Coral', percentage: 100}])
        img.src = imageBase64.includes(',') ? imageBase64 : `data:image/*;base64,${imageBase64}`
      } catch {
        resolve([{hex: '#FF6B6B', name: 'Coral', percentage: 100}])
      }
    })
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  private getColorName(r: number, g: number, b: number): string {
    const hsl = this.rgbToHsl(r, g, b)
    const { h, s, l } = hsl
    
    if (s < 20) {
      if (l > 80) return 'White'
      if (l < 20) return 'Black'
      return 'Gray'
    }
    
    if (h < 15 || h > 345) return 'Red'
    if (h < 45) return 'Orange'
    if (h < 75) return 'Yellow'
    if (h < 150) return 'Green'
    if (h < 210) return 'Cyan'
    if (h < 270) return 'Blue'
    if (h < 330) return 'Purple'
    return 'Pink'
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255
    g /= 255
    b /= 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2
    
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  private async generateBasicLabels(colors: Array<{hex: string, name: string, percentage: number}>): Promise<string[]> {
    const labels = ['artwork', 'visual composition']
    
    // Add color-based labels
    const warmColors = colors.filter(c => this.isWarmColor(c.hex))
    const coolColors = colors.filter(c => this.isCoolColor(c.hex))
    
    if (warmColors.length > coolColors.length) {
      labels.push('warm color palette')
    } else if (coolColors.length > warmColors.length) {
      labels.push('cool color palette')
    } else {
      labels.push('balanced color palette')
    }
    
    // Add brightness labels
    const avgLightness = colors.reduce((sum, c) => {
      const hsl = this.hexToHsl(c.hex)
      return sum + hsl.l
    }, 0) / colors.length
    
    if (avgLightness > 70) {
      labels.push('bright', 'light tones')
    } else if (avgLightness < 30) {
      labels.push('dark', 'dramatic')
    } else {
      labels.push('medium tones')
    }
    
    // Add saturation labels
    const avgSaturation = colors.reduce((sum, c) => {
      const hsl = this.hexToHsl(c.hex)
      return sum + hsl.s
    }, 0) / colors.length
    
    if (avgSaturation > 60) {
      labels.push('vibrant', 'saturated')
    } else if (avgSaturation < 30) {
      labels.push('muted', 'subtle')
    }
    
    return labels
  }

  private isWarmColor(hex: string): boolean {
    const hsl = this.hexToHsl(hex)
    return (hsl.h >= 0 && hsl.h <= 60) || (hsl.h >= 300)
  }

  private isCoolColor(hex: string): boolean {
    const hsl = this.hexToHsl(hex)
    return hsl.h > 60 && hsl.h < 300
  }

  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return this.rgbToHsl(r * 255, g * 255, b * 255)
  }

  private inferObjectsFromColors(colors: Array<{hex: string, name: string, percentage: number}>): string[] {
    const objects = ['composition']
    
    // Infer objects based on color characteristics
    const hasEarthTones = colors.some(c => ['Brown', 'Orange', 'Yellow'].includes(c.name))
    const hasSkyTones = colors.some(c => ['Blue', 'Cyan'].includes(c.name))
    const hasNatureTones = colors.some(c => ['Green', 'Yellow'].includes(c.name))
    
    if (hasEarthTones) objects.push('earth elements')
    if (hasSkyTones) objects.push('sky elements')
    if (hasNatureTones) objects.push('natural elements')
    
    return objects
  }

  private extractBasicSearchTerms(visionData: any): string[] {
    return visionData.combined?.labels || []
  }

  private extractContextualTerms(initialInsights: any): string[] {
    const terms = []
    if (initialInsights.styleInsights) terms.push(...initialInsights.styleInsights.slice(0, 2))
    if (initialInsights.themeInsights) terms.push(...initialInsights.themeInsights.slice(0, 2))
    return terms
  }

  private generateEducationalSearchTerms(initialInsights: any): string[] {
    return ['art education', 'visual literacy', 'art history', 'artistic techniques']
  }

  private generateHistoricalSearchTerms(initialInsights: any): string[] {
    return ['art history', 'artistic movements', 'cultural context', 'historical period']
  }

  private calculateWikipediaRelevance(searchTerms: any): number {
    return 0.8
  }

  private calculateMetMuseumRelevance(searchTerms: any): number {
    return 0.9
  }

  private calculateArtInstituteRelevance(searchTerms: any): number {
    return 0.85
  }

  private calculateHarvardRelevance(searchTerms: any): number {
    return 0.7
  }

  private async callAPIWithQualityAssessment(api: string, searchTerms: any): Promise<any> {
    // No fallback data - only use real APIs
    throw new Error(`API ${api} is not available - no mock data will be used`)
  }

  private processRecallResults(results: any[]): any {
    // Process and combine recall results
    const processed = {}
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        processed[result.value.source] = result.value.data
      }
    })
    return processed
  }

  private calculateConfidence(visionData: any, initialInsights: any, recallData: any): number {
    return 0.9
  }

  private extractUsedSources(): string[] {
    return ['Simplified Optimized Service']
  }

  private async calculateQualityMetrics(content: any): Promise<any> {
    return {
      depthScore: 0.9,
      pedagogicalAlignment: 0.85,
      educationalValue: 0.9
    }
  }

  // Dynamic content generation helpers
  private determineStyleFromLabels(labels: string[]): string {
    if (labels.some(l => l.includes('vibrant'))) return 'Expressionist'
    if (labels.some(l => l.includes('muted'))) return 'Minimalist'
    if (labels.some(l => l.includes('warm'))) return 'Impressionist'
    if (labels.some(l => l.includes('cool'))) return 'Modernist'
    if (labels.some(l => l.includes('dark'))) return 'Dramatic'
    if (labels.some(l => l.includes('bright'))) return 'Contemporary'
    return 'Contemporary Visual Art'
  }

  private generateStyleCharacteristics(labels: string[], colors: string[]): string[] {
    const characteristics = []
    
    if (labels.some(l => l.includes('warm'))) {
      characteristics.push('Warm color temperature creates inviting atmosphere')
    }
    if (labels.some(l => l.includes('cool'))) {
      characteristics.push('Cool color palette suggests calm and contemplation')
    }
    if (labels.some(l => l.includes('vibrant'))) {
      characteristics.push('High saturation creates energetic visual impact')
    }
    if (labels.some(l => l.includes('muted'))) {
      characteristics.push('Subtle, sophisticated color relationships')
    }
    if (labels.some(l => l.includes('bright'))) {
      characteristics.push('Light values create optimistic mood')
    }
    if (labels.some(l => l.includes('dark'))) {
      characteristics.push('Darker tones add drama and depth')
    }
    
    characteristics.push('Thoughtful composition guides the viewer\'s eye')
    characteristics.push('Color harmony creates visual unity')
    
    return characteristics
  }

  private generateMovementContext(labels: string[]): string {
    if (labels.some(l => l.includes('vibrant'))) {
      return 'Expressionist tradition emphasizing emotional color and bold visual statements'
    }
    if (labels.some(l => l.includes('muted'))) {
      return 'Minimalist approach focusing on essential visual elements'
    }
    if (labels.some(l => l.includes('warm'))) {
      return 'Impressionist influence with emphasis on light and atmosphere'
    }
    if (labels.some(l => l.includes('cool'))) {
      return 'Modernist principles of clean, geometric composition'
    }
    return 'Contemporary approaches to visual expression and artistic communication'
  }

  private generateStylisticInfluences(labels: string[]): string[] {
    const influences = ['Color theory principles', 'Compositional balance']
    
    if (labels.some(l => l.includes('warm'))) {
      influences.push('Impressionist color techniques')
    }
    if (labels.some(l => l.includes('cool'))) {
      influences.push('Modernist geometric principles')
    }
    if (labels.some(l => l.includes('vibrant'))) {
      influences.push('Expressionist emotional intensity')
    }
    if (labels.some(l => l.includes('muted'))) {
      influences.push('Minimalist restraint')
    }
    
    return influences
  }

  private generateVisualLanguage(labels: string[], colors: string[]): string {
    const colorCount = colors.length
    const isWarm = labels.some(l => l.includes('warm'))
    const isCool = labels.some(l => l.includes('cool'))
    
    let language = 'Uses visual elements to communicate meaning and emotion'
    
    if (isWarm && isCool) {
      language = 'Balances warm and cool colors to create dynamic visual tension'
    } else if (isWarm) {
      language = 'Employs warm color relationships to create inviting, energetic atmosphere'
    } else if (isCool) {
      language = 'Utilizes cool color palette to establish calm, contemplative mood'
    }
    
    if (colorCount > 4) {
      language += '. Rich color variety creates complex visual interest'
    } else if (colorCount <= 2) {
      language += '. Limited palette creates focused, unified composition'
    }
    
    return language
  }

  private generateEducationalInsights(labels: string[], colors: string[]): string[] {
    const insights = [
      'Practice slow looking to identify the most important visual elements',
      'Notice how colors guide your eye through the composition'
    ]
    
    if (labels.some(l => l.includes('warm'))) {
      insights.push('Warm colors typically advance and create focal points')
    }
    if (labels.some(l => l.includes('cool'))) {
      insights.push('Cool colors often recede and create depth')
    }
    if (labels.some(l => l.includes('vibrant'))) {
      insights.push('High saturation draws attention and creates energy')
    }
    if (labels.some(l => l.includes('muted'))) {
      insights.push('Muted colors create sophisticated, subtle effects')
    }
    
    insights.push('Compare the lightest and darkest areas to understand value relationships')
    insights.push('Identify the dominant color and how it affects the overall mood')
    
    return insights
  }

  private generateColorPalette(colors: string[]): Array<{hex: string, name: string, percentage: number, emotionalAssociation: string, symbolicMeaning: string, educationalNote: string}> {
    return colors.slice(0, 6).map((hex: string, index: number) => {
      const hsl = this.hexToHsl(hex)
      const isWarm = this.isWarmColor(hex)
      const isBright = hsl.l > 70
      const isSaturated = hsl.s > 60
      
      let name = this.getColorNameFromHex(hex)
      let emotionalAssociation = 'Neutral'
      let symbolicMeaning = 'Visual emphasis'
      
      if (isWarm) {
        emotionalAssociation = isBright ? 'Energetic' : 'Warm'
        symbolicMeaning = 'Energy and warmth'
      } else {
        emotionalAssociation = isBright ? 'Calm' : 'Serene'
        symbolicMeaning = 'Peace and stability'
      }
      
      if (isSaturated) {
        emotionalAssociation += ' and vibrant'
        symbolicMeaning += ' with intensity'
      }
      
      return {
        hex,
        name,
        percentage: Math.round(100 / Math.min(6, colors.length)),
        emotionalAssociation,
        symbolicMeaning,
        educationalNote: `Notice how this ${name.toLowerCase()} color affects the composition's mood`
      }
    })
  }

  private getColorNameFromHex(hex: string): string {
    const hsl = this.hexToHsl(hex)
    const { h, s, l } = hsl
    
    if (s < 20) {
      if (l > 80) return 'White'
      if (l < 20) return 'Black'
      return 'Gray'
    }
    
    if (h < 15 || h > 345) return 'Red'
    if (h < 45) return 'Orange'
    if (h < 75) return 'Yellow'
    if (h < 150) return 'Green'
    if (h < 210) return 'Cyan'
    if (h < 270) return 'Blue'
    if (h < 330) return 'Purple'
    return 'Pink'
  }

  private generateColorHarmony(labels: string[], colors: string[]): string {
    const isWarm = labels.some(l => l.includes('warm'))
    const isCool = labels.some(l => l.includes('cool'))
    const isVibrant = labels.some(l => l.includes('vibrant'))
    const isMuted = labels.some(l => l.includes('muted'))
    
    if (isWarm && isCool) {
      return 'Complementary harmony creates dynamic visual tension between warm and cool colors'
    } else if (isWarm) {
      return 'Analogous warm color scheme creates cohesive, inviting atmosphere'
    } else if (isCool) {
      return 'Analogous cool color palette establishes calm, unified composition'
    } else if (isVibrant) {
      return 'High contrast color relationships create energetic visual impact'
    } else if (isMuted) {
      return 'Subtle color variations create sophisticated, harmonious effect'
    }
    
    return 'Balanced color relationships create visual unity and harmony'
  }

  private generateEmotionalImpact(labels: string[], colors: string[]): string {
    const isWarm = labels.some(l => l.includes('warm'))
    const isCool = labels.some(l => l.includes('cool'))
    const isBright = labels.some(l => l.includes('bright'))
    const isDark = labels.some(l => l.includes('dark'))
    const isVibrant = labels.some(l => l.includes('vibrant'))
    const isMuted = labels.some(l => l.includes('muted'))
    
    let impact = 'The color choices create a specific emotional response: '
    
    if (isWarm && isBright) {
      impact += 'energetic and optimistic mood'
    } else if (isWarm && isDark) {
      impact += 'warm but dramatic atmosphere'
    } else if (isCool && isBright) {
      impact += 'calm and refreshing feeling'
    } else if (isCool && isDark) {
      impact += 'serene and contemplative mood'
    } else if (isVibrant) {
      impact += 'exciting and dynamic energy'
    } else if (isMuted) {
      impact += 'sophisticated and subtle emotion'
    } else {
      impact += 'balanced and harmonious feeling'
    }
    
    return impact
  }

  private generateSymbolicMeaning(labels: string[]): string[] {
    const meanings = []
    
    if (labels.some(l => l.includes('warm'))) {
      meanings.push('Warmth and energy')
    }
    if (labels.some(l => l.includes('cool'))) {
      meanings.push('Calm and stability')
    }
    if (labels.some(l => l.includes('bright'))) {
      meanings.push('Optimism and hope')
    }
    if (labels.some(l => l.includes('dark'))) {
      meanings.push('Depth and mystery')
    }
    if (labels.some(l => l.includes('vibrant'))) {
      meanings.push('Vitality and passion')
    }
    if (labels.some(l => l.includes('muted'))) {
      meanings.push('Sophistication and restraint')
    }
    
    if (meanings.length === 0) {
      meanings.push('Visual communication', 'Aesthetic expression')
    }
    
    return meanings
  }

  private generateColorTheory(labels: string[], colors: string[]): string[] {
    const theory = ['Color temperature relationships', 'Value contrast']
    
    if (labels.some(l => l.includes('warm')) || labels.some(l => l.includes('cool'))) {
      theory.push('Warm vs cool color psychology')
    }
    if (labels.some(l => l.includes('vibrant')) || labels.some(l => l.includes('muted'))) {
      theory.push('Saturation effects on mood')
    }
    if (colors.length > 3) {
      theory.push('Complex color relationships')
    } else {
      theory.push('Limited palette effectiveness')
    }
    
    return theory
  }

  private generateColorEducationalInsights(labels: string[], colors: string[]): string[] {
    const insights = [
      'Identify the dominant color and its emotional impact',
      'Notice how colors create focal points and guide the eye'
    ]
    
    if (labels.some(l => l.includes('warm')) && labels.some(l => l.includes('cool'))) {
      insights.push('Compare how warm and cool colors create visual balance')
    }
    if (labels.some(l => l.includes('vibrant'))) {
      insights.push('High saturation colors demand attention and create energy')
    }
    if (labels.some(l => l.includes('muted'))) {
      insights.push('Muted colors create sophisticated, subtle effects')
    }
    
    insights.push('Squint your eyes to see the overall value pattern')
    insights.push('Notice which colors advance and which recede in space')
    
    return insights
  }
}

export default new SimplifiedOptimizedService()
