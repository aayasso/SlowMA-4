// Enhanced Educational Workflow Service with Optimized API Integration
import { optimizedApiClient, ApiResponse } from './optimizedApiClient'
import { responseProcessor, EducationalAnalysisResult, VisionAnalysisResult, MuseumData, WikipediaData } from './responseProcessor'
import { monitoringService } from './monitoringService'

export interface EnhancedEducationalAnalysis {
  // Core analysis data
  visionAnalysis: VisionAnalysisResult
  educationalAnalysis: EducationalAnalysisResult
  
  // Enriched data from external sources
  museumData: MuseumData[]
  wikipediaData: WikipediaData | null
  
  // Analysis metadata
  analysisId: string
  timestamp: number
  processingTime: number
  confidence: number
  sources: string[]
  
  // Performance metrics
  apiMetrics: {
    totalApiCalls: number
    successfulCalls: number
    failedCalls: number
    cacheHits: number
    averageLatency: number
  }
  
  // Quality indicators
  qualityIndicators: {
    dataCompleteness: number
    sourceDiversity: number
    educationalValue: number
    reliability: number
  }
}

export interface WorkflowConfig {
  enableCaching: boolean
  enableCircuitBreaker: boolean
  enableRateLimiting: boolean
  maxRetries: number
  timeoutMs: number
  parallelProcessing: boolean
  qualityThreshold: number
}

export class EnhancedEducationalWorkflow {
  private config: WorkflowConfig
  private analysisHistory = new Map<string, EnhancedEducationalAnalysis>()

  constructor(config: Partial<WorkflowConfig> = {}) {
    this.config = {
      enableCaching: true,
      enableCircuitBreaker: true,
      enableRateLimiting: true,
      maxRetries: 3,
      timeoutMs: 30000,
      parallelProcessing: true,
      qualityThreshold: 0.7,
      ...config
    }

    this.initializeHealthChecks()
  }

  private initializeHealthChecks(): void {
    // Register health checks for all APIs
    const apis = ['google-vision', 'microsoft-vision', 'clarifai', 'openai', 'wikipedia', 'met-museum', 'art-institute', 'harvard']
    
    apis.forEach(apiName => {
      monitoringService.registerHealthCheck(apiName, async () => {
        try {
          const start = Date.now()
          
          // Simple health check based on API type
          switch (apiName) {
            case 'google-vision':
            case 'microsoft-vision':
            case 'clarifai':
              // Test with a minimal image
              const testResult = await optimizedApiClient[`analyzeWith${apiName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`]('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
              return { healthy: testResult.success, latency: Date.now() - start }
              
            case 'openai':
              const openaiResult = await optimizedApiClient.generateAnalysis({ labels: ['test'] }, 'test')
              return { healthy: openaiResult.success, latency: Date.now() - start }
              
            case 'wikipedia':
              const wikiResult = await optimizedApiClient.searchWikipedia('art')
              return { healthy: wikiResult.success, latency: Date.now() - start }
              
            case 'met-museum':
              const metResult = await optimizedApiClient.searchMetMuseum('art')
              return { healthy: metResult.success, latency: Date.now() - start }
              
            case 'art-institute':
              const aicResult = await optimizedApiClient.searchArtInstitute('art')
              return { healthy: aicResult.success, latency: Date.now() - start }
              
            case 'harvard':
              const harvardResult = await optimizedApiClient.searchHarvard('art')
              return { healthy: harvardResult.success, latency: Date.now() - start }
              
            default:
              return { healthy: false, error: 'Unknown API' }
          }
        } catch (error) {
          return { healthy: false, error: error.message }
        }
      })
    })
  }

  async analyzeArtworkComprehensively(imageBase64: string): Promise<EnhancedEducationalAnalysis> {
    const analysisId = this.generateAnalysisId()
    const startTime = Date.now()
    
    monitoringService.logEvent({
      type: 'api_call',
      source: 'enhanced-workflow',
      data: { analysisId, action: 'start_analysis' },
      severity: 'low'
    })

    try {
      // Stage 1: Vision Analysis (Parallel)
      const visionResults = await this.performVisionAnalysis(imageBase64, analysisId)
      
      // Stage 2: Educational Analysis
      const educationalAnalysis = await this.generateEducationalAnalysis(visionResults, analysisId)
      
      // Stage 3: Enrichment (Parallel)
      const [museumData, wikipediaData] = await this.performEnrichment(visionResults, educationalAnalysis, analysisId)
      
      // Stage 4: Synthesis and Quality Assessment
      const finalAnalysis = await this.synthesizeAnalysis(
        visionResults,
        educationalAnalysis,
        museumData,
        wikipediaData,
        analysisId,
        startTime
      )

      // Store in history
      this.analysisHistory.set(analysisId, finalAnalysis)

      // Log completion
      monitoringService.logEvent({
        type: 'api_call',
        source: 'enhanced-workflow',
        data: { 
          analysisId, 
          action: 'complete_analysis',
          processingTime: finalAnalysis.processingTime,
          confidence: finalAnalysis.confidence
        },
        severity: 'low'
      })

      return finalAnalysis

    } catch (error) {
      monitoringService.logError(`Analysis failed for ${analysisId}`, error as Error, { imageBase64: imageBase64.substring(0, 100) })
      
      // Return fallback analysis
      return this.createFallbackAnalysis(analysisId, startTime, error as Error)
    }
  }

  private async performVisionAnalysis(imageBase64: string, analysisId: string): Promise<VisionAnalysisResult> {
    const startTime = Date.now()
    const visionPromises: Promise<ApiResponse<any>>[] = []

    // Add available vision APIs
    visionPromises.push(optimizedApiClient.analyzeWithGoogleVision(imageBase64))
    visionPromises.push(optimizedApiClient.analyzeWithMicrosoftVision(imageBase64))
    visionPromises.push(optimizedApiClient.analyzeWithClarifai(imageBase64))

    try {
      const results = await Promise.allSettled(visionPromises)
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<ApiResponse<any>> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value)

      if (successfulResults.length === 0) {
        throw new Error('All vision APIs failed')
      }

      // Log performance
      successfulResults.forEach(result => {
        monitoringService.logApiCall(result.source, result, Date.now() - startTime)
      })

      return responseProcessor.processVisionAnalysis(successfulResults)

    } catch (error) {
      monitoringService.logError('Vision analysis failed', error as Error, { analysisId })
      throw error
    }
  }

  private async generateEducationalAnalysis(visionData: VisionAnalysisResult, analysisId: string): Promise<EducationalAnalysisResult> {
    const startTime = Date.now()

    try {
      // Create context for OpenAI analysis
      const context = this.createAnalysisContext(visionData)
      
      const response = await optimizedApiClient.generateAnalysis(visionData, context)
      
      if (!response.success) {
        throw new Error(`OpenAI analysis failed: ${response.error}`)
      }

      monitoringService.logApiCall('openai', response, Date.now() - startTime)

      return responseProcessor.processEducationalAnalysis(response)

    } catch (error) {
      monitoringService.logError('Educational analysis failed', error as Error, { analysisId })
      throw error
    }
  }

  private async performEnrichment(
    visionData: VisionAnalysisResult, 
    educationalAnalysis: EducationalAnalysisResult,
    analysisId: string
  ): Promise<[MuseumData[], WikipediaData | null]> {
    const startTime = Date.now()
    const enrichmentPromises: Promise<any>[] = []

    // Extract search terms
    const searchTerms = this.extractSearchTerms(visionData, educationalAnalysis)
    
    if (searchTerms.length > 0) {
      const primaryTerm = searchTerms[0]

      // Museum data searches (parallel)
      enrichmentPromises.push(
        optimizedApiClient.searchMetMuseum(primaryTerm),
        optimizedApiClient.searchArtInstitute(primaryTerm),
        optimizedApiClient.searchHarvard(primaryTerm)
      )

      // Wikipedia search
      enrichmentPromises.push(
        optimizedApiClient.searchWikipedia(primaryTerm)
      )
    }

    try {
      const results = await Promise.allSettled(enrichmentPromises)
      
      // Process museum data
      const museumResults = results.slice(0, 3)
        .filter((result): result is PromiseFulfilledResult<ApiResponse<any>> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value)

      const museumData = responseProcessor.processMuseumData(museumResults)

      // Process Wikipedia data
      const wikipediaResult = results[3]
      const wikipediaData = (wikipediaResult.status === 'fulfilled' && wikipediaResult.value.success)
        ? responseProcessor.processWikipediaData(wikipediaResult.value)
        : null

      // Log performance
      [...museumResults, ...(wikipediaData ? [wikipediaResult.value] : [])].forEach(result => {
        if (result) {
          monitoringService.logApiCall(result.source, result, Date.now() - startTime)
        }
      })

      return [museumData, wikipediaData]

    } catch (error) {
      monitoringService.logError('Enrichment failed', error as Error, { analysisId })
      return [[], null]
    }
  }

  private async synthesizeAnalysis(
    visionData: VisionAnalysisResult,
    educationalAnalysis: EducationalAnalysisResult,
    museumData: MuseumData[],
    wikipediaData: WikipediaData | null,
    analysisId: string,
    startTime: number
  ): Promise<EnhancedEducationalAnalysis> {
    const processingTime = Date.now() - startTime
    const metrics = monitoringService.getPerformanceMetrics()
    
    // Calculate quality indicators
    const qualityIndicators = this.calculateQualityIndicators(
      visionData,
      educationalAnalysis,
      museumData,
      wikipediaData
    )

    // Calculate confidence based on multiple factors
    const confidence = this.calculateConfidence(
      visionData,
      educationalAnalysis,
      museumData,
      wikipediaData,
      qualityIndicators
    )

    // Collect all sources
    const sources = [
      visionData.source,
      'OpenAI',
      ...museumData.map(m => m.source),
      ...(wikipediaData ? ['Wikipedia'] : [])
    ].filter((source, index, arr) => arr.indexOf(source) === index) // Remove duplicates

    // Calculate API metrics
    const apiMetrics = this.calculateApiMetrics(metrics)

    return {
      visionAnalysis: visionData,
      educationalAnalysis,
      museumData,
      wikipediaData,
      analysisId,
      timestamp: Date.now(),
      processingTime,
      confidence,
      sources,
      apiMetrics,
      qualityIndicators
    }
  }

  private createAnalysisContext(visionData: VisionAnalysisResult): string {
    const context = [
      `Labels: ${visionData.labels.join(', ')}`,
      `Objects: ${visionData.objects.join(', ')}`,
      `Colors: ${visionData.colors.join(', ')}`,
      `Text: ${visionData.text.join(', ')}`,
      `Faces: ${visionData.faces}`
    ].filter(part => part.includes(':') && part.split(':')[1].trim().length > 0)

    return context.join('\n')
  }

  private extractSearchTerms(visionData: VisionAnalysisResult, educationalAnalysis: EducationalAnalysisResult): string[] {
    const terms = new Set<string>()

    // Add from vision data
    visionData.labels.forEach(label => {
      if (label.length > 2 && !this.isGenericTerm(label)) {
        terms.add(label.toLowerCase())
      }
    })

    visionData.objects.forEach(obj => {
      if (obj.length > 2 && !this.isGenericTerm(obj)) {
        terms.add(obj.toLowerCase())
      }
    })

    // Add from educational analysis
    educationalAnalysis.styleAnalysis.primaryStyle.split(' ').forEach(word => {
      if (word.length > 2) terms.add(word.toLowerCase())
    })

    educationalAnalysis.themeAnalysis.primaryThemes.forEach(theme => {
      theme.split(' ').forEach(word => {
        if (word.length > 2) terms.add(word.toLowerCase())
      })
    })

    return Array.from(terms).slice(0, 3) // Limit to top 3 terms
  }

  private isGenericTerm(term: string): boolean {
    const genericTerms = ['art', 'image', 'picture', 'photo', 'artwork', 'visual', 'color', 'object', 'thing']
    return genericTerms.includes(term.toLowerCase())
  }

  private calculateQualityIndicators(
    visionData: VisionAnalysisResult,
    educationalAnalysis: EducationalAnalysisResult,
    museumData: MuseumData[],
    wikipediaData: WikipediaData | null
  ): EnhancedEducationalAnalysis['qualityIndicators'] {
    // Data completeness (0-1)
    const dataCompleteness = this.calculateDataCompleteness(
      visionData,
      educationalAnalysis,
      museumData,
      wikipediaData
    )

    // Source diversity (0-1)
    const sourceDiversity = this.calculateSourceDiversity(visionData, museumData, wikipediaData)

    // Educational value (0-1)
    const educationalValue = this.calculateEducationalValue(educationalAnalysis)

    // Reliability (0-1)
    const reliability = this.calculateReliability(visionData, educationalAnalysis, museumData)

    return {
      dataCompleteness,
      sourceDiversity,
      educationalValue,
      reliability
    }
  }

  private calculateDataCompleteness(
    visionData: VisionAnalysisResult,
    educationalAnalysis: EducationalAnalysisResult,
    museumData: MuseumData[],
    wikipediaData: WikipediaData | null
  ): number {
    let score = 0
    let maxScore = 0

    // Vision data (30%)
    maxScore += 30
    if (visionData.labels.length > 0) score += 10
    if (visionData.objects.length > 0) score += 10
    if (visionData.colors.length > 0) score += 10

    // Educational analysis (40%)
    maxScore += 40
    if (educationalAnalysis.styleAnalysis.primaryStyle !== 'Unknown Style') score += 10
    if (educationalAnalysis.techniqueAnalysis.primaryTechniques.length > 0) score += 10
    if (educationalAnalysis.themeAnalysis.primaryThemes.length > 0) score += 10
    if (educationalAnalysis.reflectionQuestions.length > 0) score += 10

    // External data (30%)
    maxScore += 30
    if (museumData.length > 0) score += 15
    if (wikipediaData) score += 15

    return maxScore > 0 ? score / maxScore : 0
  }

  private calculateSourceDiversity(visionData: VisionAnalysisResult, museumData: MuseumData[], wikipediaData: WikipediaData | null): number {
    const sources = new Set([
      visionData.source,
      ...museumData.map(m => m.source),
      ...(wikipediaData ? ['Wikipedia'] : [])
    ])

    // More sources = higher diversity, capped at 1.0
    return Math.min(sources.size / 5, 1.0)
  }

  private calculateEducationalValue(educationalAnalysis: EducationalAnalysisResult): number {
    let score = 0
    let maxScore = 0

    // Reflection questions (25%)
    maxScore += 25
    score += Math.min(educationalAnalysis.reflectionQuestions.length * 5, 25)

    // Learning objectives (25%)
    maxScore += 25
    score += Math.min(educationalAnalysis.learningObjectives.length * 8, 25)

    // Detailed analysis sections (50%)
    maxScore += 50
    if (educationalAnalysis.styleAnalysis.educationalInsights.length > 0) score += 12.5
    if (educationalAnalysis.techniqueAnalysis.educationalValue.length > 0) score += 12.5
    if (educationalAnalysis.colorAnalysis.educationalInsights.length > 0) score += 12.5
    if (educationalAnalysis.compositionAnalysis.educationalApplications.length > 0) score += 12.5

    return maxScore > 0 ? score / maxScore : 0
  }

  private calculateReliability(visionData: VisionAnalysisResult, educationalAnalysis: EducationalAnalysisResult, museumData: MuseumData[]): number {
    let score = 0
    let maxScore = 0

    // Vision data confidence (40%)
    maxScore += 40
    score += (visionData.confidence || 0.8) * 40

    // Educational analysis confidence (40%)
    maxScore += 40
    score += educationalAnalysis.confidence * 40

    // Museum data presence (20%)
    maxScore += 20
    if (museumData.length > 0) score += 20

    return maxScore > 0 ? score / maxScore : 0
  }

  private calculateConfidence(
    visionData: VisionAnalysisResult,
    educationalAnalysis: EducationalAnalysisResult,
    museumData: MuseumData[],
    wikipediaData: WikipediaData | null,
    qualityIndicators: EnhancedEducationalAnalysis['qualityIndicators']
  ): number {
    const weights = {
      visionConfidence: 0.3,
      educationalConfidence: 0.3,
      dataCompleteness: 0.2,
      sourceDiversity: 0.1,
      reliability: 0.1
    }

    const confidence = (
      (visionData.confidence || 0.8) * weights.visionConfidence +
      educationalAnalysis.confidence * weights.educationalConfidence +
      qualityIndicators.dataCompleteness * weights.dataCompleteness +
      qualityIndicators.sourceDiversity * weights.sourceDiversity +
      qualityIndicators.reliability * weights.reliability
    )

    return Math.min(Math.max(confidence, 0), 1)
  }

  private calculateApiMetrics(metrics: any): EnhancedEducationalAnalysis['apiMetrics'] {
    const allMetrics = typeof metrics === 'object' ? Object.values(metrics) : []
    
    const totals = allMetrics.reduce(
      (acc: any, metric: any) => ({
        totalCalls: acc.totalCalls + (metric.totalCalls || 0),
        successfulCalls: acc.successfulCalls + (metric.successfulCalls || 0),
        failedCalls: acc.failedCalls + (metric.failedCalls || 0),
        totalLatency: acc.totalLatency + (metric.averageLatency * (metric.totalCalls || 0) || 0)
      }),
      { totalCalls: 0, successfulCalls: 0, failedCalls: 0, totalLatency: 0 }
    )

    const cacheMetrics = monitoringService.getCacheMetrics()
    const cacheTotals = Object.values(cacheMetrics).reduce(
      (acc: any, metric: any) => ({
        hits: acc.hits + (metric.cacheHits || 0)
      }),
      { hits: 0 }
    )

    return {
      totalApiCalls: totals.totalCalls,
      successfulCalls: totals.successfulCalls,
      failedCalls: totals.failedCalls,
      cacheHits: cacheTotals.hits,
      averageLatency: totals.totalCalls > 0 ? totals.totalLatency / totals.totalCalls : 0
    }
  }

  private createFallbackAnalysis(analysisId: string, startTime: number, error: Error): EnhancedEducationalAnalysis {
    const processingTime = Date.now() - startTime

    return {
      visionAnalysis: {
        labels: ['Artwork'],
        objects: ['Visual elements'],
        text: [],
        colors: [],
        faces: 0,
        confidence: 0.3,
        source: 'Fallback',
        timestamp: Date.now()
      },
      educationalAnalysis: responseProcessor.handleProcessingError(error, { analysisId }),
      museumData: [],
      wikipediaData: null,
      analysisId,
      timestamp: Date.now(),
      processingTime,
      confidence: 0.2,
      sources: ['Fallback'],
      apiMetrics: {
        totalApiCalls: 0,
        successfulCalls: 0,
        failedCalls: 1,
        cacheHits: 0,
        averageLatency: processingTime
      },
      qualityIndicators: {
        dataCompleteness: 0.2,
        sourceDiversity: 0.1,
        educationalValue: 0.3,
        reliability: 0.1
      }
    }
  }

  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Public utility methods
  getAnalysisHistory(): Map<string, EnhancedEducationalAnalysis> {
    return new Map(this.analysisHistory)
  }

  getAnalysisById(analysisId: string): EnhancedEducationalAnalysis | undefined {
    return this.analysisHistory.get(analysisId)
  }

  clearAnalysisHistory(): void {
    this.analysisHistory.clear()
  }

  async getSystemHealth(): Promise<any> {
    return monitoringService.getSystemHealth()
  }

  getMetrics(): any {
    return {
      performance: monitoringService.getPerformanceMetrics(),
      cache: monitoringService.getCacheMetrics(),
      alerts: monitoringService.getAlerts(),
      analysisHistory: this.analysisHistory.size
    }
  }

  exportAnalysis(analysisId: string): string | null {
    const analysis = this.analysisHistory.get(analysisId)
    return analysis ? JSON.stringify(analysis, null, 2) : null
  }

  updateConfig(newConfig: Partial<WorkflowConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Export singleton instance
export const enhancedEducationalWorkflow = new EnhancedEducationalWorkflow()
