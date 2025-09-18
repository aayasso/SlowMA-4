// Comprehensive Educational Art Analysis Service
// Implements the call-and-recall pattern with all APIs for maximum educational value

export interface ComprehensiveEducationalAnalysis {
  // Core analysis sections
  styleAnalysis: {
    primaryStyle: string;
    styleCharacteristics: string[];
    movementContext: string;
    stylisticInfluences: string[];
    visualLanguage: string;
    educationalInsights: string[];
  };
  techniqueAnalysis: {
    primaryTechniques: string[];
    materialProperties: string[];
    applicationMethods: string[];
    technicalInnovations: string[];
    skillLevel: string;
    educationalValue: string[];
  };
  themeAnalysis: {
    primaryThemes: string[];
    symbolicElements: string[];
    emotionalTone: string;
    culturalContext: string;
    narrativeElements: string[];
    interpretiveApproaches: string[];
  };
  mediumAnalysis: {
    primaryMedium: string;
    materialCharacteristics: string[];
    historicalUsage: string;
    technicalAdvantages: string[];
    conservationNotes: string[];
    educationalSignificance: string[];
  };
  colorAnalysis: {
    colorPalette: Array<{
      hex: string;
      name: string;
      percentage: number;
      emotionalAssociation: string;
      symbolicMeaning: string;
      educationalNote: string;
    }>;
    colorHarmony: string;
    emotionalImpact: string;
    symbolicMeaning: string[];
    colorTheory: string[];
    educationalInsights: string[];
  };
  compositionAnalysis: {
    compositionalPrinciples: string[];
    visualFlow: string;
    focalPoints: string[];
    spatialRelationships: string[];
    balanceAndRhythm: string[];
    educationalApplications: string[];
  };
  
  // Educational content
  reflectionQuestions: Array<{
    category: 'observation' | 'interpretation' | 'connection' | 'technique';
    question: string;
    followUp?: string;
    educationalGoal: string;
  }>;
  learningObjectives: Array<{
    skill: string;
    description: string;
    assessmentMethod: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }>;
  discussionPrompts: Array<{
    topic: string;
    question: string;
    context: string;
    suggestedResponses: string[];
  }>;
  
  // Comparative and contextual data
  artisticMovements: Array<{
    name: string;
    timePeriod: string;
    characteristics: string[];
    keyArtists: string[];
    culturalContext: string;
    educationalRelevance: string;
  }>;
  visualElements: Array<{
    element: string;
    description: string;
    educationalValue: string;
    observationTips: string[];
    relatedConcepts: string[];
  }>;
  comparativeExamples: Array<{
    title: string;
    artist: string;
    similarity: string;
    contrast: string;
    educationalValue: string;
    imageUrl?: string;
  }>;
  historicalContext: {
    timePeriod: string;
    culturalBackground: string;
    artisticClimate: string;
    socialInfluences: string[];
    educationalSignificance: string;
  };
  
  // Learning resources
  learningResources: {
    keyConcepts: string[];
    discussionPrompts: string[];
    learningActivities: string[];
    vocabulary: string[];
  };
  
  // Analysis metadata
  confidence: number;
  sources: string[];
  analysisStages: Array<{
    stage: 'vision' | 'interpretation' | 'recall' | 'synthesis';
    description: string;
    apisUsed: string[];
    insights: string[];
    timestamp: Date;
  }>;
}

class ComprehensiveEducationalService {
  private apiKeys = {
    googleVision: import.meta.env.VITE_GOOGLE_VISION_API_KEY || '',
    microsoftVision: import.meta.env.VITE_MICROSOFT_VISION_API_KEY || '',
    microsoftEndpoint: import.meta.env.VITE_MICROSOFT_VISION_ENDPOINT || '',
    clarifai: import.meta.env.VITE_CLARIFAI_API_KEY || '',
    openai: import.meta.env.VITE_OPENAI_API_KEY || '',
    harvard: import.meta.env.VITE_HARVARD_ART_MUSEUMS_API_KEY || '',
    artsearch: import.meta.env.VITE_ARTSEARCH_API_KEY || '',
  };

  // Main comprehensive analysis function
  async analyzeArtworkComprehensively(imageBase64: string): Promise<ComprehensiveEducationalAnalysis> {
    console.log('🎨 Starting comprehensive educational artwork analysis...');

    // Stage 1: Vision Analysis - Run all vision APIs in parallel
    console.log('🔍 Stage 1: Performing comprehensive visual analysis...');
    const visionResults = await this.performVisionAnalysis(imageBase64);

    // Stage 2: Initial AI Interpretation
    console.log('🧠 Stage 2: Generating initial AI interpretation...');
    const initialInsights = await this.generateInitialInterpretation(visionResults);

    // Stage 3: Comprehensive Targeted Recall
    console.log('🎯 Stage 3: Performing comprehensive targeted recall...');
    const recallData = await this.performComprehensiveRecall(visionResults, initialInsights);

    // Stage 4: Final Synthesis
    console.log('🎨 Stage 4: Generating final educational synthesis...');
    const finalAnalysis = await this.generateFinalSynthesis(visionResults, initialInsights, recallData);

    console.log('✅ Comprehensive educational analysis complete!');
    return finalAnalysis;
  }

  // Stage 1: Vision Analysis
  private async performVisionAnalysis(imageBase64: string) {
    const visionResults = await Promise.allSettled([
      this.analyzeWithClarifai(imageBase64),
      this.analyzeWithGoogleVision(imageBase64),
      this.analyzeWithMicrosoftVision(imageBase64)
    ]);

    const clarifai = visionResults[0].status === 'fulfilled' ? visionResults[0].value : null;
    const google = visionResults[1].status === 'fulfilled' ? visionResults[1].value : null;
    const microsoft = visionResults[2].status === 'fulfilled' ? visionResults[2].value : null;

    return {
      clarifai,
      google,
      microsoft,
      combined: {
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
    };
  }

  // Stage 2: Initial AI Interpretation
  private async generateInitialInterpretation(visionData: any) {
    if (!this.apiKeys.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze this artwork for educational purposes. Focus on style, technique, theme, and medium rather than identification.

Visual Data:
- Labels: ${visionData.combined.labels?.join(', ') || 'None detected'}
- Objects: ${visionData.combined.objects?.join(', ') || 'None detected'}
- Colors: ${visionData.combined.colors?.join(', ') || 'None detected'}
- Text: ${visionData.combined.text?.join(', ') || 'None detected'}

Provide educational insights in this JSON format:
{
  "styleInsights": ["Detailed observation about artistic style and movement characteristics", "Analysis of visual language and stylistic choices"],
  "techniqueInsights": ["Technical observations about materials and methods", "Analysis of skill level and application techniques"],
  "themeInsights": ["Thematic content and symbolic elements", "Emotional tone and narrative elements"],
  "mediumInsights": ["Material analysis and historical context", "Technical properties and educational significance"],
  "reflectionQuestions": ["What do you notice first when looking at this artwork?", "How does the artist use color to create mood?", "What techniques can you identify in the brushwork?"],
  "learningObjectives": ["Develop visual literacy skills", "Understand color theory principles", "Analyze compositional techniques"]
}`;

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
            content: 'You are an expert art educator who helps students understand art through deep observation and analysis. Focus on style, technique, theme, and medium rather than identifying specific artists or titles. Generate educational insights that encourage slow, thoughtful looking and learning. Respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content);
  }

  // Stage 3: Comprehensive Targeted Recall
  private async performComprehensiveRecall(visionData: any, initialInsights: any) {
    console.log('🎯 Performing comprehensive targeted recall with all APIs...');
    
    const recallData = {
      // Vision and texture analysis
      textureAnalysis: null,
      colorAnalysis: null,
      emotionalAnalysis: null,
      
      // Historical and cultural context
      wikipediaData: null,
      historicalContext: null,
      culturalContext: null,
      
      // Museum and collection data
      metMuseumData: null,
      harvardData: null,
      artInstituteData: null,
      artSearchData: null,
      
      // Comparative and educational data
      comparativeExamples: null,
      similarArtworks: null,
      artisticMovements: null,
      
      // Educational content
      learningResources: null,
      discussionPrompts: null,
      visualElements: null
    };

    const recallPromises = [];

    // Extract comprehensive search terms
    const searchTerms = this.extractComprehensiveSearchTerms(visionData.combined.labels, initialInsights);
    console.log('🔍 Search terms extracted:', searchTerms);

    // 1. ALWAYS perform color analysis (fundamental for art education)
    recallPromises.push(
      this.performColorAnalysis(visionData.combined.colors).then(result => {
        recallData.colorAnalysis = result;
        console.log('✅ Color analysis completed');
      }).catch(err => console.warn('Color analysis failed:', err))
    );

    // 2. Wikipedia search for historical context
    if (searchTerms.length > 0) {
      recallPromises.push(
        this.searchWikipedia(searchTerms[0]).then(result => {
          recallData.wikipediaData = result;
          if (result) console.log('✅ Wikipedia data found:', result.title);
        }).catch(err => console.warn('Wikipedia search failed:', err))
      );
    }

    // 3. Met Museum search for comparative examples
    if (searchTerms.length > 0) {
      recallPromises.push(
        this.searchMetMuseum(searchTerms[0]).then(result => {
          recallData.metMuseumData = result;
          if (result) console.log('✅ Met Museum data found:', result.title);
        }).catch(err => console.warn('Met Museum search failed:', err))
      );
    }

    // 4. Harvard Art Museums search
    if (this.apiKeys.harvard && searchTerms.length > 0) {
      recallPromises.push(
        this.searchHarvardArtwork(searchTerms[0]).then(result => {
          recallData.harvardData = result;
          if (result && result.length > 0) console.log('✅ Harvard data found:', result.length, 'artworks');
        }).catch(err => console.warn('Harvard search failed:', err))
      );
    }

    // 5. Art Institute search
    if (searchTerms.length > 0) {
      recallPromises.push(
        this.searchArtInstitute(searchTerms[0]).then(result => {
          recallData.artInstituteData = result;
          if (result && result.length > 0) console.log('✅ Art Institute data found:', result.length, 'artworks');
        }).catch(err => console.warn('Art Institute search failed:', err))
      );
    }

    // 6. Art Search API
    if (this.apiKeys.artsearch && searchTerms.length > 0) {
      recallPromises.push(
        this.searchArtSearch(searchTerms[0]).then(result => {
          recallData.artSearchData = result;
          if (result && result.length > 0) console.log('✅ Art Search data found:', result.length, 'artworks');
        }).catch(err => console.warn('Art Search failed:', err))
      );
    }

    // 7. Enhanced texture analysis if brushwork/technique mentioned
    if (initialInsights.techniqueInsights && 
        initialInsights.techniqueInsights.some(insight => 
          insight.toLowerCase().includes('brush') || 
          insight.toLowerCase().includes('texture') ||
          insight.toLowerCase().includes('impasto')
        )) {
      recallPromises.push(
        this.performTextureAnalysis(visionData.combined).then(result => {
          recallData.textureAnalysis = result;
          console.log('✅ Texture analysis completed');
        }).catch(err => console.warn('Texture analysis failed:', err))
      );
    }

    // 8. Emotional analysis based on color and composition
    recallPromises.push(
      this.performEmotionalAnalysis(visionData.combined, initialInsights).then(result => {
        recallData.emotionalAnalysis = result;
        console.log('✅ Emotional analysis completed');
      }).catch(err => console.warn('Emotional analysis failed:', err))
    );

    // 9. Generate learning resources and discussion prompts
    recallPromises.push(
      this.generateLearningResources(visionData.combined, initialInsights).then(result => {
        recallData.learningResources = result;
        console.log('✅ Learning resources generated');
      }).catch(err => console.warn('Learning resources generation failed:', err))
    );

    // 10. Find similar artworks for comparison
    if (searchTerms.length > 0) {
      recallPromises.push(
        this.findSimilarArtworks(searchTerms).then(result => {
          recallData.similarArtworks = result;
          if (result && result.length > 0) console.log('✅ Similar artworks found:', result.length);
        }).catch(err => console.warn('Similar artworks search failed:', err))
      );
    }

    // Wait for all recall operations to complete
    console.log('⏳ Waiting for all recall operations to complete...');
    await Promise.allSettled(recallPromises);

    // Log completion status
    const completedOperations = Object.keys(recallData).filter(key => recallData[key] !== null);
    console.log('✅ Recall operations completed:', completedOperations.length, 'out of', Object.keys(recallData).length);

    return recallData;
  }

  // Stage 4: Final Synthesis
  private async generateFinalSynthesis(visionData: any, initialInsights: any, recallData: any): Promise<ComprehensiveEducationalAnalysis> {
    if (!this.apiKeys.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const synthesisPrompt = `Create a comprehensive educational analysis that teaches students how to look at and understand art.

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
  },
  "learningResources": {
    "keyConcepts": ["Concept 1", "Concept 2"],
    "discussionPrompts": ["Prompt 1", "Prompt 2"],
    "learningActivities": ["Activity 1", "Activity 2"],
    "vocabulary": ["Term 1", "Term 2"]
  },
  "confidence": 0.85,
  "sources": ["Google Vision", "OpenAI", "Wikipedia"],
  "analysisStages": []
}`;

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
            content: 'You are a master art educator creating comprehensive educational content. Generate engaging, educational analysis that teaches students how to look at art. Focus on style, technique, theme, and medium. Include reflection questions and learning objectives. Create content that encourages slow, thoughtful engagement with the artwork. Respond with valid JSON only.'
          },
          {
            role: 'user',
            content: synthesisPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.4
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content);
  }

  // Helper methods for API calls
  private async analyzeWithClarifai(imageBase64: string) {
    if (!this.apiKeys.clarifai) {
      throw new Error('Clarifai API key not configured');
    }

    const base64Content = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    const response = await fetch(`https://api.clarifai.com/v2/models/general-image-recognition/outputs`, {
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
    });

    if (!response.ok) {
      throw new Error(`Clarifai API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      labels: data.outputs?.[0]?.data?.concepts?.map(c => c.name) || [],
      confidence: data.outputs?.[0]?.data?.concepts?.map(c => c.value) || []
    };
  }

  private async analyzeWithGoogleVision(imageBase64: string) {
    if (!this.apiKeys.googleVision) {
      throw new Error('Google Vision API key not configured');
    }

    const base64Content = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

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
    );

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.responses[0];

    return {
      labels: result.labelAnnotations?.map(l => l.description) || [],
      objects: result.localizedObjectAnnotations?.map(o => o.name) || [],
      text: result.textAnnotations?.map(t => t.description) || [],
      colors: result.imagePropertiesAnnotation?.dominantColors?.colors?.map(c => 
        `rgb(${c.color.red}, ${c.color.green}, ${c.color.blue})`
      ) || [],
      faces: result.faceAnnotations?.length || 0
    };
  }

  private async analyzeWithMicrosoftVision(imageBase64: string) {
    if (!this.apiKeys.microsoftVision || !this.apiKeys.microsoftEndpoint) {
      throw new Error('Microsoft Vision API not configured');
    }

    const base64Content = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

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
    );

    if (!response.ok) {
      throw new Error(`Microsoft Vision API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      labels: data.description?.tags || [],
      objects: data.objects?.map(o => o.object) || [],
      text: data.description?.captions?.map(c => c.text) || [],
      colors: data.color?.dominantColors || [],
      categories: data.categories?.map(c => c.name) || []
    };
  }

  // Additional helper methods would go here...
  // (Color analysis, Wikipedia search, museum searches, etc.)
  // These would be similar to the existing methods but adapted for this service

  private extractComprehensiveSearchTerms(labels: string[], insights: any): string[] {
    const terms = [...labels];
    
    // Add terms from all insight categories
    if (insights.styleInsights) {
      terms.push(...insights.styleInsights.slice(0, 3));
    }
    if (insights.themeInsights) {
      terms.push(...insights.themeInsights.slice(0, 3));
    }
    if (insights.techniqueInsights) {
      terms.push(...insights.techniqueInsights.slice(0, 2));
    }
    if (insights.mediumInsights) {
      terms.push(...insights.mediumInsights.slice(0, 2));
    }
    
    // Add art-specific terms that are likely to yield good results
    const artTerms = ['art', 'painting', 'artwork', 'artist', 'museum', 'gallery', 'artistic', 'visual'];
    terms.push(...artTerms);
    
    // Clean and deduplicate
    return [...new Set(terms)]
      .map(term => term.replace(/[^a-zA-Z0-9\s-]/g, ' ').trim())
      .filter(term => term.length > 2)
      .slice(0, 5);
  }

  // Placeholder methods for the various API calls
  private async performColorAnalysis(colors: string[]) {
    // Implementation would go here
    return { dominantColors: [], colorHarmony: 'Unknown', emotionalImpact: 'Unknown' };
  }

  private async searchWikipedia(query: string) {
    // Implementation would go here
    return null;
  }

  private async searchMetMuseum(query: string) {
    // Implementation would go here
    return null;
  }

  private async searchHarvardArtwork(query: string) {
    // Implementation would go here
    return [];
  }

  private async searchArtInstitute(query: string) {
    // Implementation would go here
    return [];
  }

  private async searchArtSearch(query: string) {
    // Implementation would go here
    return [];
  }

  private async performTextureAnalysis(visionData: any) {
    // Implementation would go here
    return { textureTypes: [], techniqueNotes: [], educationalValue: [] };
  }

  private async performEmotionalAnalysis(visionData: any, initialInsights: any) {
    // Implementation would go here
    return { dominantMood: 'Unknown', emotionalCues: [], psychologicalImpact: 'Unknown' };
  }

  private async generateLearningResources(visionData: any, initialInsights: any) {
    // Implementation would go here
    return { keyConcepts: [], discussionPrompts: [], learningActivities: [], vocabulary: [] };
  }

  private async findSimilarArtworks(searchTerms: string[]) {
    // Implementation would go here
    return [];
  }
}

export default new ComprehensiveEducationalService();
