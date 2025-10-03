// Workflow Monitoring and Analytics Service
// Provides real-time monitoring, performance tracking, and debugging tools

export interface WorkflowMetrics {
  totalDuration: number
  stageDurations: { [stage: string]: number }
  apiSuccessRates: { [api: string]: number }
  errorCount: number
  successCount: number
  averageConfidence: number
  dataQuality: {
    visionDataQuality: number
    recallDataQuality: number
    synthesisQuality: number
  }
}

export interface WorkflowEvent {
  timestamp: Date
  stage: string
  event: 'start' | 'complete' | 'error' | 'retry'
  details: any
  duration?: number
}

export interface WorkflowDebugInfo {
  config: any
  stages: any[]
  metrics: WorkflowMetrics
  events: WorkflowEvent[]
  errors: string[]
  performance: {
    memoryUsage: number
    apiCallCount: number
    cacheHits: number
    cacheMisses: number
  }
}

class WorkflowMonitor {
  private events: WorkflowEvent[] = []
  private metrics: Partial<WorkflowMetrics> = {}
  private performance: any = {}
  private debugMode: boolean = false

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode
    this.reset()
  }

  // Event tracking
  logEvent(stage: string, event: 'start' | 'complete' | 'error' | 'retry', details: any, duration?: number) {
    const workflowEvent: WorkflowEvent = {
      timestamp: new Date(),
      stage,
      event,
      details,
      duration
    }
    
    this.events.push(workflowEvent)
    
    if (this.debugMode) {
      console.log(`[WorkflowMonitor] ${stage}:${event}`, details)
    }
  }

  // Performance tracking
  startStage(stage: string) {
    this.logEvent(stage, 'start', { message: `Starting ${stage} stage` })
  }

  completeStage(stage: string, duration: number, success: boolean, details: any) {
    this.logEvent(stage, 'complete', { 
      message: `Completed ${stage} stage`, 
      success, 
      details 
    }, duration)
    
    this.updateMetrics(stage, duration, success)
  }

  logError(stage: string, error: Error, details: any) {
    this.logEvent(stage, 'error', { 
      message: `Error in ${stage} stage`, 
      error: error.message,
      details 
    })
    
    this.metrics.errorCount = (this.metrics.errorCount || 0) + 1
  }

  logRetry(stage: string, attempt: number, details: any) {
    this.logEvent(stage, 'retry', { 
      message: `Retrying ${stage} stage`, 
      attempt,
      details 
    })
  }

  // Metrics calculation
  private updateMetrics(stage: string, duration: number, success: boolean) {
    // Update stage durations
    if (!this.metrics.stageDurations) {
      this.metrics.stageDurations = {}
    }
    this.metrics.stageDurations[stage] = duration

    // Update success/error counts
    if (success) {
      this.metrics.successCount = (this.metrics.successCount || 0) + 1
    } else {
      this.metrics.errorCount = (this.metrics.errorCount || 0) + 1
    }

    // Update total duration
    this.metrics.totalDuration = Object.values(this.metrics.stageDurations || {}).reduce((sum, d) => sum + d, 0)
  }

  // API success rate tracking
  updateApiSuccess(api: string, success: boolean) {
    if (!this.metrics.apiSuccessRates) {
      this.metrics.apiSuccessRates = {}
    }
    
    if (!this.metrics.apiSuccessRates[api]) {
      this.metrics.apiSuccessRates[api] = { success: 0, total: 0 }
    }
    
    this.metrics.apiSuccessRates[api].total++
    if (success) {
      this.metrics.apiSuccessRates[api].success++
    }
  }

  // Data quality assessment
  assessDataQuality(visionData: any, recallData: any, synthesisData: any) {
    const visionQuality = this.assessVisionDataQuality(visionData)
    const recallQuality = this.assessRecallDataQuality(recallData)
    const synthesisQuality = this.assessSynthesisQuality(synthesisData)

    this.metrics.dataQuality = {
      visionDataQuality: visionQuality,
      recallDataQuality: recallQuality,
      synthesisQuality: synthesisQuality
    }

    return this.metrics.dataQuality
  }

  private assessVisionDataQuality(visionData: any): number {
    if (!visionData) return 0

    let quality = 0
    let factors = 0

    // Check for labels
    if (visionData.combined?.labels?.length > 0) {
      quality += Math.min(visionData.combined.labels.length / 10, 1) * 0.3
      factors++
    }

    // Check for objects
    if (visionData.combined?.objects?.length > 0) {
      quality += Math.min(visionData.combined.objects.length / 5, 1) * 0.2
      factors++
    }

    // Check for colors
    if (visionData.combined?.colors?.length > 0) {
      quality += Math.min(visionData.combined.colors.length / 3, 1) * 0.2
      factors++
    }

    // Check for text
    if (visionData.combined?.text?.length > 0) {
      quality += Math.min(visionData.combined.text.length / 2, 1) * 0.1
      factors++
    }

    // Check for face detection
    if (visionData.combined?.faces > 0) {
      quality += 0.1
      factors++
    }

    // Check for categories
    if (visionData.combined?.categories?.length > 0) {
      quality += Math.min(visionData.combined.categories.length / 3, 1) * 0.1
      factors++
    }

    return factors > 0 ? quality / factors : 0
  }

  private assessRecallDataQuality(recallData: any): number {
    if (!recallData) return 0

    let quality = 0
    let factors = 0

    // Check each recall data source
    const sources = ['colorAnalysis', 'wikipediaData', 'metMuseumData', 'artInstituteData', 'harvardData', 'artSearchData', 'textureAnalysis', 'emotionalAnalysis']
    
    sources.forEach(source => {
      if (recallData[source] && Object.keys(recallData[source]).length > 0) {
        quality += 1
        factors++
      }
    })

    return factors > 0 ? quality / factors : 0
  }

  private assessSynthesisQuality(synthesisData: any): number {
    if (!synthesisData) return 0

    let quality = 0
    let factors = 0

    // Check for required sections
    const requiredSections = ['styleAnalysis', 'techniqueAnalysis', 'themeAnalysis', 'mediumAnalysis', 'colorAnalysis', 'compositionAnalysis']
    
    requiredSections.forEach(section => {
      if (synthesisData[section] && Object.keys(synthesisData[section]).length > 0) {
        quality += 1
        factors++
      }
    })

    // Check for educational content
    const educationalContent = ['reflectionQuestions', 'learningObjectives', 'discussionPrompts', 'learningResources']
    
    educationalContent.forEach(content => {
      if (synthesisData[content] && Array.isArray(synthesisData[content]) && synthesisData[content].length > 0) {
        quality += 0.5
        factors++
      }
    })

    return factors > 0 ? quality / factors : 0
  }

  // Get comprehensive debug information
  getDebugInfo(): WorkflowDebugInfo {
    return {
      config: this.debugMode,
      stages: this.events.filter(e => e.event === 'complete'),
      metrics: this.metrics as WorkflowMetrics,
      events: this.events,
      errors: this.events.filter(e => e.event === 'error').map(e => e.details.error || 'Unknown error'),
      performance: {
        memoryUsage: this.getMemoryUsage(),
        apiCallCount: this.events.filter(e => e.details.api).length,
        cacheHits: 0, // TODO: Implement cache tracking
        cacheMisses: 0 // TODO: Implement cache tracking
      }
    }
  }

  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }

  // Performance analysis
  getPerformanceAnalysis(): any {
    const stageDurations = this.metrics.stageDurations || {}
    const totalDuration = this.metrics.totalDuration || 0

    return {
      totalDuration,
      stageBreakdown: Object.entries(stageDurations).map(([stage, duration]) => ({
        stage,
        duration,
        percentage: totalDuration > 0 ? (duration / totalDuration) * 100 : 0
      })),
      bottlenecks: this.identifyBottlenecks(stageDurations),
      recommendations: this.generateRecommendations()
    }
  }

  private identifyBottlenecks(stageDurations: { [stage: string]: number }): string[] {
    const bottlenecks: string[] = []
    const totalDuration = Object.values(stageDurations).reduce((sum, d) => sum + d, 0)
    
    Object.entries(stageDurations).forEach(([stage, duration]) => {
      const percentage = (duration / totalDuration) * 100
      if (percentage > 40) {
        bottlenecks.push(`${stage} stage takes ${percentage.toFixed(1)}% of total time`)
      }
    })

    return bottlenecks
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const metrics = this.metrics

    // API success rate recommendations
    if (metrics.apiSuccessRates) {
      Object.entries(metrics.apiSuccessRates).forEach(([api, rates]) => {
        const successRate = (rates.success / rates.total) * 100
        if (successRate < 70) {
          recommendations.push(`Consider improving ${api} reliability (${successRate.toFixed(1)}% success rate)`)
        }
      })
    }

    // Performance recommendations
    if (metrics.totalDuration && metrics.totalDuration > 30000) {
      recommendations.push('Consider implementing caching to reduce API call times')
    }

    // Data quality recommendations
    if (metrics.dataQuality) {
      if (metrics.dataQuality.visionDataQuality < 0.5) {
        recommendations.push('Vision data quality is low - consider improving image preprocessing')
      }
      if (metrics.dataQuality.recallDataQuality < 0.5) {
        recommendations.push('Recall data quality is low - consider adding more API sources')
      }
      if (metrics.dataQuality.synthesisQuality < 0.5) {
        recommendations.push('Synthesis quality is low - consider improving AI prompts')
      }
    }

    return recommendations
  }

  // Reset monitoring data
  reset() {
    this.events = []
    this.metrics = {}
    this.performance = {}
  }

  // Export data for analysis
  exportData(): any {
    return {
      timestamp: new Date(),
      events: this.events,
      metrics: this.metrics,
      performance: this.performance,
      debugInfo: this.getDebugInfo()
    }
  }

  // Real-time monitoring dashboard data
  getDashboardData(): any {
    const recentEvents = this.events.slice(-10) // Last 10 events
    const errorRate = this.events.filter(e => e.event === 'error').length / this.events.length
    const successRate = this.events.filter(e => e.event === 'complete').length / this.events.length

    return {
      recentEvents,
      errorRate: errorRate * 100,
      successRate: successRate * 100,
      totalEvents: this.events.length,
      currentStage: this.getCurrentStage(),
      performance: this.getPerformanceAnalysis()
    }
  }

  private getCurrentStage(): string | null {
    const lastEvent = this.events[this.events.length - 1]
    return lastEvent?.event === 'start' ? lastEvent.stage : null
  }
}

export default new WorkflowMonitor()
