import { GOOGLE_VISION_KEY, MICROSOFT_VISION_KEY, MICROSOFT_VISION_ENDPOINT, OPENAI_API_KEY, HARVARD_ART_MUSEUMS_API_KEY, CLARIFAI_API_KEY } from './env'

type ImageAnalysisResult = {
  labels?: string[]
  objects?: string[]
  text?: string[]
  colors?: string[]
  faces?: number
}

type InitialInsights = {
  styleInsights: string[]
  techniqueInsights: string[]
  themeInsights: string[]
  mediumInsights: string[]
  reflectionQuestions: string[]
  learningObjectives: string[]
}

export type ComprehensiveEducationalAnalysis = any

function requireKeys(): { ok: boolean; missing: string[] } {
  const missing: string[] = []
  if (!OPENAI_API_KEY) missing.push('OPENAI_API_KEY')
  if (!(GOOGLE_VISION_KEY || (MICROSOFT_VISION_KEY && MICROSOFT_VISION_ENDPOINT) || CLARIFAI_API_KEY)) {
    if (!GOOGLE_VISION_KEY) missing.push('GOOGLE_VISION_KEY')
    if (!MICROSOFT_VISION_KEY) missing.push('MICROSOFT_VISION_KEY')
    if (!MICROSOFT_VISION_ENDPOINT) missing.push('MICROSOFT_VISION_ENDPOINT')
    if (!CLARIFAI_API_KEY) missing.push('CLARIFAI_API_KEY')
  }
  // Harvard optional
  return { ok: missing.length === 0, missing }
}

async function analyzeWithGoogleVision(imageBase64: string): Promise<ImageAnalysisResult | null> {
  if (!GOOGLE_VISION_KEY) return null
  const base64Content = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
  const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_KEY}`, {
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
  })
  if (!res.ok) return null
  const data = await res.json()
  const r = data.responses?.[0] || {}
  return {
    labels: r.labelAnnotations?.map((l: any) => l.description) || [],
    objects: r.localizedObjectAnnotations?.map((o: any) => o.name) || [],
    text: r.textAnnotations?.map((t: any) => t.description) || [],
    colors: r.imagePropertiesAnnotation?.dominantColors?.colors?.map((c: any) => `rgb(${c.color.red}, ${c.color.green}, ${c.color.blue})`) || [],
    faces: r.faceAnnotations?.length || 0
  }
}

async function analyzeWithMicrosoftVision(imageBase64: string): Promise<ImageAnalysisResult | null> {
  if (!MICROSOFT_VISION_KEY || !MICROSOFT_VISION_ENDPOINT) return null
  const base64Content = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
  const bytes = await convertBase64ToJpegBytes(imageBase64)
  const res = await fetch(`${MICROSOFT_VISION_ENDPOINT}vision/v3.2/analyze?visualFeatures=Categories,Description,Objects,Color,Adult,Tags`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': MICROSOFT_VISION_KEY, 'Content-Type': 'application/octet-stream' },
    body: bytes
  })
  if (!res.ok) return null
  const data = await res.json()
  return {
    labels: data.description?.tags || [],
    objects: data.objects?.map((o: any) => o.object) || [],
    text: data.description?.captions?.map((c: any) => c.text) || [],
    colors: data.color?.dominantColors || [],
    faces: 0
  }
}

async function analyzeWithClarifai(imageBase64: string): Promise<ImageAnalysisResult | null> {
  if (!CLARIFAI_API_KEY) return null
  const base64Content = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
  const modelIds = ['general-image-recognition', 'general-image-recognition@001']
  let last: Response | null = null
  for (const modelId of modelIds) {
    const res = await fetch(`https://api.clarifai.com/v2/models/${modelId}/outputs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${CLARIFAI_API_KEY}` },
      body: JSON.stringify({ inputs: [{ data: { image: { base64: base64Content } } }] })
    })
    if (res.ok) {
      const data = await res.json()
      const concepts = data.outputs?.[0]?.data?.concepts || []
      const labels = concepts.map((c: any) => c.name).filter(Boolean)
      return { labels, objects: labels.slice(0, 10), text: [], colors: [], faces: 0 }
    }
    last = res
  }
  return null
}

function combineVision(clarifai?: ImageAnalysisResult | null, google?: ImageAnalysisResult | null, microsoft?: ImageAnalysisResult | null) {
  const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)))
  return {
    labels: uniq([...(clarifai?.labels || []), ...(google?.labels || []), ...(microsoft?.labels || [])]),
    objects: uniq([...(google?.objects || []), ...(microsoft?.objects || [])]),
    colors: uniq([...(google?.colors || []), ...(microsoft?.colors || [])]),
    text: uniq([...(google?.text || []), ...(microsoft?.text || [])]),
    faces: (google?.faces || 0) + (microsoft?.faces || 0)
  }
}

async function generateInitialInsights(combined: any): Promise<InitialInsights> {
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY')
  const system = 'You are an expert art educator. Respond with VALID JSON only.'
  const user = `Analyze this artwork for education.\nLabels: ${combined.labels?.join(', ') || ''}\nObjects: ${combined.objects?.join(', ') || ''}\nColors: ${combined.colors?.join(', ') || ''}\nText: ${combined.text?.join(', ') || ''}\nJSON shape:{"styleInsights":[],"techniqueInsights":[],"themeInsights":[],"mediumInsights":[],"reflectionQuestions":[],"learningObjectives":[]}`
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.3, max_tokens: 1500 })
  })
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || '{}'
  return JSON.parse(content)
}

async function searchWikipedia(term: string) {
  const clean = term.replace(/[^a-zA-Z0-9\s-]/g, ' ').trim()
  if (!clean) return null
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  return { title: data.title, extract: data.extract, url: data.content_urls?.desktop?.page || '' }
}

async function searchMet(term: string) {
  const s = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(term)}&hasImages=true`)
  if (!s.ok) return null
  const ids = (await s.json()).objectIDs?.slice(0, 1) || []
  if (ids.length === 0) return null
  const d = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${ids[0]}`)
  if (!d.ok) return null
  return d.json()
}

async function searchAIC(term: string) {
  const res = await fetch(`https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(term)}&limit=2&fields=id,title,artist_display,date_display,style_titles,medium_display,description,image_id`)
  if (!res.ok) return []
  const data = await res.json()
  return data.data || []
}

async function searchHarvard(term: string) {
  if (!HARVARD_ART_MUSEUMS_API_KEY) return []
  const res = await fetch(`https://api.harvardartmuseums.org/object?apikey=${HARVARD_ART_MUSEUMS_API_KEY}&q=${encodeURIComponent(term)}&size=3&hasimage=1&fields=title,people,dated,culture,period,medium,classification,technique,description`)
  if (!res.ok) return []
  const data = await res.json()
  return data.records || []
}

export async function analyzeArtworkEducationally(imageBase64: string): Promise<{ analysis?: ComprehensiveEducationalAnalysis; missingKeys?: string[] }> {
  const check = requireKeys()
  if (!check.ok) return { missingKeys: check.missing }

  const [clarifai, google, microsoft] = await Promise.all([
    analyzeWithClarifai(imageBase64).catch(() => null),
    analyzeWithGoogleVision(imageBase64).catch(() => null),
    analyzeWithMicrosoftVision(imageBase64).catch(() => null)
  ])

  const combined = combineVision(clarifai, google, microsoft)
  const initial = await generateInitialInsights(combined)

  const terms = [...(combined.labels || []), ...(initial.styleInsights || []), ...(initial.themeInsights || [])].filter(Boolean)
  const primary = terms[0] || 'art'

  const [wiki, met, aic, harvard] = await Promise.all([
    searchWikipedia(primary).catch(() => null),
    searchMet(primary).catch(() => null),
    searchAIC(primary).catch(() => []),
    searchHarvard(primary).catch(() => [])
  ])

  const synthesisPrompt = {
    combined,
    initial,
    recall: { wiki, met, aic, harvard }
  }

  const analysis = await generateFinalSynthesis(synthesisPrompt)
  return { analysis }
}

async function generateFinalSynthesis(payload: any): Promise<ComprehensiveEducationalAnalysis> {
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY')
  const system = 'You are a master art educator. Respond with VALID JSON only.'
  const user = `Create comprehensive educational analysis.\n${JSON.stringify(payload).slice(0, 12000)}`
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.4, max_tokens: 2200 })
  })
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || '{}'
  try { return JSON.parse(content) } catch { return { error: 'Failed to parse AI output', raw: content } }
}

async function convertBase64ToJpegBytes(dataUrlOrBase64: string): Promise<Uint8Array> {
  try {
    const base64 = dataUrlOrBase64.includes(',') ? dataUrlOrBase64.split(',')[1] : dataUrlOrBase64
    const binary = global.atob ? global.atob(base64) : Buffer.from(base64, 'base64').toString('binary')
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return new Uint8Array()
  }
}


