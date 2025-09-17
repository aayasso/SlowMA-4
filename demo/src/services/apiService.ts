// API Service for artwork analysis
// Supports multiple providers: Google Vision, Microsoft Computer Vision, Art Institute of Chicago

export interface ArtworkAnalysis {
  title?: string
  artist?: string
  period?: string
  style?: string
  description?: string
  techniques?: string[]
  elements?: string[]
  confidence?: number
  source?: string
  aiAnalysis?: OpenAIAnalysisResult
}

export interface ImageAnalysisResult {
  labels?: string[]
  objects?: string[]
  text?: string[]
  colors?: string[]
  faces?: number
  adultContent?: boolean
  violence?: boolean
}

export interface OpenAIAnalysisResult {
  artisticInsights?: string[]
  historicalContext?: string
  technicalAnalysis?: string
  emotionalImpact?: string
  educationalValue?: string
  styleAnalysis?: string
  compositionNotes?: string
  colorTheory?: string
  themes?: string
  learningObjectives?: string
}

class ArtworkAnalysisService {
  private apiKeys = {
    googleVision: import.meta.env.VITE_GOOGLE_VISION_API_KEY || '',
    microsoftVision: import.meta.env.VITE_MICROSOFT_VISION_API_KEY || '',
    microsoftEndpoint: import.meta.env.VITE_MICROSOFT_VISION_ENDPOINT || '',
    artInstitute: import.meta.env.VITE_ART_INSTITUTE_API_KEY || '',
    openai: import.meta.env.VITE_OPENAI_API_KEY || ''
  }

  // Google Vision API integration
  async analyzeWithGoogleVision(imageBase64: string): Promise<ImageAnalysisResult> {
    if (!this.apiKeys.googleVision) {
      throw new Error('Google Vision API key not configured')
    }

    try {
      // Ensure we have a valid base64 string
      const base64Content = imageBase64.includes(',') 
        ? imageBase64.split(',')[1] 
        : imageBase64

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKeys.googleVision}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Content
                },
                features: [
                  { type: 'LABEL_DETECTION', maxResults: 10 },
                  { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                  { type: 'TEXT_DETECTION', maxResults: 10 },
                  { type: 'IMAGE_PROPERTIES', maxResults: 1 },
                  { type: 'FACE_DETECTION', maxResults: 10 },
                  { type: 'SAFE_SEARCH_DETECTION', maxResults: 1 }
                ]
              }
            ]
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Google Vision API error response:', errorText)
        throw new Error(`Google Vision API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      // Check for API errors in the response
      if (data.error) {
        throw new Error(`Google Vision API error: ${data.error.message}`)
      }

      const result = data.responses[0]
      
      // Check if the response has an error
      if (result.error) {
        throw new Error(`Google Vision API processing error: ${result.error.message}`)
      }

      return {
        labels: result.labelAnnotations?.map((label: any) => label.description) || [],
        objects: result.localizedObjectAnnotations?.map((obj: any) => obj.name) || [],
        text: result.textAnnotations?.map((text: any) => text.description) || [],
        colors: result.imagePropertiesAnnotation?.dominantColors?.colors?.map((color: any) => 
          `rgb(${color.color.red}, ${color.color.green}, ${color.color.blue})`
        ) || [],
        faces: result.faceAnnotations?.length || 0,
        adultContent: result.safeSearchAnnotation?.adult === 'VERY_LIKELY' || result.safeSearchAnnotation?.adult === 'LIKELY',
        violence: result.safeSearchAnnotation?.violence === 'VERY_LIKELY' || result.safeSearchAnnotation?.violence === 'LIKELY'
      }
    } catch (error) {
      console.error('Google Vision API error:', error)
      throw error
    }
  }

  // Microsoft Computer Vision API integration
  async analyzeWithMicrosoftVision(imageBase64: string): Promise<ImageAnalysisResult> {
    if (!this.apiKeys.microsoftVision || !this.apiKeys.microsoftEndpoint) {
      throw new Error('Microsoft Vision API key or endpoint not configured')
    }

    try {
      // Ensure we have a valid base64 string
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
          body: new Uint8Array(Array.from(atob(base64Content), c => c.charCodeAt(0)))
        }
      )

      if (!response.ok) {
        throw new Error(`Microsoft Vision API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        labels: data.description?.tags || [],
        objects: data.objects?.map((obj: any) => obj.object) || [],
        text: data.description?.captions?.map((caption: any) => caption.text) || [],
        colors: data.color?.dominantColors || [],
        faces: 0, // Microsoft doesn't provide face count in this endpoint
        adultContent: data.adult?.isAdultContent || false,
        violence: data.adult?.isRacyContent || false
      }
    } catch (error) {
      console.error('Microsoft Vision API error:', error)
      throw error
    }
  }

  // Art Institute of Chicago API integration (no API key required)
  async searchArtwork(query: string): Promise<ArtworkAnalysis[]> {
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&limit=5&fields=id,title,artist_display,date_display,style_titles,medium_display,description,image_id,is_public_domain,thumbnail`
      )

      if (!response.ok) {
        throw new Error(`Art Institute API error: ${response.status}`)
      }

      const data = await response.json()
      
      return data.data.map((artwork: any) => ({
        title: artwork.title,
        artist: artwork.artist_display,
        period: artwork.date_display,
        style: artwork.style_titles?.join(', ') || '',
        description: artwork.description,
        techniques: artwork.medium_display ? [artwork.medium_display] : [],
        source: 'Art Institute of Chicago',
        confidence: 0.8
      }))
    } catch (error) {
      console.error('Art Institute API error:', error)
      throw error
    }
  }

  // OpenAI API integration for enhanced artistic analysis
  async analyzeWithOpenAI(visionResults: ImageAnalysisResult[], artworkContext: string): Promise<OpenAIAnalysisResult> {
    if (!this.apiKeys.openai) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      // Prepare the context for OpenAI analysis
      const labels = visionResults.flatMap(r => r.labels || []).join(', ')
      const objects = visionResults.flatMap(r => r.objects || []).join(', ')
      const colors = visionResults.flatMap(r => r.colors || []).join(', ')
      const text = visionResults.flatMap(r => r.text || []).join(', ')

      const prompt = `Analyze this artwork with astute artistic observations that are succinct and engaging. Focus on meaningful insights that reveal the artist's skill and intention.

What I discovered:
- Key elements: ${labels}
- Objects: ${objects}
- Colors: ${colors}
- Text: ${text}
- Context: ${artworkContext}

Return JSON format:
{
  "artisticInsights": ["Concise observation about technique or visual element", "Another insightful observation about composition or style", "Third observation about artistic choices"],
  "technicalAnalysis": "Clear explanation of the technical approach and methods used",
  "compositionNotes": "How the artist guides the viewer's eye and creates visual flow",
  "colorTheory": "Analysis of color relationships and their emotional impact",
  "themes": "The underlying concepts or ideas the artwork explores",
  "educationalValue": "What students can learn from studying this work",
  "styleAnalysis": "How the artistic approach serves the work's purpose"
}

Write with professional insight, avoiding excessive enthusiasm. Be precise, informative, and engaging without being overly effusive.`

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
              content: 'You are an experienced art educator who provides astute, succinct, and engaging artistic observations. Focus on meaningful insights that reveal the artist\'s skill and intention. Be precise, informative, and engaging without being overly effusive. Avoid excessive exclamation points and forced enthusiasm.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.5
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI API error response:', errorText)
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(`OpenAI API error: ${data.error.message}`)
      }

      const content = data.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content received from OpenAI API')
      }

      // Parse the JSON response
      try {
        const analysis = JSON.parse(content)
        return analysis as OpenAIAnalysisResult
      } catch (parseError) {
        console.warn('Failed to parse OpenAI JSON response, using raw content:', parseError)
        // Fallback: return the raw content as a single insight
        return {
          artisticInsights: [content],
          historicalContext: 'Analysis provided by OpenAI',
          technicalAnalysis: 'See artistic insights for detailed analysis',
          educationalValue: 'Comprehensive analysis available in insights',
          source: 'OpenAI GPT-4'
        }
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw error
    }
  }

  // Main analysis function that tries multiple APIs
  async analyzeArtwork(imageFile: File): Promise<ArtworkAnalysis> {
    console.log('🎨 Analyzing artwork:', imageFile.name)
    
    // Check if any API keys are configured (Art Institute doesn't need a key)
    const hasVisionApiKeys = this.apiKeys.googleVision || this.apiKeys.microsoftVision
    const hasArtInstitute = true // Art Institute is always available
    const hasOpenAI = !!this.apiKeys.openai
    
    if (!hasVisionApiKeys && !hasArtInstitute && !hasOpenAI) {
      throw new Error('No APIs available. Please set up at least one API key to analyze artwork.')
    }

    try {
      // Convert image to base64 for both APIs
      const imageBase64 = await this.fileToBase64(imageFile)
      
      // Try both APIs and combine results
      const results: ArtworkAnalysis[] = []
      const visionResults: ImageAnalysisResult[] = []
      
      // Try Google Vision first
      if (this.apiKeys.googleVision) {
        try {
          const googleResult = await this.analyzeWithGoogleVision(imageBase64)
          visionResults.push(googleResult)
          results.push(this.processVisionResults(googleResult, 'Google Vision'))
        } catch (error) {
          console.warn('Google Vision API failed:', error)
        }
      }
      
      // Try Microsoft Vision
      if (this.apiKeys.microsoftVision && this.apiKeys.microsoftEndpoint) {
        try {
          const microsoftResult = await this.analyzeWithMicrosoftVision(imageBase64)
          visionResults.push(microsoftResult)
          results.push(this.processVisionResults(microsoftResult, 'Microsoft Vision'))
        } catch (error) {
          console.warn('Microsoft Vision API failed:', error)
        }
      }
      
      // Try Art Institute API for additional context (always available, no key needed)
      if (results.length > 0) {
        try {
          // Use the first result's title or labels to search for similar artworks
          const firstResult = results[0]
          const searchQuery = firstResult.title || firstResult.techniques?.[0] || 'artwork'
          
          const artInstituteResults = await this.searchArtwork(searchQuery)
          
          if (artInstituteResults.length > 0) {
            // Use the first result from Art Institute as additional context
            results.push(artInstituteResults[0])
          }
        } catch (error) {
          console.warn('Art Institute API failed:', error)
        }
      }

      // Try OpenAI API for enhanced artistic analysis
      let openAIAnalysis: OpenAIAnalysisResult | null = null
      if (this.apiKeys.openai && visionResults.length > 0) {
        try {
          const artworkContext = results.length > 0 ? 
            `Title: ${results[0].title}, Style: ${results[0].style}, Period: ${results[0].period}` : 
            'Artwork analysis'
          
          openAIAnalysis = await this.analyzeWithOpenAI(visionResults, artworkContext)
        } catch (error) {
          console.warn('OpenAI API failed:', error)
        }
      }
      
      // If no vision APIs worked but we have Art Institute, try a generic search
      if (results.length === 0 && hasArtInstitute) {
        try {
          const artInstituteResults = await this.searchArtwork('artwork')
          
          if (artInstituteResults.length > 0) {
            results.push(artInstituteResults[0])
          }
        } catch (error) {
          console.warn('Art Institute generic search failed:', error)
        }
      }
      
      if (results.length === 0) {
        throw new Error('All APIs failed. Please check your API keys and try again.')
      }
      
      // Combine results from multiple APIs
      const combinedResult = this.combineAnalysisResults(results, openAIAnalysis)
      console.log('✅ Analysis complete')
      return combinedResult
      
    } catch (error) {
      console.error('Artwork analysis error:', error)
      throw error
    }
  }

  // Process vision API results into artwork analysis
  private processVisionResults(result: ImageAnalysisResult, source: string): ArtworkAnalysis {
    const isArtwork = this.isLikelyArtwork(result.labels || [])
    
    if (!isArtwork) {
      return {
        title: 'Image Analysis',
        description: 'This image appears to be a photograph rather than an artwork. Try uploading a painting, drawing, or other artistic work for detailed analysis.',
        techniques: ['Photography'],
        elements: result.labels?.slice(0, 5) || [],
        source,
        confidence: 0.6
      }
    }

    return {
      title: this.generateTitle(result),
      artist: this.identifyArtist(result),
      period: this.estimatePeriod(result),
      style: this.identifyStyle(result),
      description: this.generateDescription(result),
      techniques: this.identifyTechniques(result),
      elements: this.identifyElements(result),
      source,
      confidence: 0.8
    }
  }

  // Helper methods
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  private isLikelyArtwork(labels: string[]): boolean {
    const artKeywords = [
      'painting', 'art', 'artwork', 'canvas', 'oil painting', 'watercolor', 'drawing', 'sketch', 
      'portrait', 'landscape', 'still life', 'artistic', 'masterpiece', 'gallery', 'museum',
      'brush', 'paint', 'artist', 'painter', 'artistic work', 'fine art', 'visual art'
    ]
    
    // Check for direct art keywords
    const hasArtKeywords = labels.some(label => 
      artKeywords.some(keyword => label.toLowerCase().includes(keyword))
    )
    
    if (hasArtKeywords) return true
    
    // Additional heuristics for artwork detection
    // Look for subjects commonly found in artworks
    const artisticSubjects = [
      'skeleton', 'skull', 'bone', 'figure', 'person', 'face', 'body', 'anatomy',
      'flowers', 'fruit', 'bowl', 'vase', 'nature', 'tree', 'mountain', 'river',
      'building', 'architecture', 'church', 'castle', 'bridge', 'city', 'street',
      'horse', 'dog', 'cat', 'animal', 'bird', 'fish', 'visual', 'artistic'
    ]
    
    const hasArtisticSubjects = labels.some(label => 
      artisticSubjects.some(subject => label.toLowerCase().includes(subject))
    )
    
    // If we have artistic subjects and the image seems composed (not a casual photo),
    // it's likely artwork. This is especially true for historical subjects like skeletons
    // which are common in classical and post-impressionist art
    if (hasArtisticSubjects && labels.length >= 3) {
      return true
    }
    
    return false
  }

  private generateTitle(result: ImageAnalysisResult): string {
    const labels = result.labels || []
    const objects = result.objects || []
    
    // Try to create a more descriptive title based on the content
    if (labels.includes('skeleton') || labels.includes('skull') || labels.includes('bone')) {
      return 'Skeleton Study'
    }
    if (objects.includes('bridge') || labels.some(label => label.toLowerCase().includes('bridge'))) {
      return 'Bridge Scene'
    }
    if (labels.includes('portrait') || labels.includes('face')) {
      return 'Portrait Study'
    }
    if (labels.includes('landscape') || labels.includes('nature')) {
      return 'Landscape'
    }
    if (labels.includes('flower') || labels.includes('bouquet')) {
      return 'Flower Study'
    }
    if (labels.includes('still life') || labels.includes('bowl') || labels.includes('fruit')) {
      return 'Still Life'
    }
    
    if (labels.length > 0) {
      return labels[0].charAt(0).toUpperCase() + labels[0].slice(1)
    }
    return 'Untitled Artwork'
  }

  private identifyArtist(result: ImageAnalysisResult): string {
    const labels = result.labels || []
    const objects = result.objects || []
    const colors = result.colors || []
    
    // Focus on artistic characteristics rather than specific artist identification
    if (labels.some(label => label.toLowerCase().includes('skeleton') || label.toLowerCase().includes('bone')) ||
        labels.some(label => label.toLowerCase().includes('skull'))) {
      return 'Anatomical Study Artist'
    }
    
    if (objects.includes('bridge') || labels.some(label => label.toLowerCase().includes('bridge'))) {
      return 'Landscape Artist'
    }
    
    if (labels.some(label => label.toLowerCase().includes('portrait')) &&
        labels.some(label => label.toLowerCase().includes('face'))) {
      return 'Portrait Artist'
    }
    
    if (labels.some(label => label.toLowerCase().includes('abstract') || label.toLowerCase().includes('geometric'))) {
      return 'Abstract Artist'
    }
    
    if (labels.some(label => label.toLowerCase().includes('landscape') || label.toLowerCase().includes('nature'))) {
      return 'Landscape Artist'
    }
    
    if (labels.some(label => label.toLowerCase().includes('flower') || label.toLowerCase().includes('bouquet'))) {
      return 'Still Life Artist'
    }
    
    return 'Visual Artist'
  }

  private estimatePeriod(result: ImageAnalysisResult): string {
    const labels = result.labels || []
    const colors = result.colors || []
    const objects = result.objects || []
    
    // Focus on artistic characteristics and techniques rather than specific periods
    if (labels.some(label => label.toLowerCase().includes('modern'))) {
      return 'Contemporary Art Style'
    }
    if (labels.some(label => label.toLowerCase().includes('classical'))) {
      return 'Classical Art Style'
    }
    
    // Anatomical studies - common in art education
    if (labels.some(label => label.toLowerCase().includes('skeleton') || label.toLowerCase().includes('bone')) && 
        colors.some(color => color.toLowerCase().includes('brown') || color.toLowerCase().includes('yellow'))) {
      return 'Academic Study Style (19th-20th Century)'
    }
    
    // Bridge/landscape scenes with atmospheric effects
    if ((objects.includes('bridge') || labels.some(label => label.toLowerCase().includes('bridge'))) &&
        (colors.some(color => color.toLowerCase().includes('blue') || color.toLowerCase().includes('green') || color.toLowerCase().includes('grey')) ||
         labels.some(label => label.toLowerCase().includes('paint') || label.toLowerCase().includes('art paint')))) {
      return 'Atmospheric Landscape Style'
    }
    
    // Nature scenes with color emphasis
    if (colors.some(color => color.toLowerCase().includes('blue') || color.toLowerCase().includes('green')) &&
        labels.some(label => label.toLowerCase().includes('nature') || label.toLowerCase().includes('tree'))) {
      return 'Naturalistic Color Study'
    }
    
    // Portrait work with figure emphasis
    if (labels.some(label => label.toLowerCase().includes('portrait')) && 
        labels.some(label => label.toLowerCase().includes('figure'))) {
      return 'Figurative Art Style'
    }
    
    return 'Artistic Study'
  }

  private identifyStyle(result: ImageAnalysisResult): string {
    const labels = result.labels || []
    const objects = result.objects || []
    const colors = result.colors || []
    
    if (labels.some(label => label.toLowerCase().includes('abstract'))) {
      return 'Abstract Expression'
    }
    if (labels.some(label => label.toLowerCase().includes('realistic'))) {
      return 'Realistic Representation'
    }
    if (labels.some(label => label.toLowerCase().includes('impressionist'))) {
      return 'Impressionistic Technique'
    }
    
    // Bridge scenes with atmospheric effects
    if ((objects.includes('bridge') || labels.some(label => label.toLowerCase().includes('bridge'))) &&
        (colors.some(color => color.toLowerCase().includes('blue') || color.toLowerCase().includes('green') || color.toLowerCase().includes('grey')))) {
      return 'Atmospheric Painting'
    }
    
    // Anatomical studies with expressive color
    if ((labels.some(label => label.toLowerCase().includes('skeleton') || label.toLowerCase().includes('bone')) ||
         labels.some(label => label.toLowerCase().includes('skull'))) &&
        colors.some(color => color.toLowerCase().includes('brown') || color.toLowerCase().includes('yellow'))) {
      return 'Expressive Academic Study'
    }
    
    // Portrait work
    if (labels.some(label => label.toLowerCase().includes('portrait')) || 
        labels.some(label => label.toLowerCase().includes('face'))) {
      return 'Portrait Study'
    }
    
    // Landscape work
    if (labels.some(label => label.toLowerCase().includes('landscape')) || 
        labels.some(label => label.toLowerCase().includes('nature'))) {
      return 'Landscape Study'
    }
    
    // Still life work
    if (labels.some(label => label.toLowerCase().includes('flower')) || 
        labels.some(label => label.toLowerCase().includes('still life'))) {
      return 'Still Life Study'
    }
    
    return 'Mixed Artistic Approach'
  }

  private generateDescription(result: ImageAnalysisResult): string {
    const labels = result.labels || []
    const objects = result.objects || []
    const colors = result.colors || []
    
    // Astute and engaging descriptions that reveal artistic insight
    if (objects.includes('bridge') || labels.some(label => label.toLowerCase().includes('bridge'))) {
      return `The artist demonstrates masterful control of atmospheric perspective, using the bridge as both a structural element and a device to guide the viewer's eye through the composition. The interplay between solid architecture and fluid reflections creates visual tension and depth.`
    }
    
    if (labels.includes('skeleton') || labels.includes('skull') || labels.includes('bone')) {
      return `This anatomical study reveals the artist's understanding of underlying structure. The careful rendering of bone structure demonstrates both technical skill and knowledge of human anatomy, essential for creating convincing figures.`
    } 
    
    if (labels.includes('portrait') || labels.includes('face')) {
      return `The artist captures not merely physical likeness but psychological presence. The careful modeling of form through light and shadow creates a sense of three-dimensionality and emotional depth.`
    } 
    
    if (labels.includes('landscape') || labels.includes('nature')) {
      return `The composition employs atmospheric perspective to create convincing depth, with elements becoming less distinct and cooler in tone as they recede. The artist demonstrates understanding of how light behaves across vast distances.`
    } 
    
    if (labels.includes('flower') || labels.includes('bouquet')) {
      return `This still life demonstrates careful observation of natural forms and their interaction with light. The artist's attention to botanical detail and textural variety creates visual interest while maintaining compositional harmony.`
    }
    
    // Create astute descriptions for general artworks
    let description = `This work demonstrates thoughtful composition and technical skill. The artist effectively captures ${labels.slice(0, 2).join(' and ')} through careful observation and deliberate artistic choices. `
    
    if (objects.length > 0) {
      description += `The arrangement of ${objects.slice(0, 2).join(' and ')} creates visual balance and guides the viewer's attention through the composition. `
    }
    
    if (colors.length > 0) {
      description += `The color palette (${colors.slice(0, 2).join(' and ')}) establishes mood and reinforces the work's thematic content. `
    }
    
    description += `The overall effect demonstrates the artist's technical proficiency and aesthetic sensibility.`
    
    return description
  }

  private identifyTechniques(result: ImageAnalysisResult): string[] {
    const techniques = []
    const labels = result.labels || []
    const colors = result.colors || []
    
    if (labels.some(label => label.toLowerCase().includes('oil'))) {
      techniques.push('Oil painting technique with smooth color transitions and rich impasto')
    }
    if (labels.some(label => label.toLowerCase().includes('watercolor'))) {
      techniques.push('Watercolor layering with controlled transparency and luminosity')
    }
    if (labels.some(label => label.toLowerCase().includes('brush'))) {
      techniques.push('Varied brushwork creating textural interest and directional movement')
    }
    if (labels.some(label => label.toLowerCase().includes('texture'))) {
      techniques.push('Textural variety enhancing visual and tactile interest')
    }
    
    // Add color technique analysis
    if (colors.length > 2) {
      techniques.push('Sophisticated color harmony demonstrating understanding of color theory')
    }
    if (colors.some(color => color.toLowerCase().includes('warm'))) {
      techniques.push('Strategic use of warm colors to create focal points and emotional warmth')
    }
    if (colors.some(color => color.toLowerCase().includes('cool'))) {
      techniques.push('Cool color palette establishing atmospheric depth and spatial recession')
    }
    
    // Add composition techniques based on content
    if (labels.some(label => label.toLowerCase().includes('portrait'))) {
      techniques.push('Accurate facial proportions and anatomical structure')
    }
    if (labels.some(label => label.toLowerCase().includes('landscape'))) {
      techniques.push('Atmospheric perspective creating convincing spatial depth')
    }
    if (labels.some(label => label.toLowerCase().includes('skeleton') || label.toLowerCase().includes('bone'))) {
      techniques.push('Precise anatomical knowledge and structural understanding')
    }
    
    return techniques.length > 0 ? techniques : ['Technical proficiency evident in artistic execution']
  }

  private identifyElements(result: ImageAnalysisResult): string[] {
    const elements = []
    const labels = result.labels || []
    const colors = result.colors || []
    const objects = result.objects || []
    
    if (colors.length > 0) {
      elements.push(`Strategic color palette featuring ${colors.slice(0, 3).join(', ')} that establishes mood and visual hierarchy`)
    }
    
    if (labels.some(label => label.toLowerCase().includes('line'))) {
      elements.push('Controlled line work that defines form and creates directional movement')
    }
    
    if (labels.some(label => label.toLowerCase().includes('shape'))) {
      elements.push('Balanced interplay between geometric and organic shapes creating visual rhythm')
    }
    
    if (labels.some(label => label.toLowerCase().includes('texture'))) {
      elements.push('Varied textural elements that enhance visual interest and tactile quality')
    }
    
    // Add specific artistic elements based on content
    if (labels.some(label => label.toLowerCase().includes('portrait'))) {
      elements.push('Convincing facial structure demonstrating understanding of human anatomy')
    }
    
    if (labels.some(label => label.toLowerCase().includes('landscape'))) {
      elements.push('Atmospheric perspective creating convincing spatial depth and distance')
    }
    
    if (labels.some(label => label.toLowerCase().includes('skeleton') || label.toLowerCase().includes('bone'))) {
      elements.push('Precise anatomical rendering revealing structural knowledge and technical skill')
    }
    
    if (objects.length > 0) {
      elements.push(`Strategic placement of ${objects.slice(0, 2).join(' and ')} creates visual balance and compositional flow`)
    }
    
    // Add general artistic principles
    elements.push('Effective use of light and shadow to model form and create three-dimensionality')
    elements.push('Compositional balance that guides the viewer\'s eye through the work')
    
    return elements.length > 0 ? elements : ['Well-executed visual elements demonstrating artistic skill']
  }


  // Combine results from multiple APIs for richer analysis
  private combineAnalysisResults(results: ArtworkAnalysis[], openAIAnalysis?: OpenAIAnalysisResult | null): ArtworkAnalysis {
    if (results.length === 1) {
      return results[0]
    }

    // Combine all unique techniques
    const allTechniques = [...new Set(results.flatMap(r => r.techniques || []))]
    
    // Combine all unique elements
    const allElements = [...new Set(results.flatMap(r => r.elements || []))]
    
    // Use the most detailed description
    const bestDescription = results.reduce((best, current) => 
      (current.description && current.description.length > (best.description?.length || 0)) ? current : best
    ).description || 'Artwork analysis'
    
    // Use the highest confidence score
    const maxConfidence = Math.max(...results.map(r => r.confidence || 0))
    
    // Combine sources
    const sources = results.map(r => r.source).filter(Boolean).join(', ')

    // Find the best result for each field, prioritizing more detailed/educational content
    const bestTitle = results.find(r => r.title && r.title !== 'Image Analysis')?.title || 
                     results.find(r => r.title)?.title || 'Artwork Analysis'
    
    const bestPeriod = results.find(r => r.period && !r.period.includes('Modern Art'))?.period || 
                      results.find(r => r.period)?.period || 'Historical Artwork'
    
    const bestArtist = results.find(r => r.artist && r.artist !== 'Unknown Artist')?.artist || 
                      results.find(r => r.artist)?.artist || 'Unknown Artist'

    const combinedResult = {
      title: bestTitle,
      artist: bestArtist,
      period: bestPeriod,
      style: results.find(r => r.style)?.style || 'Mixed Style',
      description: bestDescription,
      techniques: allTechniques,
      elements: allElements,
      source: `Combined Analysis (${sources})`,
      confidence: maxConfidence
    }

    // Enhance with OpenAI analysis if available
    if (openAIAnalysis) {
      // Create concise educational description
      let description = ''
      
      if (openAIAnalysis.educationalValue) {
        description += `${openAIAnalysis.educationalValue}\n\n`
      }
      
      if (openAIAnalysis.technicalAnalysis) {
        description += `Techniques: ${openAIAnalysis.technicalAnalysis}\n\n`
        combinedResult.techniques.push(openAIAnalysis.technicalAnalysis)
      }
      
      if (openAIAnalysis.compositionNotes) {
        description += `Composition: ${openAIAnalysis.compositionNotes}\n\n`
        combinedResult.elements.push(openAIAnalysis.compositionNotes)
      }
      
      if (openAIAnalysis.colorTheory) {
        description += `Color Theory: ${openAIAnalysis.colorTheory}\n\n`
        combinedResult.elements.push(openAIAnalysis.colorTheory)
      }
      
      if (openAIAnalysis.themes) {
        description += `Themes: ${openAIAnalysis.themes}\n\n`
      }
      
      if (openAIAnalysis.styleAnalysis) {
        description += `Style: ${openAIAnalysis.styleAnalysis}`
      }
      
      // Use AI-enhanced description
      if (description) {
        combinedResult.description = description.trim()
      }
      
      // Update source
      combinedResult.source = `AI-Enhanced Analysis (${sources}, OpenAI)`
      
      // Store AI analysis
      combinedResult.aiAnalysis = openAIAnalysis
    }

    return combinedResult
  }

}

export default new ArtworkAnalysisService()
