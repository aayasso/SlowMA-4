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

      const prompt = `Provide a clear, concise educational analysis of this artwork for art students.

Technical Data:
- Labels: ${labels}
- Objects: ${objects}
- Colors: ${colors}
- Text: ${text}
- Context: ${artworkContext}

Return JSON format:
{
  "artisticInsights": ["Key technique insight", "Visual element insight", "Artistic principle insight"],
  "technicalAnalysis": "Brief analysis of techniques and materials used",
  "compositionNotes": "Analysis of composition and visual structure",
  "colorTheory": "Color relationships and palette analysis",
  "themes": "Main themes and meanings",
  "educationalValue": "What students can learn from this artwork",
  "styleAnalysis": "Artistic style and movement context"
}

Keep responses concise but educational. Focus on clear, actionable insights.`

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
              content: 'You are an art educator. Provide clear, concise educational analysis focused on techniques, composition, color theory, and themes. Keep responses brief but informative for art students.'
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
    console.log('Starting artwork analysis... (v2.0)', { 
      fileName: imageFile.name, 
      fileSize: imageFile.size, 
      fileType: imageFile.type 
    })
    
    // Check if any API keys are configured (Art Institute doesn't need a key)
    const hasVisionApiKeys = this.apiKeys.googleVision || this.apiKeys.microsoftVision
    const hasArtInstitute = true // Art Institute is always available
    const hasOpenAI = !!this.apiKeys.openai
    
    if (!hasVisionApiKeys && !hasArtInstitute && !hasOpenAI) {
      throw new Error('No APIs available. Please set up at least one API key to analyze artwork.')
    }

    console.log('API keys status:', {
      googleVision: !!this.apiKeys.googleVision,
      microsoftVision: !!this.apiKeys.microsoftVision,
      microsoftEndpoint: !!this.apiKeys.microsoftEndpoint,
      artInstitute: true, // Always available
      openai: hasOpenAI
    })

    try {
      // Convert image to base64 for both APIs
      const imageBase64 = await this.fileToBase64(imageFile)
      console.log('Image converted to base64, length:', imageBase64.length)
      
      // Try both APIs and combine results
      const results: ArtworkAnalysis[] = []
      const visionResults: ImageAnalysisResult[] = []
      
      // Try Google Vision first
      if (this.apiKeys.googleVision) {
        try {
          console.log('Trying Google Vision API...')
          const googleResult = await this.analyzeWithGoogleVision(imageBase64)
          console.log('Google Vision API result:', googleResult)
          console.log('Google Vision labels:', googleResult.labels)
          visionResults.push(googleResult)
          results.push(this.processVisionResults(googleResult, 'Google Vision'))
          console.log('Google Vision analysis added to results')
        } catch (error) {
          console.warn('Google Vision API failed:', error)
        }
      }
      
      // Try Microsoft Vision
      if (this.apiKeys.microsoftVision && this.apiKeys.microsoftEndpoint) {
        try {
          console.log('Trying Microsoft Vision API...')
          const microsoftResult = await this.analyzeWithMicrosoftVision(imageBase64)
          console.log('Microsoft Vision API result:', microsoftResult)
          visionResults.push(microsoftResult)
          results.push(this.processVisionResults(microsoftResult, 'Microsoft Vision'))
          console.log('Microsoft Vision analysis added to results')
        } catch (error) {
          console.warn('Microsoft Vision API failed:', error)
        }
      }
      
      // Try Art Institute API for additional context (always available, no key needed)
      if (results.length > 0) {
        try {
          console.log('Trying Art Institute API...')
          // Use the first result's title or labels to search for similar artworks
          const firstResult = results[0]
          const searchQuery = firstResult.title || firstResult.techniques?.[0] || 'artwork'
          
          const artInstituteResults = await this.searchArtwork(searchQuery)
          console.log('Art Institute API result:', artInstituteResults)
          
          if (artInstituteResults.length > 0) {
            // Use the first result from Art Institute as additional context
            results.push(artInstituteResults[0])
            console.log('Art Institute analysis added to results')
          }
        } catch (error) {
          console.warn('Art Institute API failed:', error)
        }
      }

      // Try OpenAI API for enhanced artistic analysis
      let openAIAnalysis: OpenAIAnalysisResult | null = null
      if (this.apiKeys.openai && visionResults.length > 0) {
        try {
          console.log('Trying OpenAI API...')
          const artworkContext = results.length > 0 ? 
            `Title: ${results[0].title}, Style: ${results[0].style}, Period: ${results[0].period}` : 
            'Artwork analysis'
          
          openAIAnalysis = await this.analyzeWithOpenAI(visionResults, artworkContext)
          console.log('OpenAI API result:', openAIAnalysis)
          console.log('OpenAI analysis added to results')
        } catch (error) {
          console.warn('OpenAI API failed:', error)
        }
      }
      
      // If no vision APIs worked but we have Art Institute, try a generic search
      if (results.length === 0 && hasArtInstitute) {
        try {
          console.log('Trying Art Institute API with generic search...')
          const artInstituteResults = await this.searchArtwork('artwork')
          console.log('Art Institute generic search result:', artInstituteResults)
          
          if (artInstituteResults.length > 0) {
            results.push(artInstituteResults[0])
            console.log('Art Institute generic analysis added to results')
          }
        } catch (error) {
          console.warn('Art Institute generic search failed:', error)
        }
      }
      
      console.log('Total results collected:', results.length)
      
      if (results.length === 0) {
        throw new Error('All APIs failed. Please check your API keys and try again.')
      }
      
      // Combine results from multiple APIs
      const combinedResult = this.combineAnalysisResults(results, openAIAnalysis)
      console.log('Final combined result:', combinedResult)
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
    
    // Educational descriptions focused on artistic principles
    if (objects.includes('bridge') || labels.some(label => label.toLowerCase().includes('bridge'))) {
      return `This artwork demonstrates the study of atmospheric perspective and light effects. Bridge scenes have been a popular subject in art history, particularly during the 19th century when artists were exploring new ways to capture the effects of light and atmosphere. These compositions offer artists an excellent opportunity to explore how light interacts with water, creating reflections and atmospheric depth. Notice how the artist has captured the interplay between solid architectural forms and the fluid, ever-changing surface of water. This type of composition teaches us about the importance of light in creating mood and depth in landscape painting, and represents a fundamental challenge in representational art.`
    }
    
    if (labels.includes('skeleton') || labels.includes('skull') || labels.includes('bone')) {
      return `This anatomical study showcases fundamental principles of figure drawing and human structure. Skeletal studies have been a cornerstone of art education since the Renaissance, when artists began to systematically study human anatomy to improve their representational skills. These studies are essential in art education as they teach artists to understand the underlying framework that supports all human form. Notice how the artist has rendered the three-dimensional structure of bones, creating volume through careful attention to light and shadow. This type of study develops an artist's understanding of proportion, structure, and the relationship between form and space - skills that are fundamental to all figurative art.`
    } 
    
    if (labels.includes('portrait') || labels.includes('face')) {
      return `This portrait study demonstrates the artist's exploration of human expression and facial structure. Portrait painting has been one of the most challenging and respected genres in art history, requiring mastery of both technical skills and psychological insight. Portrait work requires careful observation of proportions, the play of light across facial features, and the subtle variations in skin tone and texture. Notice how the artist has captured the unique characteristics of the subject while maintaining a sense of the underlying bone structure that gives the face its form. This type of study teaches us about the balance between individual likeness and artistic interpretation.`
    } 
    
    if (labels.includes('landscape') || labels.includes('nature')) {
      return `This landscape study explores the relationship between natural forms and atmospheric conditions. Landscape painting became increasingly important in art history, particularly as artists moved away from purely religious and historical subjects to explore the natural world. This genre teaches artists about perspective, color temperature, and how to create depth through the manipulation of value and color. Notice how the artist has handled the transition from foreground to background, using techniques like atmospheric perspective to create a sense of space and distance. This type of study helps develop an understanding of how to represent three-dimensional space on a two-dimensional surface.`
    } 
    
    if (labels.includes('flower') || labels.includes('bouquet')) {
      return `This floral study demonstrates the artist's attention to natural form, color relationships, and composition. Still life painting with flowers has been a popular subject throughout art history, offering artists the opportunity to study natural forms in a controlled setting. This genre teaches artists about color harmony, the importance of value relationships, and how to create visual interest through the arrangement of organic forms. Notice how the artist has captured the delicate textures and varied shapes of the flowers while maintaining a balanced composition. This type of study helps develop skills in observation, color mixing, and compositional arrangement.`
    }
    
    // Create educational descriptions for general artworks
    let description = `This artwork presents an excellent study of ${labels.slice(0, 3).join(', ')}. `
    
    if (objects.length > 0) {
      description += `The composition thoughtfully incorporates ${objects.slice(0, 2).join(' and ')}, demonstrating the artist's understanding of how different elements work together to create visual harmony. `
    }
    
    if (colors.length > 0) {
      description += `The color palette emphasizes ${colors.slice(0, 2).join(' and ')}, showing how color relationships can create mood and guide the viewer's eye through the composition. `
    }
    
    description += `This type of study helps develop fundamental artistic skills including observation, composition, and the understanding of how visual elements interact to create meaning and emotional impact.`
    
    return description
  }

  private identifyTechniques(result: ImageAnalysisResult): string[] {
    const techniques = []
    const labels = result.labels || []
    const colors = result.colors || []
    
    if (labels.some(label => label.toLowerCase().includes('oil'))) {
      techniques.push('Oil painting - allows for rich, layered colors and smooth blending')
    }
    if (labels.some(label => label.toLowerCase().includes('watercolor'))) {
      techniques.push('Watercolor - creates transparency and luminosity through layering')
    }
    if (labels.some(label => label.toLowerCase().includes('brush'))) {
      techniques.push('Expressive brushwork - visible strokes that add energy and movement')
    }
    if (labels.some(label => label.toLowerCase().includes('texture'))) {
      techniques.push('Textural variety - different surface qualities create visual interest')
    }
    
    // Add color technique analysis
    if (colors.length > 2) {
      techniques.push('Color harmony - multiple colors working together to create visual balance')
    }
    if (colors.some(color => color.toLowerCase().includes('warm'))) {
      techniques.push('Warm color palette - creates energy and draws attention')
    }
    if (colors.some(color => color.toLowerCase().includes('cool'))) {
      techniques.push('Cool color palette - creates calm and recedes in space')
    }
    
    // Add composition techniques based on content
    if (labels.some(label => label.toLowerCase().includes('portrait'))) {
      techniques.push('Portrait composition - careful attention to facial proportions and expression')
    }
    if (labels.some(label => label.toLowerCase().includes('landscape'))) {
      techniques.push('Landscape perspective - creating depth through atmospheric and linear perspective')
    }
    if (labels.some(label => label.toLowerCase().includes('skeleton') || label.toLowerCase().includes('bone'))) {
      techniques.push('Anatomical study - understanding underlying structure and form')
    }
    
    return techniques.length > 0 ? techniques : ['Fundamental artistic techniques']
  }

  private identifyElements(result: ImageAnalysisResult): string[] {
    const elements = []
    const labels = result.labels || []
    const colors = result.colors || []
    const objects = result.objects || []
    
    if (colors.length > 0) {
      elements.push(`Color Theory: Dominant colors (${colors.slice(0, 3).join(', ')}) create mood and guide the eye`)
    }
    
    if (labels.some(label => label.toLowerCase().includes('line'))) {
      elements.push('Line Quality: Strong linear elements create structure and movement')
    }
    
    if (labels.some(label => label.toLowerCase().includes('shape'))) {
      elements.push('Shape Relationships: Geometric and organic forms create visual balance')
    }
    
    if (labels.some(label => label.toLowerCase().includes('texture'))) {
      elements.push('Surface Texture: Varied textural qualities add visual interest and depth')
    }
    
    // Add specific artistic elements based on content
    if (labels.some(label => label.toLowerCase().includes('portrait'))) {
      elements.push('Facial Proportions: Careful attention to anatomical structure and expression')
    }
    
    if (labels.some(label => label.toLowerCase().includes('landscape'))) {
      elements.push('Atmospheric Perspective: Use of color and value to create depth and distance')
    }
    
    if (labels.some(label => label.toLowerCase().includes('skeleton') || label.toLowerCase().includes('bone'))) {
      elements.push('Anatomical Structure: Understanding of bone structure and three-dimensional form')
    }
    
    if (objects.length > 0) {
      elements.push(`Compositional Elements: Strategic placement of ${objects.slice(0, 2).join(' and ')} creates visual hierarchy`)
    }
    
    // Add general artistic principles
    elements.push('Value Relationships: Light and shadow create form and depth')
    elements.push('Compositional Balance: Arrangement of elements creates visual harmony')
    
    return elements.length > 0 ? elements : ['Fundamental visual elements']
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
