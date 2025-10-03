// Comprehensive Educational Art Analysis Service
// Implements the call-and-recall pattern with all APIs for maximum educational value

import WorkflowMonitor from './workflowMonitor'

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

  // Simple in-memory cache and circuit breaker per endpoint key
  private recallCache = new Map<string, any>()
  private circuit = new Map<string, { failures: number; openUntil: number }>()
  private retryConfig = { attempts: 2, baseDelayMs: 400, timeoutMs: 15000, breakerThreshold: 3, breakerCooldownMs: 30000 }

  private async withRetries<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const now = Date.now()
    const state = this.circuit.get(name)
    if (state && state.openUntil > now) {
      throw new Error(`Circuit open for ${name}`)
    }

    let lastErr: any = null
    for (let attempt = 0; attempt <= this.retryConfig.attempts; attempt++) {
      try {
        const result = await this.withTimeout(fn(), this.retryConfig.timeoutMs)
        // success → reset circuit
        this.circuit.set(name, { failures: 0, openUntil: 0 })
        return result
      } catch (err) {
        lastErr = err
        const entry = this.circuit.get(name) || { failures: 0, openUntil: 0 }
        entry.failures += 1
        if (entry.failures >= this.retryConfig.breakerThreshold) {
          entry.openUntil = Date.now() + this.retryConfig.breakerCooldownMs
        }
        this.circuit.set(name, entry)
        if (attempt < this.retryConfig.attempts) {
          const delay = this.retryConfig.baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 150)
          await new Promise(r => setTimeout(r, delay))
        }
      }
    }
    throw lastErr
  }

  private async withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('Timeout')), ms)
      p.then(v => { clearTimeout(t); resolve(v) }).catch(e => { clearTimeout(t); reject(e) })
    })
  }

  private async getCached<T>(key: string, name: string, fn: () => Promise<T>): Promise<T> {
    if (this.recallCache.has(key)) {
      return this.recallCache.get(key)
    }
    const result = await this.withRetries(name, fn)
    this.recallCache.set(key, result)
    return result
  }
 
  // Main comprehensive analysis function
  async analyzeArtworkComprehensively(imageBase64: string): Promise<ComprehensiveEducationalAnalysis> {
    console.log('🎨 Starting comprehensive educational artwork analysis...');

    // Stage 1: Vision Analysis - Run all vision APIs in parallel
    console.log('🔍 Stage 1: Performing comprehensive visual analysis...');
    WorkflowMonitor.startStage('vision')
    const visionResults = await this.performVisionAnalysis(imageBase64);
    WorkflowMonitor.completeStage('vision', 0, true, { details: 'Vision analysis complete' })

    // Stage 2: Initial AI Interpretation
    console.log('🧠 Stage 2: Generating initial AI interpretation...');
    WorkflowMonitor.startStage('interpretation')
    const initialInsights = await this.generateInitialInterpretation(visionResults);
    WorkflowMonitor.completeStage('interpretation', 0, true, { details: 'Initial interpretation complete' })

    // Stage 3: Comprehensive Targeted Recall
    console.log('🎯 Stage 3: Performing comprehensive targeted recall...');
    WorkflowMonitor.startStage('recall')
    const recallData = await this.performComprehensiveRecall(visionResults, initialInsights);
    WorkflowMonitor.completeStage('recall', 0, true, { details: 'Recall complete' })

    // Stage 4: Final Synthesis
    console.log('🎨 Stage 4: Generating final educational synthesis...');
    WorkflowMonitor.startStage('synthesis')
    const finalAnalysis = await this.generateFinalSynthesis(visionResults, initialInsights, recallData);
    WorkflowMonitor.completeStage('synthesis', 0, true, { details: 'Synthesis complete' })

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

    // Require at least one vision API to succeed
    if (!clarifai && !google && !microsoft) {
      throw new Error('All vision APIs failed - Real API mode requires at least one vision service');
    }

    const countAndSort = (values: string[]) => {
      const counts = new Map<string, number>()
      values.forEach(v => {
        if (!v) return
        const key = String(v).trim()
        if (!key) return
        counts.set(key, (counts.get(key) || 0) + 1)
      })
      return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([k]) => k)
    }

    return {
      clarifai,
      google,
      microsoft,
      combined: {
        labels: countAndSort([ ...(clarifai?.labels || []), ...(google?.labels || []), ...(microsoft?.labels || []) ]),
        objects: countAndSort([ ...(google?.objects || []), ...(microsoft?.objects || []) ]),
        colors: countAndSort([ ...(google?.colors || []), ...(microsoft?.colors || []) ]),
        text: countAndSort([ ...(google?.text || []), ...(microsoft?.text || []) ]),
        
        faces: (google?.faces || 0) + (microsoft?.faces || 0),
        categories: microsoft?.categories || []
      }
    };
  }

  // Stage 2: Initial AI Interpretation
  private async generateInitialInterpretation(visionData: any) {
    if (!this.apiKeys.openai) {
      throw new Error('OpenAI API key not configured - Real API mode requires all keys');
    }

    const prompt = `Analyze this artwork for educational purposes and produce approachable guidance suitable for a broad audience. Use clear, encouraging language and focus on a guided walkthrough (Observe → Analyze → Interpret → Connect). Prioritize accurate, student-friendly insights.

Visual Data:
- Labels: ${visionData.combined.labels?.join(', ') || 'None detected'}
- Objects: ${visionData.combined.objects?.join(', ') || 'None detected'}
- Colors: ${visionData.combined.colors?.join(', ') || 'None detected'}
- Text: ${visionData.combined.text?.join(', ') || 'None detected'}

Provide educational insights in this JSON format (valid JSON only):
{
  "styleInsights": ["Detailed observation about artistic style and movement characteristics", "Analysis of visual language and stylistic choices"],
  "techniqueInsights": ["Technical observations about materials and methods", "Analysis of skill level and application techniques"],
  "themeInsights": ["Thematic content and symbolic elements", "Emotional tone and narrative elements"],
  "mediumInsights": ["Material analysis and historical context", "Technical properties and educational significance"],
  "reflectionQuestions": ["What do you notice first when looking at this artwork?", "How does the artist use color to create mood?", "What techniques can you identify in the brushwork?"],
  "learningObjectives": ["Develop visual literacy skills", "Understand color theory principles", "Analyze compositional techniques"]
}`;

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
            content: 'You are an expert art educator creating approachable, student-friendly guidance. Use clear, encouraging language. Focus on a guided walkthrough (Observe → Analyze → Interpret → Connect). Avoid identification; emphasize style, technique, theme, and medium. Respond with VALID JSON only, no extra text.'
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

    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('JSON Parse Error in initial interpretation:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
    }
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

    // 2. Wikipedia search for historical context (with cache+resilience)
    if (searchTerms.length > 0) {
      const term = searchTerms[0]
      const cacheKey = `wiki:${term}`
      recallPromises.push(
        this.getCached(cacheKey, 'wikipedia', () => this.searchWikipedia(term)).then(result => {
          recallData.wikipediaData = result;
          if (result) console.log('✅ Wikipedia data found:', result.title);
        }).catch(err => console.warn('Wikipedia search failed:', err))
      );
    }

    // 3. Met Museum search for comparative examples
    if (searchTerms.length > 0) {
      const term = searchTerms[0]
      const cacheKey = `met:${term}`
      recallPromises.push(
        this.getCached(cacheKey, 'met', () => this.searchMetMuseum(term)).then(result => {
          recallData.metMuseumData = result;
          if (result) console.log('✅ Met Museum data found:', result.title);
        }).catch(err => console.warn('Met Museum search failed:', err))
      );
    }

    // 4. Harvard Art Museums search
    if (this.apiKeys.harvard && searchTerms.length > 0) {
      const term = searchTerms[0]
      const cacheKey = `harvard:${term}`
      recallPromises.push(
        this.getCached(cacheKey, 'harvard', () => this.searchHarvardArtwork(term)).then(result => {
          recallData.harvardData = result;
          if (result && result.length > 0) console.log('✅ Harvard data found:', result.length, 'artworks');
        }).catch(err => console.warn('Harvard search failed:', err))
      );
    }

    // 5. Art Institute search
    if (searchTerms.length > 0) {
      const term = searchTerms[0]
      const cacheKey = `aic:${term}`
      recallPromises.push(
        this.getCached(cacheKey, 'aic', () => this.searchArtInstitute(term)).then(result => {
          recallData.artInstituteData = result;
          if (result && result.length > 0) console.log('✅ Art Institute data found:', result.length, 'artworks');
        }).catch(err => console.warn('Art Institute search failed:', err))
      );
    }

    // 6. Art Search API
    if (this.apiKeys.artsearch && searchTerms.length > 0) {
      const term = searchTerms[0]
      const cacheKey = `artsearch:${term}`
      recallPromises.push(
        this.getCached(cacheKey, 'artsearch', () => this.searchArtSearch(term)).then(result => {
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
      throw new Error('OpenAI API key not configured - Real API mode requires all keys');
    }

    const synthesisPrompt = `Create a comprehensive, approachable educational walkthrough that teaches students how to look at and understand this artwork. Use a calm, encouraging tone and organize content so it can be presented step-by-step.

Vision Data: ${JSON.stringify(visionData.combined, null, 2)}
Initial Insights: ${JSON.stringify(initialInsights, null, 2)}
Recall Data: ${JSON.stringify(recallData, null, 2)}

Generate a complete educational analysis in this JSON format:
{"styleAnalysis": {"primaryStyle": "Artistic style name","styleCharacteristics": ["Characteristic 1", "Characteristic 2"],"movementContext": "Historical movement context","stylisticInfluences": ["Influence 1", "Influence 2"],"visualLanguage": "Description of visual language","educationalInsights": ["Educational insight 1", "Educational insight 2"]},"techniqueAnalysis": {"primaryTechniques": ["Technique 1", "Technique 2"],"materialProperties": ["Property 1", "Property 2"],"applicationMethods": ["Method 1", "Method 2"],"technicalInnovations": ["Innovation 1", "Innovation 2"],"skillLevel": "Assessment of technical skill","educationalValue": ["Value 1", "Value 2"]},"themeAnalysis": {"primaryThemes": ["Theme 1", "Theme 2"],"symbolicElements": ["Element 1", "Element 2"],"emotionalTone": "Description of emotional impact","culturalContext": "Cultural background","narrativeElements": ["Element 1", "Element 2"],"interpretiveApproaches": ["Approach 1", "Approach 2"]},"mediumAnalysis": {"primaryMedium": "Primary medium used","materialCharacteristics": ["Characteristic 1", "Characteristic 2"],"historicalUsage": "Historical context of medium","technicalAdvantages": ["Advantage 1", "Advantage 2"],"conservationNotes": ["Note 1", "Note 2"],"educationalSignificance": ["Significance 1", "Significance 2"]},"colorAnalysis": {"colorPalette": [{"hex": "#FF0000","name": "Red","percentage": 25,"emotionalAssociation": "Passion","symbolicMeaning": "Energy","educationalNote": "Creates focal point"}],"colorHarmony": "Description of color relationships","emotionalImpact": "How colors affect mood","symbolicMeaning": ["Meaning 1", "Meaning 2"],"colorTheory": ["Theory concept 1", "Theory concept 2"],"educationalInsights": ["Insight 1", "Insight 2"]},"compositionAnalysis": {"compositionalPrinciples": ["Principle 1", "Principle 2"],"visualFlow": "How the eye moves through the composition","focalPoints": ["Point 1", "Point 2"],"spatialRelationships": ["Relationship 1", "Relationship 2"],"balanceAndRhythm": "Description of balance and rhythm","educationalApplications": ["Application 1", "Application 2"]},"reflectionQuestions": [{"category": "observation","question": "What do you notice first?","followUp": "What draws your eye next?","educationalGoal": "Develop observational skills"}],"learningObjectives": [{"skill": "Visual Analysis","description": "Learn to analyze visual elements","assessmentMethod": "Observation and discussion","difficulty": "beginner"}],"discussionPrompts": [{"topic": "Color and Mood","question": "How do the colors affect your emotional response?","context": "Understanding color psychology","suggestedResponses": ["Response 1", "Response 2"]}],"artisticMovements": [{"name": "Movement Name","timePeriod": "Time period","characteristics": ["Characteristic 1", "Characteristic 2"],"keyArtists": ["Artist 1", "Artist 2"],"culturalContext": "Cultural background","educationalRelevance": "Why this matters for learning"}],"visualElements": [{"element": "Line","description": "Description of line usage","educationalValue": "What students can learn","observationTips": ["Tip 1", "Tip 2"],"relatedConcepts": ["Concept 1", "Concept 2"]}],"comparativeExamples": [{"title": "Example Title","artist": "Artist Name","similarity": "What's similar","contrast": "What's different","educationalValue": "Learning opportunity","imageUrl": "Optional image URL"}],"historicalContext": {"timePeriod": "When this was created","culturalBackground": "Cultural context","artisticClimate": "Artistic environment","socialInfluences": ["Influence 1", "Influence 2"],"educationalSignificance": "Why this matters for education"},"learningResources": {"keyConcepts": ["Concept 1", "Concept 2"],"discussionPrompts": ["Prompt 1", "Prompt 2"],"learningActivities": ["Activity 1", "Activity 2"],"vocabulary": ["Term 1", "Term 2"]},"confidence": 0.85,"sources": ["Google Vision", "OpenAI", "Wikipedia"],"analysisStages": []}`;

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
            content: 'You are a master art educator creating approachable, engaging educational walkthroughs. Organize content clearly for step-by-step presentation. Use plain, supportive language. Focus on style, technique, theme, and medium. Include reflection questions and learning objectives. Respond with VALID JSON only.'
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
    const raw = data.choices[0]?.message?.content as string | undefined;
    if (!raw) {
      throw new Error('No content received from OpenAI');
    }

    // Sanitize to best-effort JSON
    let content = raw.trim();
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      content = content.substring(firstBrace, lastBrace + 1);
    }
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Content that failed to parse:', content);
      // Fallback minimal structure so UI can render
      return {
        styleAnalysis: {
          primaryStyle: 'Analysis',
          styleCharacteristics: [],
          movementContext: '',
          stylisticInfluences: [],
          visualLanguage: content.slice(0, 300),
          educationalInsights: []
        },
        techniqueAnalysis: {
          primaryTechniques: [],
          materialProperties: [],
          applicationMethods: [],
          technicalInnovations: [],
          skillLevel: 'n/a',
          educationalValue: []
        },
        themeAnalysis: {
          primaryThemes: [],
          symbolicElements: [],
          emotionalTone: '',
          culturalContext: '',
          narrativeElements: [],
          interpretiveApproaches: []
        },
        mediumAnalysis: {
          primaryMedium: '',
          materialCharacteristics: [],
          historicalUsage: '',
          technicalAdvantages: [],
          conservationNotes: [],
          educationalSignificance: []
        },
        colorAnalysis: {
          colorPalette: [],
          colorHarmony: '',
          emotionalImpact: '',
          symbolicMeaning: [],
          colorTheory: [],
          educationalInsights: []
        },
        compositionAnalysis: {
          compositionalPrinciples: [],
          visualFlow: '',
          focalPoints: [],
          spatialRelationships: [],
          balanceAndRhythm: '',
          educationalApplications: []
        },
        reflectionQuestions: [],
        learningObjectives: [],
        discussionPrompts: [],
        artisticMovements: [],
        visualElements: [],
        comparativeExamples: [],
        historicalContext: {
          timePeriod: '',
          culturalBackground: '',
          artisticClimate: '',
          socialInfluences: [],
          educationalSignificance: ''
        },
        learningResources: {
          keyConcepts: [],
          discussionPrompts: [],
          learningActivities: [],
          vocabulary: []
        },
        confidence: 0.8,
        sources: ['OpenAI']
      } as unknown as ComprehensiveEducationalAnalysis;
    }
  }

  // Helper methods for API calls
  private async analyzeWithClarifai(imageBase64: string) {
    if (!this.apiKeys.clarifai) {
      throw new Error('Clarifai API key not configured - Real API mode requires all keys');
    }

    const base64Content = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    const candidateModelIds = [
      'general-image-recognition',
      'general-image-recognition@001',
      (import.meta.env.VITE_CLARIFAI_MODEL_ID || '').trim()
    ].filter(Boolean);

    let lastErrorText = '';
    for (const modelId of candidateModelIds) {
      const response = await fetch(`/proxy/clarifai/v2/models/${modelId}/outputs`, {
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

      if (response.ok) {
        const data = await response.json();
        return {
          labels: data.outputs?.[0]?.data?.concepts?.map((c: any) => c.name) || [],
          confidence: data.outputs?.[0]?.data?.concepts?.map((c: any) => c.value) || []
        };
      }
      lastErrorText = (await response.text().catch(() => '')) || lastErrorText;
      if (response.status !== 404) {
        throw new Error(`Clarifai API error: ${response.status}${lastErrorText ? ' - ' + lastErrorText : ''}`);
      }
    }
    throw new Error(`Clarifai API error: 404 - Tried models ${candidateModelIds.join(', ')}. ${lastErrorText}`);
  }

  private async analyzeWithGoogleVision(imageBase64: string) {
    if (!this.apiKeys.googleVision) {
      throw new Error('Google Vision API key not configured - Real API mode requires all keys');
    }

    const base64Content = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    const response = await fetch(
      `/proxy/google/v1/images:annotate?key=${this.apiKeys.googleVision}`,
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
      throw new Error('Microsoft Vision API not configured - Real API mode requires all keys');
    }

    const base64Content = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    const response = await fetch(
      `/proxy/msvision/vision/v3.2/analyze?visualFeatures=Categories,Description,Objects,Color,Adult,Tags`,
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

  // Additional helper methods for comprehensive recall
  private async performColorAnalysis(colors: string[]) {
    if (!colors || colors.length === 0) {
      throw new Error('No color data available for analysis');
    }

    return {
      dominantColors: colors.slice(0, 6).map((color, index) => ({
        hex: this.rgbToHex(color),
        name: this.getColorName(color),
        percentage: Math.max(20 - (index * 3), 5),
        emotionalAssociation: this.getEmotionalAssociation(color),
        symbolicMeaning: this.getSymbolicMeaning(color),
        educationalNote: this.getEducationalNote(color)
      })),
      colorHarmony: this.analyzeColorHarmony(colors),
      emotionalImpact: this.analyzeEmotionalImpact(colors),
      colorTheory: this.generateColorTheoryInsights(colors)
    };
  }

  private async searchWikipedia(query: string) {
    try {
      const cleanQuery = query.replace(/[^a-zA-Z0-9\s-]/g, ' ').trim();
      const targetUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
      const proxyUrl = `/proxy/allorigins/raw?url=${encodeURIComponent(targetUrl)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Wikipedia API error: ${response.status}`);
      
      const data = await response.json();
      return {
        title: data.title,
        extract: data.extract,
        description: data.description,
        url: data.content_urls?.desktop?.page || ''
      };
    } catch (error) {
      throw new Error(`Wikipedia search failed: ${error.message}`);
    }
  }

  private async searchMetMuseum(query: string) {
    try {
      const response = await fetch(`/proxy/met/public/collection/v1/search?q=${encodeURIComponent(query)}&hasImages=true&isOnView=true`);
      if (!response.ok) throw new Error(`Met Museum API error: ${response.status}`);
      
      const data = await response.json();
      if (!data.objectIDs || data.objectIDs.length === 0) {
        throw new Error('No artworks found in Met Museum');
      }
      
      // Get details for first result
      const detailResponse = await fetch(`/proxy/met/public/collection/v1/objects/${data.objectIDs[0]}`);
      if (!detailResponse.ok) throw new Error(`Met Museum detail API error: ${detailResponse.status}`);
      
      return await detailResponse.json();
    } catch (error) {
      throw new Error(`Met Museum search failed: ${error.message}`);
    }
  }

  private async searchHarvardArtwork(query: string) {
    if (!this.apiKeys.harvard) {
      throw new Error('Harvard Art Museums API key not configured - Real API mode requires all keys');
    }
    
    try {
      const response = await fetch(
        `/proxy/harvard/object?apikey=${this.apiKeys.harvard}&q=${encodeURIComponent(query)}&size=3&hasimage=1&fields=title,people,dated,culture,period,medium,classification,technique,description`
      );
      if (!response.ok) throw new Error(`Harvard API error: ${response.status}`);
      
      const data = await response.json();
      if (!data.records || data.records.length === 0) {
        throw new Error('No artworks found in Harvard Art Museums');
      }
      return data.records;
    } catch (error: any) {
      throw new Error(`Harvard search failed: ${error.message}`);
    }
  }

  private async searchArtInstitute(query: string) {
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&limit=3&fields=id,title,artist_display,date_display,style_titles,medium_display,description,image_id`
      );
      if (!response.ok) throw new Error(`Art Institute API error: ${response.status}`);
      
      const data = await response.json();
      if (!data.data || data.data.length === 0) {
        throw new Error('No artworks found in Art Institute of Chicago');
      }
      return data.data;
    } catch (error) {
      throw new Error(`Art Institute search failed: ${error.message}`);
    }
  }

  private async searchArtSearch(query: string) {
    if (!this.apiKeys.artsearch) {
      throw new Error('Art Search API key not configured - Real API mode requires all keys');
    }
    
    const endpoints = [
      `/proxy/artsearch/v1/search?query=${encodeURIComponent(query)}&limit=5`,
      `/proxy/artsearch/api/v1/search?query=${encodeURIComponent(query)}&limit=5`,
      `/proxy/artsearch/search?query=${encodeURIComponent(query)}&limit=5`
    ];
    const headersList = [
      { 'X-API-KEY': this.apiKeys.artsearch },
      { Authorization: `Bearer ${this.apiKeys.artsearch}` }
    ];
    
    for (const url of endpoints) {
      for (const headers of headersList) {
        try {
          const response = await fetch(url, { headers });
          if (!response.ok) continue;
          const data = await response.json();
          const results = data.items || data.results || data.data || [];
          if (Array.isArray(results) && results.length > 0) return results;
        } catch {
          // try next
        }
      }
    }
    throw new Error('Art Search failed: No valid endpoint responded');
  }

  private async performTextureAnalysis(visionData: any) {
    // This would typically use a specialized texture analysis API
    // For now, we'll create educational content based on visual cues
    return {
      textureTypes: ['Visible brushstrokes', 'Surface variation', 'Material texture'],
      techniqueNotes: ['Impasto technique evident', 'Varied brushwork creates surface interest'],
      educationalValue: ['Teaches about material properties', 'Shows how texture affects visual impact']
    };
  }

  private async performEmotionalAnalysis(visionData: any, initialInsights: any) {
    const emotionalCues = [];
    
    // Analyze color mood
    if (visionData.colors && visionData.colors.length > 0) {
      const warmColors = visionData.colors.filter(color => {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return false;
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const hsl = this.rgbToHsl(r, g, b);
        return hsl.h >= 0 && hsl.h <= 60 || hsl.h >= 300;
      });
      
      if (warmColors.length > visionData.colors.length / 2) {
        emotionalCues.push('Warm, energetic mood');
      } else {
        emotionalCues.push('Cool, contemplative mood');
      }
    }
    
    // Analyze composition for emotional impact
    if (visionData.objects && visionData.objects.length > 0) {
      emotionalCues.push('Complex composition suggests depth of meaning');
    }
    
    return {
      dominantMood: emotionalCues[0] || 'Balanced emotional tone',
      emotionalCues: emotionalCues,
      psychologicalImpact: 'Invites contemplation and emotional engagement',
      educationalValue: 'Teaches about color psychology and emotional expression in art'
    };
  }

  private async generateLearningResources(visionData: any, initialInsights: any) {
    return {
      keyConcepts: [
        'Visual composition principles',
        'Color theory and psychology',
        'Artistic technique and material use',
        'Historical and cultural context'
      ],
      discussionPrompts: [
        'What emotions does this artwork evoke in you?',
        'How does the artist use color to create mood?',
        'What techniques can you identify in the brushwork?',
        'How does the composition guide your eye?'
      ],
      learningActivities: [
        'Create a color study inspired by this artwork',
        'Write a descriptive analysis of the composition',
        'Research the historical period and artistic movement',
        'Compare with other artworks from the same period'
      ],
      vocabulary: [
        'Composition', 'Chiaroscuro', 'Color harmony', 'Brushwork', 'Perspective',
        'Texture', 'Value', 'Form', 'Line', 'Space'
      ]
    };
  }

  private async findSimilarArtworks(searchTerms: string[]) {
    const similarArtworks = [];
    
    // Search multiple sources for similar artworks
    const searchPromises = searchTerms.slice(0, 2).map(async (term) => {
      try {
        const [metResults, artInstituteResults] = await Promise.allSettled([
          this.searchMetMuseum(term),
          this.searchArtInstitute(term)
        ]);
        
        const results = [];
        if (metResults.status === 'fulfilled' && metResults.value) {
          results.push({
            title: metResults.value.title,
            artist: metResults.value.artistDisplayName,
            period: metResults.value.objectDate,
            source: 'Metropolitan Museum of Art'
          });
        }
        
        if (artInstituteResults.status === 'fulfilled' && artInstituteResults.value) {
          results.push(...artInstituteResults.value.slice(0, 2).map(artwork => ({
            title: artwork.title,
            artist: artwork.artist_display,
            period: artwork.date_display,
            source: 'Art Institute of Chicago'
          })));
        }
        
        return results;
      } catch (error) {
        return [];
      }
    });
    
    const allResults = await Promise.all(searchPromises);
    similarArtworks.push(...allResults.flat());
    
    return similarArtworks.slice(0, 6); // Return top 6 similar artworks
  }

  // Color analysis helper functions
  private rgbToHex(rgb: string): string {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return '#000000';
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  private getColorName(rgb: string): string {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return 'Unknown';
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    const hsl = this.rgbToHsl(r, g, b);
    const { h, s, l } = hsl;
    
    if (s < 20) {
      if (l > 80) return 'White';
      if (l < 20) return 'Black';
      return 'Gray';
    }
    
    if (h < 15 || h > 345) return 'Red';
    if (h < 45) return 'Orange';
    if (h < 75) return 'Yellow';
    if (h < 150) return 'Green';
    if (h < 210) return 'Cyan';
    if (h < 270) return 'Blue';
    if (h < 330) return 'Purple';
    return 'Pink';
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  private getEmotionalAssociation(color: string): string {
    const colorName = this.getColorName(color);
    const associations = {
      'Red': 'Passion, Energy',
      'Blue': 'Calm, Trust',
      'Green': 'Nature, Growth',
      'Yellow': 'Joy, Optimism',
      'Purple': 'Luxury, Mystery',
      'Orange': 'Warmth, Enthusiasm',
      'Pink': 'Gentleness, Love',
      'Black': 'Power, Elegance',
      'White': 'Purity, Simplicity',
      'Gray': 'Balance, Neutrality'
    };
    return associations[colorName] || 'Complex emotions';
  }

  private getSymbolicMeaning(color: string): string {
    const colorName = this.getColorName(color);
    const meanings = {
      'Red': 'Energy, Power',
      'Blue': 'Stability, Depth',
      'Green': 'Harmony, Renewal',
      'Yellow': 'Intellect, Creativity',
      'Purple': 'Royalty, Spirituality',
      'Orange': 'Vitality, Success',
      'Pink': 'Compassion, Nurturing',
      'Black': 'Mystery, Sophistication',
      'White': 'Clarity, New Beginnings',
      'Gray': 'Wisdom, Maturity'
    };
    return meanings[colorName] || 'Rich symbolism';
  }

  private getEducationalNote(color: string): string {
    const colorName = this.getColorName(color);
    const notes = {
      'Red': 'Creates visual emphasis and draws attention',
      'Blue': 'Establishes depth and creates calm atmosphere',
      'Green': 'Balances composition and suggests nature',
      'Yellow': 'Adds energy and creates focal points',
      'Purple': 'Conveys luxury and spiritual themes',
      'Orange': 'Warms the composition and adds vitality',
      'Pink': 'Softens harsh contrasts and adds warmth',
      'Black': 'Creates strong contrast and defines shapes',
      'White': 'Provides breathing room and highlights',
      'Gray': 'Creates sophisticated neutral tones'
    };
    return notes[colorName] || 'Important compositional element';
  }

  private analyzeColorHarmony(colors: string[]): string {
    if (colors.length < 2) return 'Monochromatic harmony';
    
    const hues = colors.map(color => {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return 0;
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      return this.rgbToHsl(r, g, b).h;
    });
    
    const hueRange = Math.max(...hues) - Math.min(...hues);
    
    if (hueRange < 30) return 'Monochromatic harmony - creates unity and cohesion';
    if (hueRange < 60) return 'Analogous harmony - colors work together harmoniously';
    if (hueRange > 120 && hueRange < 180) return 'Complementary harmony - creates dynamic contrast';
    return 'Complex color relationship - multiple harmonies working together';
  }

  private analyzeEmotionalImpact(colors: string[]): string {
    const warmColors = colors.filter(color => {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return false;
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const hsl = this.rgbToHsl(r, g, b);
      return hsl.h >= 0 && hsl.h <= 60 || hsl.h >= 300;
    });
    
    if (warmColors.length > colors.length / 2) {
      return 'Warm color palette creates energy, passion, and vitality';
    } else {
      return 'Cool color palette creates calm, peaceful, and serene feelings';
    }
  }

  private generateColorTheoryInsights(colors: string[]): string[] {
    const insights = [];
    
    if (colors.length >= 3) {
      insights.push('Demonstrates sophisticated understanding of color relationships');
    }
    
    const hasWarmColors = colors.some(color => {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return false;
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const hsl = this.rgbToHsl(r, g, b);
      return hsl.h >= 0 && hsl.h <= 60 || hsl.h >= 300;
    });
    
    const hasCoolColors = colors.some(color => {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return false;
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const hsl = this.rgbToHsl(r, g, b);
      return hsl.h > 60 && hsl.h < 300;
    });
    
    if (hasWarmColors && hasCoolColors) {
      insights.push('Strategic use of warm and cool colors creates visual tension and depth');
    }
    
    return insights;
  }

  private extractComprehensiveSearchTerms(labels: string[], insights: any): string[] {
    const generic = new Set(['art', 'image', 'artwork', 'visual', 'picture', 'photo', 'artist'])
    const clean = (s: string) => s
      .replace(/[^a-zA-Z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()

    const baseLabels = (labels || [])
      .map(l => clean(l))
      .filter(l => l && l.length > 2 && !generic.has(l))

    // Prefer multi-word noun-like phrases from labels
    const multiWord = baseLabels.filter(l => l.includes(' '))
    const singleWord = baseLabels.filter(l => !l.includes(' '))

    const fromInsights: string[] = []
    const pushFrom = (arr?: string[], limit: number = 2) => {
      if (!arr) return
      for (const s of arr) {
        const c = clean(s)
        if (c && c.length > 3 && !generic.has(c)) fromInsights.push(c)
        if (fromInsights.length >= limit) break
      }
    }
    pushFrom(insights?.styleInsights, 3)
    pushFrom(insights?.themeInsights, 3)
    pushFrom(insights?.techniqueInsights, 2)
    pushFrom(insights?.mediumInsights, 2)

    const merged = [...multiWord, ...fromInsights, ...singleWord]
    const unique = Array.from(new Set(merged))
    return unique.slice(0, 5)
  }

  // (Removed duplicate placeholder methods)
}

export default new ComprehensiveEducationalService();
