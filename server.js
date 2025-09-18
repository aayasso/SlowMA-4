// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Helper function for forwarding requests
const proxyRequest = async (req, res, targetUrl, headers = {}) => {
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed", details: err.message });
  }
};

// -------- CLARIFAI --------
app.post("/proxy/clarifai/v2/models/:modelId/outputs", (req, res) => {
  const modelId = req.params.modelId || process.env.VITE_CLARIFAI_MODEL_ID;
  const targetUrl = `https://api.clarifai.com/v2/models/${modelId}/outputs`;

  proxyRequest(req, res, targetUrl, {
    Authorization: `Key ${process.env.VITE_CLARIFAI_API_KEY}`,
  });
});

// -------- MICROSOFT VISION --------
app.post("/proxy/microsoft/vision/analyze", (req, res) => {
  const region = process.env.VITE_MICROSOFT_REGION || "eastus";
  const targetUrl = `https://${region}.api.cognitive.microsoft.com/vision/v3.2/analyze?visualFeatures=Categories,Description,Color`;

  proxyRequest(req, res, targetUrl, {
    "Ocp-Apim-Subscription-Key": process.env.VITE_MICROSOFT_API_KEY,
  });
});

// -------- GOOGLE VISION --------
app.post("/proxy/google/vision", (req, res) => {
  const targetUrl = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.VITE_GOOGLE_API_KEY}`;
  proxyRequest(req, res, targetUrl);
});

// -------- OPENAI --------
app.post("/proxy/openai/chat", (req, res) => {
  const targetUrl = "https://api.openai.com/v1/chat/completions";
  proxyRequest(req, res, targetUrl, {
    Authorization: `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
  });
});

// -------- HARVARD ART MUSEUMS --------
app.get("/proxy/harvard/:endpoint(*)", (req, res) => {
  const endpoint = req.params.endpoint;
  const hasQuery = endpoint.includes("?");
  const separator = hasQuery ? "&" : "?";
  const targetUrl = `https://api.harvardartmuseums.org/${endpoint}${separator}apikey=${process.env.VITE_HARVARD_API_KEY}`;
  proxyRequest(req, res, targetUrl);
});

// -------- MET MUSEUM (no key required, just forward) --------
app.get("/proxy/met/:endpoint(*)", (req, res) => {
  const endpoint = req.params.endpoint;
  const targetUrl = `https://collectionapi.metmuseum.org/public/collection/v1/${endpoint}`;
  proxyRequest(req, res, targetUrl);
});

// -------- ARTSEARCH (Custom, update base URL if needed) --------
app.get("/proxy/artsearch/:endpoint(*)", (req, res) => {
  const endpoint = req.params.endpoint;
  const targetUrl = `https://your-artsearch-api.com/${endpoint}`;
  proxyRequest(req, res, targetUrl, {
    "x-api-key": process.env.VITE_ARTSEARCH_API_KEY || "",
  });
});

// -------- WIKIPEDIA --------
app.get("/proxy/wikipedia/:endpoint(*)", (req, res) => {
  const endpoint = req.params.endpoint;
  const targetUrl = `https://en.wikipedia.org/w/api.php?${endpoint}`;
  proxyRequest(req, res, targetUrl);
});

// -------- ALLORIGINS PROXY (for Wikipedia REST API) --------
app.get("/proxy/allorigins/raw", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ error: "URL parameter required" });
    }

    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
    const data = await response.text();
    
    res.status(response.status).json(JSON.parse(data));
  } catch (err) {
    console.error("AllOrigins proxy error:", err);
    res.status(500).json({ error: "AllOrigins proxy failed", details: err.message });
  }
});

// -------- COMPREHENSIVE EDUCATIONAL ART ANALYSIS ENDPOINT --------
app.post("/api/analyze-educational", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data required" });
    }

    console.log('🎨 Starting comprehensive educational artwork analysis...');

    // Stage 1: Vision Analysis - Run all vision APIs in parallel
    console.log('🔍 Stage 1: Performing comprehensive visual analysis...');
    const visionResults = await Promise.allSettled([
      analyzeWithClarifai(imageBase64),
      analyzeWithGoogleVision(imageBase64),
      analyzeWithMicrosoftVision(imageBase64)
    ]);

    const clarifai = visionResults[0].status === 'fulfilled' ? visionResults[0].value : null;
    const google = visionResults[1].status === 'fulfilled' ? visionResults[1].value : null;
    const microsoft = visionResults[2].status === 'fulfilled' ? visionResults[2].value : null;

    // Combine all vision data
    const combinedVision = {
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
    };

    // Stage 2: Initial AI Interpretation
    console.log('🧠 Stage 2: Generating initial AI interpretation...');
    const initialInsights = await generateInitialInterpretation(combinedVision);

    // Stage 3: Targeted Recall - Based on initial interpretation
    console.log('🎯 Stage 3: Performing targeted recall based on AI insights...');
    const recallData = await performTargetedRecall(combinedVision, initialInsights);

    // Stage 4: Final Synthesis
    console.log('🎨 Stage 4: Generating final educational synthesis...');
    const finalAnalysis = await generateFinalSynthesis(combinedVision, initialInsights, recallData);

    console.log('✅ Educational analysis complete!');

    res.json({
      success: true,
      analysis: finalAnalysis,
      visionData: { clarifai, google, microsoft, combined: combinedVision },
      stages: [
        { 
          stage: 'vision', 
          description: 'Comprehensive visual analysis completed', 
          apisUsed: ['Clarifai', 'Google Vision', 'Microsoft Vision'],
          insights: combinedVision.labels.slice(0, 5),
          timestamp: new Date()
        },
        { 
          stage: 'interpretation', 
          description: 'Initial AI interpretation completed', 
          apisUsed: ['OpenAI'],
          insights: initialInsights.styleInsights?.slice(0, 3) || [],
          timestamp: new Date()
        },
        { 
          stage: 'recall', 
          description: 'Targeted recall operations completed', 
          apisUsed: ['Wikipedia', 'Met Museum', 'Harvard', 'Art Institute'],
          insights: Object.keys(recallData).filter(key => recallData[key] !== null),
          timestamp: new Date()
        },
        { 
          stage: 'synthesis', 
          description: 'Final educational synthesis completed', 
          apisUsed: ['OpenAI'],
          insights: ['Comprehensive analysis generated'],
          timestamp: new Date()
        }
      ]
    });

  } catch (error) {
    console.error("Educational analysis error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Educational analysis failed", 
      details: error.message 
    });
  }
});

// -------- ENHANCED EDUCATIONAL ANALYSIS WITH ALL APIs --------
app.post("/api/analyze-comprehensive", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data required" });
    }

    console.log('🎨 Starting comprehensive educational artwork analysis with all APIs...');

    // Stage 1: Vision Analysis - Run all vision APIs in parallel
    console.log('🔍 Stage 1: Performing comprehensive visual analysis...');
    const visionResults = await Promise.allSettled([
      analyzeWithClarifai(imageBase64),
      analyzeWithGoogleVision(imageBase64),
      analyzeWithMicrosoftVision(imageBase64)
    ]);

    const clarifai = visionResults[0].status === 'fulfilled' ? visionResults[0].value : null;
    const google = visionResults[1].status === 'fulfilled' ? visionResults[1].value : null;
    const microsoft = visionResults[2].status === 'fulfilled' ? visionResults[2].value : null;

    // Combine all vision data
    const combinedVision = {
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
    };

    // Stage 2: Initial AI Interpretation
    console.log('🧠 Stage 2: Generating initial AI interpretation...');
    const initialInsights = await generateInitialInterpretation(combinedVision);

    // Stage 3: Comprehensive Targeted Recall - Based on initial interpretation
    console.log('🎯 Stage 3: Performing comprehensive targeted recall...');
    const recallData = await performComprehensiveRecall(combinedVision, initialInsights);

    // Stage 4: Final Synthesis with all data
    console.log('🎨 Stage 4: Generating final educational synthesis...');
    const finalAnalysis = await generateFinalSynthesis(combinedVision, initialInsights, recallData);

    console.log('✅ Comprehensive educational analysis complete!');

    res.json({
      success: true,
      analysis: finalAnalysis,
      visionData: { clarifai, google, microsoft, combined: combinedVision },
      recallData: recallData,
      stages: [
        { 
          stage: 'vision', 
          description: 'Comprehensive visual analysis completed', 
          apisUsed: ['Clarifai', 'Google Vision', 'Microsoft Vision'],
          insights: combinedVision.labels.slice(0, 5),
          timestamp: new Date()
        },
        { 
          stage: 'interpretation', 
          description: 'Initial AI interpretation completed', 
          apisUsed: ['OpenAI'],
          insights: initialInsights.styleInsights?.slice(0, 3) || [],
          timestamp: new Date()
        },
        { 
          stage: 'recall', 
          description: 'Comprehensive targeted recall completed', 
          apisUsed: ['Wikipedia', 'Met Museum', 'Harvard', 'Art Institute', 'Art Search', 'Color Analysis'],
          insights: Object.keys(recallData).filter(key => recallData[key] !== null),
          timestamp: new Date()
        },
        { 
          stage: 'synthesis', 
          description: 'Final educational synthesis completed', 
          apisUsed: ['OpenAI'],
          insights: ['Comprehensive analysis generated'],
          timestamp: new Date()
        }
      ]
    });

  } catch (error) {
    console.error("Comprehensive educational analysis error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Comprehensive educational analysis failed", 
      details: error.message 
    });
  }
});

// Helper functions for educational analysis
async function analyzeWithClarifai(imageBase64) {
  if (!process.env.VITE_CLARIFAI_API_KEY) {
    throw new Error('Clarifai API key not configured');
  }

  const base64Content = imageBase64.includes(',') 
    ? imageBase64.split(',')[1] 
    : imageBase64;

  const response = await fetch(`https://api.clarifai.com/v2/models/general-image-recognition/outputs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${process.env.VITE_CLARIFAI_API_KEY}`
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

async function analyzeWithGoogleVision(imageBase64) {
  if (!process.env.VITE_GOOGLE_VISION_API_KEY) {
    throw new Error('Google Vision API key not configured');
  }

  const base64Content = imageBase64.includes(',') 
    ? imageBase64.split(',')[1] 
    : imageBase64;

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.VITE_GOOGLE_VISION_API_KEY}`,
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

async function analyzeWithMicrosoftVision(imageBase64) {
  if (!process.env.VITE_MICROSOFT_VISION_API_KEY || !process.env.VITE_MICROSOFT_VISION_ENDPOINT) {
    throw new Error('Microsoft Vision API not configured');
  }

  const base64Content = imageBase64.includes(',') 
    ? imageBase64.split(',')[1] 
    : imageBase64;

  const response = await fetch(
    `${process.env.VITE_MICROSOFT_VISION_ENDPOINT}vision/v3.2/analyze?visualFeatures=Categories,Description,Objects,Color,Adult,Tags`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.VITE_MICROSOFT_VISION_API_KEY,
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

async function generateInitialInterpretation(visionData) {
  if (!process.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `Analyze this artwork for educational purposes. Focus on style, technique, theme, and medium rather than identification.

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
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
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

async function performTargetedRecall(visionData, initialInsights) {
  console.log('🎯 Performing targeted recall based on AI insights...');
  
  const recallData = {
    textureAnalysis: null,
    colorAnalysis: null,
    historicalContext: null,
    comparativeExamples: null,
    wikipediaData: null,
    metMuseumData: null,
    harvardData: null,
    artInstituteData: null
  };

  const recallPromises = [];

  // Extract search terms from vision data and insights
  const searchTerms = extractSearchTerms(visionData.labels, initialInsights);

  // Always perform color analysis
  recallPromises.push(
    performColorAnalysis(visionData.colors).then(result => {
      recallData.colorAnalysis = result;
    }).catch(err => console.warn('Color analysis failed:', err))
  );

  // Wikipedia search for historical context
  if (searchTerms.length > 0) {
    recallPromises.push(
      searchWikipedia(searchTerms[0]).then(result => {
        recallData.wikipediaData = result;
      }).catch(err => console.warn('Wikipedia search failed:', err))
    );
  }

  // Met Museum search for comparative examples
  if (searchTerms.length > 0) {
    recallPromises.push(
      searchMetMuseum(searchTerms[0]).then(result => {
        recallData.metMuseumData = result;
      }).catch(err => console.warn('Met Museum search failed:', err))
    );
  }

  // Harvard Art Museums search
  if (process.env.VITE_HARVARD_ART_MUSEUMS_API_KEY && searchTerms.length > 0) {
    recallPromises.push(
      searchHarvardArtwork(searchTerms[0]).then(result => {
        recallData.harvardData = result;
      }).catch(err => console.warn('Harvard search failed:', err))
    );
  }

  // Art Institute search
  if (searchTerms.length > 0) {
    recallPromises.push(
      searchArtInstitute(searchTerms[0]).then(result => {
        recallData.artInstituteData = result;
      }).catch(err => console.warn('Art Institute search failed:', err))
    );
  }

  // Wait for all recall operations to complete
  await Promise.allSettled(recallPromises);

  return recallData;
}

// Comprehensive recall function that incorporates ALL APIs
async function performComprehensiveRecall(visionData, initialInsights) {
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

  // Extract comprehensive search terms from vision data and insights
  const searchTerms = extractComprehensiveSearchTerms(visionData.labels, initialInsights);
  console.log('🔍 Search terms extracted:', searchTerms);

  // 1. ALWAYS perform color analysis (fundamental for art education)
  recallPromises.push(
    performColorAnalysis(visionData.colors).then(result => {
      recallData.colorAnalysis = result;
      console.log('✅ Color analysis completed');
    }).catch(err => console.warn('Color analysis failed:', err))
  );

  // 2. Wikipedia search for historical context (always valuable for education)
  if (searchTerms.length > 0) {
    recallPromises.push(
      searchWikipedia(searchTerms[0]).then(result => {
        recallData.wikipediaData = result;
        if (result) console.log('✅ Wikipedia data found:', result.title);
      }).catch(err => console.warn('Wikipedia search failed:', err))
    );
  }

  // 3. Met Museum search for comparative examples (free, always available)
  if (searchTerms.length > 0) {
    recallPromises.push(
      searchMetMuseum(searchTerms[0]).then(result => {
        recallData.metMuseumData = result;
        if (result) console.log('✅ Met Museum data found:', result.title);
      }).catch(err => console.warn('Met Museum search failed:', err))
    );
  }

  // 4. Harvard Art Museums search (if API key available)
  if (process.env.VITE_HARVARD_ART_MUSEUMS_API_KEY && searchTerms.length > 0) {
    recallPromises.push(
      searchHarvardArtwork(searchTerms[0]).then(result => {
        recallData.harvardData = result;
        if (result && result.length > 0) console.log('✅ Harvard data found:', result.length, 'artworks');
      }).catch(err => console.warn('Harvard search failed:', err))
    );
  }

  // 5. Art Institute search (free, always available)
  if (searchTerms.length > 0) {
    recallPromises.push(
      searchArtInstitute(searchTerms[0]).then(result => {
        recallData.artInstituteData = result;
        if (result && result.length > 0) console.log('✅ Art Institute data found:', result.length, 'artworks');
      }).catch(err => console.warn('Art Institute search failed:', err))
    );
  }

  // 6. Art Search API (if available)
  if (process.env.VITE_ARTSEARCH_API_KEY && searchTerms.length > 0) {
    recallPromises.push(
      searchArtSearch(searchTerms[0]).then(result => {
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
      performTextureAnalysis(visionData).then(result => {
        recallData.textureAnalysis = result;
        console.log('✅ Texture analysis completed');
      }).catch(err => console.warn('Texture analysis failed:', err))
    );
  }

  // 8. Emotional analysis based on color and composition
  recallPromises.push(
    performEmotionalAnalysis(visionData, initialInsights).then(result => {
      recallData.emotionalAnalysis = result;
      console.log('✅ Emotional analysis completed');
    }).catch(err => console.warn('Emotional analysis failed:', err))
  );

  // 9. Generate learning resources and discussion prompts
  recallPromises.push(
    generateLearningResources(visionData, initialInsights).then(result => {
      recallData.learningResources = result;
      console.log('✅ Learning resources generated');
    }).catch(err => console.warn('Learning resources generation failed:', err))
  );

  // 10. Find similar artworks for comparison
  if (searchTerms.length > 0) {
    recallPromises.push(
      findSimilarArtworks(searchTerms).then(result => {
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

// Helper function to extract search terms
function extractSearchTerms(labels, insights) {
  const terms = [...labels];
  
  // Add terms from insights
  if (insights.styleInsights) {
    terms.push(...insights.styleInsights.slice(0, 2));
  }
  if (insights.themeInsights) {
    terms.push(...insights.themeInsights.slice(0, 2));
  }
  
  // Clean and deduplicate
  return [...new Set(terms)]
    .map(term => term.replace(/[^a-zA-Z0-9\s-]/g, ' ').trim())
    .filter(term => term.length > 2)
    .slice(0, 3);
}

// Enhanced search term extraction for comprehensive recall
function extractComprehensiveSearchTerms(labels, insights) {
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
    .slice(0, 5); // More search terms for comprehensive recall
}

// Color analysis function
async function performColorAnalysis(colors) {
  if (!colors || colors.length === 0) {
    return {
      dominantColors: [],
      colorHarmony: 'No color data available',
      emotionalImpact: 'Unable to analyze color mood',
      colorTheory: ['Color analysis not available']
    };
  }

  return {
    dominantColors: colors.slice(0, 6).map((color, index) => ({
      hex: rgbToHex(color),
      name: getColorName(color),
      percentage: Math.max(20 - (index * 3), 5),
      emotionalAssociation: getEmotionalAssociation(color),
      symbolicMeaning: getSymbolicMeaning(color),
      educationalNote: getEducationalNote(color)
    })),
    colorHarmony: analyzeColorHarmony(colors),
    emotionalImpact: analyzeEmotionalImpact(colors),
    colorTheory: generateColorTheoryInsights(colors)
  };
}

// Wikipedia search function
async function searchWikipedia(query) {
  try {
    const cleanQuery = query.replace(/[^a-zA-Z0-9\s-]/g, ' ').trim();
    const targetUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
    const proxyUrl = `/proxy/allorigins/raw?url=${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      title: data.title,
      extract: data.extract,
      description: data.description,
      url: data.content_urls?.desktop?.page || ''
    };
  } catch (error) {
    return null;
  }
}

// Met Museum search function
async function searchMetMuseum(query) {
  try {
    const response = await fetch(`/proxy/met/public/collection/v1/search?q=${encodeURIComponent(query)}&hasImages=true&isOnView=true`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.objectIDs || data.objectIDs.length === 0) return null;
    
    // Get details for first result
    const detailResponse = await fetch(`/proxy/met/public/collection/v1/objects/${data.objectIDs[0]}`);
    if (!detailResponse.ok) return null;
    
    return await detailResponse.json();
  } catch (error) {
    return null;
  }
}

// Harvard Art Museums search function
async function searchHarvardArtwork(query) {
  if (!process.env.VITE_HARVARD_ART_MUSEUMS_API_KEY) return null;
  
  try {
    const response = await fetch(
      `/proxy/harvard/object?q=${encodeURIComponent(query)}&size=3&hasimage=1&fields=title,people,dated,culture,period,medium,classification,technique,description`
    );
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    return null;
  }
}

// Art Institute search function
async function searchArtInstitute(query) {
  try {
    const response = await fetch(
      `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&limit=3&fields=id,title,artist_display,date_display,style_titles,medium_display,description,image_id`
    );
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    return null;
  }
}

// Color analysis helper functions
function rgbToHex(rgb) {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return '#000000';
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function getColorName(rgb) {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return 'Unknown';
  
  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  
  const hsl = rgbToHsl(r, g, b);
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

function rgbToHsl(r, g, b) {
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

function getEmotionalAssociation(color) {
  const colorName = getColorName(color);
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

function getSymbolicMeaning(color) {
  const colorName = getColorName(color);
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

function getEducationalNote(color) {
  const colorName = getColorName(color);
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

function analyzeColorHarmony(colors) {
  if (colors.length < 2) return 'Monochromatic harmony';
  
  const hues = colors.map(color => {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return 0;
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return rgbToHsl(r, g, b).h;
  });
  
  const hueRange = Math.max(...hues) - Math.min(...hues);
  
  if (hueRange < 30) return 'Monochromatic harmony - creates unity and cohesion';
  if (hueRange < 60) return 'Analogous harmony - colors work together harmoniously';
  if (hueRange > 120 && hueRange < 180) return 'Complementary harmony - creates dynamic contrast';
  return 'Complex color relationship - multiple harmonies working together';
}

function analyzeEmotionalImpact(colors) {
  const warmColors = colors.filter(color => {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return false;
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const hsl = rgbToHsl(r, g, b);
    return hsl.h >= 0 && hsl.h <= 60 || hsl.h >= 300;
  });
  
  if (warmColors.length > colors.length / 2) {
    return 'Warm color palette creates energy, passion, and vitality';
  } else {
    return 'Cool color palette creates calm, peaceful, and serene feelings';
  }
}

function generateColorTheoryInsights(colors) {
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
    const hsl = rgbToHsl(r, g, b);
    return hsl.h >= 0 && hsl.h <= 60 || hsl.h >= 300;
  });
  
  const hasCoolColors = colors.some(color => {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return false;
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    const hsl = rgbToHsl(r, g, b);
    return hsl.h > 60 && hsl.h < 300;
  });
  
  if (hasWarmColors && hasCoolColors) {
    insights.push('Strategic use of warm and cool colors creates visual tension and depth');
  }
  
  return insights;
}

// Additional helper functions for comprehensive recall

// Art Search API function
async function searchArtSearch(query) {
  if (!process.env.VITE_ARTSEARCH_API_KEY) {
    return null;
  }
  
  try {
    const response = await fetch(`/proxy/artsearch/v1/search?query=${encodeURIComponent(query)}&limit=5`, {
      headers: {
        'X-API-KEY': process.env.VITE_ARTSEARCH_API_KEY
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.items || data.results || data.data || [];
  } catch (error) {
    return null;
  }
}

// Texture analysis function
async function performTextureAnalysis(visionData) {
  // This would typically use a specialized texture analysis API
  // For now, we'll create educational content based on visual cues
  return {
    textureTypes: ['Visible brushstrokes', 'Surface variation', 'Material texture'],
    techniqueNotes: ['Impasto technique evident', 'Varied brushwork creates surface interest'],
    educationalValue: ['Teaches about material properties', 'Shows how texture affects visual impact']
  };
}

// Emotional analysis function
async function performEmotionalAnalysis(visionData, initialInsights) {
  const emotionalCues = [];
  
  // Analyze color mood
  if (visionData.colors && visionData.colors.length > 0) {
    const warmColors = visionData.colors.filter(color => {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return false;
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const hsl = rgbToHsl(r, g, b);
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

// Learning resources generation
async function generateLearningResources(visionData, initialInsights) {
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

// Find similar artworks function
async function findSimilarArtworks(searchTerms) {
  const similarArtworks = [];
  
  // Search multiple sources for similar artworks
  const searchPromises = searchTerms.slice(0, 2).map(async (term) => {
    try {
      const [metResults, artInstituteResults] = await Promise.allSettled([
        searchMetMuseum(term),
        searchArtInstitute(term)
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

async function generateFinalSynthesis(visionData, initialInsights, recallData) {
  if (!process.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const synthesisPrompt = `Create a comprehensive educational analysis that teaches students how to look at and understand art.

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
  },
  "confidence": 0.85,
  "sources": ["Google Vision", "OpenAI", "Wikipedia"],
  "analysisStages": []
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
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

// -------- START SERVER --------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Educational Art Analysis server running on http://localhost:${PORT}`);
  console.log(`📚 Educational API endpoint: http://localhost:${PORT}/api/analyze-educational`);
});


