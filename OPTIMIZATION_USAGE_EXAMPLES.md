# API Optimization Usage Examples

This document provides practical examples of how to use the optimized API integration system in your Slow Look application.

## Basic Usage Examples

### 1. Simple Analysis with Enhanced Workflow

```typescript
import { enhancedEducationalWorkflow } from './src/services/enhancedEducationalWorkflow'
import { monitoringService } from './src/services/monitoringService'

async function analyzeArtwork(imageBase64: string) {
  try {
    console.log('Starting artwork analysis...')
    
    const analysis = await enhancedEducationalWorkflow.analyzeArtworkComprehensively(imageBase64)
    
    console.log('Analysis completed:', {
      analysisId: analysis.analysisId,
      confidence: analysis.confidence,
      processingTime: analysis.processingTime,
      sources: analysis.sources
    })
    
    // Check analysis quality
    if (analysis.confidence < 0.7) {
      console.warn('Low confidence analysis. Quality indicators:', analysis.qualityIndicators)
    }
    
    return analysis
  } catch (error) {
    console.error('Analysis failed:', error.message)
    throw error
  }
}
```

### 2. Advanced Configuration

```typescript
import { EnhancedEducationalWorkflow } from './src/services/enhancedEducationalWorkflow'

// Create a custom workflow instance with specific configuration
const customWorkflow = new EnhancedEducationalWorkflow({
  enableCaching: true,
  enableCircuitBreaker: true,
  enableRateLimiting: true,
  maxRetries: 5,                    // More retries for critical operations
  timeoutMs: 45000,                 // Longer timeout for complex images
  parallelProcessing: true,
  qualityThreshold: 0.8             // Higher quality threshold
})

async function analyzeWithCustomConfig(imageBase64: string) {
  const analysis = await customWorkflow.analyzeArtworkComprehensively(imageBase64)
  return analysis
}
```

### 3. Direct API Client Usage

```typescript
import { optimizedApiClient } from './src/services/optimizedApiClient'

async function useOptimizedClient(imageBase64: string) {
  // Google Vision API call with caching and retry
  const googleResult = await optimizedApiClient.analyzeWithGoogleVision(imageBase64)
  
  if (googleResult.success) {
    console.log('Google Vision labels:', googleResult.data.labels)
  } else {
    console.error('Google Vision failed:', googleResult.error)
  }
  
  // Microsoft Vision API call
  const microsoftResult = await optimizedApiClient.analyzeWithMicrosoftVision(imageBase64)
  
  // OpenAI analysis
  const openaiResult = await optimizedApiClient.generateAnalysis(
    googleResult.data, 
    'Artwork analysis for educational purposes'
  )
  
  return {
    vision: googleResult.data,
    analysis: openaiResult.data
  }
}
```

## Monitoring and Metrics Examples

### 1. System Health Monitoring

```typescript
import { monitoringService } from './src/services/monitoringService'

async function monitorSystemHealth() {
  // Get overall system health
  const health = await monitoringService.getSystemHealth()
  
  console.log('System Health Status:', health.overall)
  console.log('API Status:', health.apis)
  
  // Check for degraded services
  Object.entries(health.apis).forEach(([apiName, status]) => {
    if (status.status === 'degraded' || status.status === 'critical') {
      console.warn(`${apiName} is ${status.status}:`, status)
    }
  })
  
  return health
}
```

### 2. Performance Metrics

```typescript
async function getPerformanceMetrics() {
  const metrics = monitoringService.getPerformanceMetrics()
  
  Object.entries(metrics).forEach(([apiName, metric]) => {
    console.log(`${apiName} Performance:`, {
      totalCalls: metric.totalCalls,
      successRate: `${((metric.successfulCalls / metric.totalCalls) * 100).toFixed(1)}%`,
      averageLatency: `${metric.averageLatency.toFixed(0)}ms`,
      errorRate: `${(metric.errorRate * 100).toFixed(1)}%`
    })
  })
  
  return metrics
}
```

### 3. Cache Performance

```typescript
async function getCachePerformance() {
  const cacheMetrics = monitoringService.getCacheMetrics()
  
  Object.entries(cacheMetrics).forEach(([apiName, metric]) => {
    console.log(`${apiName} Cache:`, {
      hitRate: `${(metric.hitRate * 100).toFixed(1)}%`,
      totalRequests: metric.totalRequests,
      cacheHits: metric.cacheHits,
      cacheMisses: metric.cacheMisses
    })
  })
  
  return cacheMetrics
}
```

### 4. Alert Management

```typescript
async function manageAlerts() {
  // Get all unacknowledged alerts
  const alerts = monitoringService.getAlerts({ acknowledged: false })
  
  alerts.forEach(alert => {
    console.log(`Alert [${alert.severity}]: ${alert.message}`)
    
    // Acknowledge critical alerts
    if (alert.severity === 'critical') {
      monitoringService.acknowledgeAlert(alert.id)
      console.log(`Acknowledged critical alert: ${alert.id}`)
    }
  })
  
  return alerts
}
```

## Error Handling Examples

### 1. Comprehensive Error Handling

```typescript
async function robustAnalysis(imageBase64: string) {
  try {
    const analysis = await enhancedEducationalWorkflow.analyzeArtworkComprehensively(imageBase64)
    
    // Validate analysis quality
    if (analysis.confidence < 0.5) {
      throw new Error(`Low confidence analysis: ${analysis.confidence}`)
    }
    
    // Check quality indicators
    const { dataCompleteness, reliability } = analysis.qualityIndicators
    if (dataCompleteness < 0.3 || reliability < 0.3) {
      console.warn('Analysis quality may be insufficient')
      // Continue with analysis but log warning
    }
    
    return analysis
    
  } catch (error) {
    // Log error details
    console.error('Analysis failed:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    // Check if it's a configuration issue
    if (error.message.includes('API key') || error.message.includes('configuration')) {
      throw new Error('Configuration error: Please check your API keys')
    }
    
    // Check if it's a network issue
    if (error.message.includes('timeout') || error.message.includes('network')) {
      throw new Error('Network error: Please check your internet connection')
    }
    
    // Generic error
    throw new Error('Analysis failed: Please try again later')
  }
}
```

### 2. Fallback Strategy

```typescript
async function analysisWithFallback(imageBase64: string) {
  try {
    // Try enhanced workflow first
    return await enhancedEducationalWorkflow.analyzeArtworkComprehensively(imageBase64)
    
  } catch (error) {
    console.warn('Enhanced workflow failed, trying fallback...')
    
    try {
      // Fallback to basic analysis
      const basicAnalysis = await performBasicAnalysis(imageBase64)
      return enhanceBasicAnalysis(basicAnalysis)
      
    } catch (fallbackError) {
      console.error('All analysis methods failed')
      
      // Return minimal analysis structure
      return createMinimalAnalysis(imageBase64)
    }
  }
}

async function performBasicAnalysis(imageBase64: string) {
  // Use only the most reliable API
  const result = await optimizedApiClient.analyzeWithGoogleVision(imageBase64)
  
  if (!result.success) {
    throw new Error('Basic analysis failed')
  }
  
  return result.data
}

function enhanceBasicAnalysis(basicData: any) {
  // Enhance basic data with default educational content
  return {
    visionAnalysis: basicData,
    educationalAnalysis: createDefaultEducationalAnalysis(),
    museumData: [],
    wikipediaData: null,
    analysisId: `fallback_${Date.now()}`,
    timestamp: Date.now(),
    processingTime: 0,
    confidence: 0.6,
    sources: ['Fallback'],
    apiMetrics: { totalApiCalls: 1, successfulCalls: 1, failedCalls: 0, cacheHits: 0, averageLatency: 1000 },
    qualityIndicators: { dataCompleteness: 0.4, sourceDiversity: 0.2, educationalValue: 0.5, reliability: 0.6 }
  }
}
```

## Integration with React Components

### 1. React Hook for Artwork Analysis

```typescript
import { useState, useEffect } from 'react'
import { enhancedEducationalWorkflow } from '../services/enhancedEducationalWorkflow'

export function useArtworkAnalysis() {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState(null)

  const analyzeImage = async (imageBase64: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await enhancedEducationalWorkflow.analyzeArtworkComprehensively(imageBase64)
      setAnalysis(result)
      
      // Update metrics
      const currentMetrics = enhancedEducationalWorkflow.getMetrics()
      setMetrics(currentMetrics)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const clearAnalysis = () => {
    setAnalysis(null)
    setError(null)
    setMetrics(null)
  }

  return {
    analysis,
    loading,
    error,
    metrics,
    analyzeImage,
    clearAnalysis
  }
}
```

### 2. Analysis Component with Monitoring

```typescript
import React, { useState } from 'react'
import { useArtworkAnalysis } from './hooks/useArtworkAnalysis'
import { monitoringService } from '../services/monitoringService'

export function ArtworkAnalysisComponent() {
  const { analysis, loading, error, metrics, analyzeImage, clearAnalysis } = useArtworkAnalysis()
  const [systemHealth, setSystemHealth] = useState(null)

  useEffect(() => {
    // Monitor system health
    const checkHealth = async () => {
      const health = await monitoringService.getSystemHealth()
      setSystemHealth(health)
    }
    
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const handleImageUpload = async (imageBase64: string) => {
    await analyzeImage(imageBase64)
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Analyzing artwork...</p>
        {metrics && (
          <div className="metrics">
            <small>API Calls: {metrics.performance.totalApiCalls}</small>
            <small>Cache Hits: {metrics.cache.totalHits}</small>
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        <h3>Analysis Failed</h3>
        <p>{error}</p>
        <button onClick={clearAnalysis}>Try Again</button>
      </div>
    )
  }

  if (analysis) {
    return (
      <div className="analysis-results">
        <div className="analysis-header">
          <h2>Artwork Analysis</h2>
          <div className="confidence-badge">
            Confidence: {(analysis.confidence * 100).toFixed(0)}%
          </div>
        </div>
        
        <div className="quality-indicators">
          <div>Data Completeness: {(analysis.qualityIndicators.dataCompleteness * 100).toFixed(0)}%</div>
          <div>Educational Value: {(analysis.qualityIndicators.educationalValue * 100).toFixed(0)}%</div>
          <div>Reliability: {(analysis.qualityIndicators.reliability * 100).toFixed(0)}%</div>
        </div>
        
        <div className="analysis-content">
          <h3>Style Analysis</h3>
          <p>{analysis.educationalAnalysis.styleAnalysis.primaryStyle}</p>
          
          <h3>Techniques</h3>
          <ul>
            {analysis.educationalAnalysis.techniqueAnalysis.primaryTechniques.map((technique, index) => (
              <li key={index}>{technique}</li>
            ))}
          </ul>
          
          <h3>Reflection Questions</h3>
          <ul>
            {analysis.educationalAnalysis.reflectionQuestions.map((question, index) => (
              <li key={index}>
                <strong>{question.category}:</strong> {question.question}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="analysis-footer">
          <small>Sources: {analysis.sources.join(', ')}</small>
          <small>Processing Time: {analysis.processingTime}ms</small>
        </div>
      </div>
    )
  }

  return (
    <div className="upload-area">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
              handleImageUpload(event.target.result as string)
            }
            reader.readAsDataURL(file)
          }
        }}
      />
      
      {systemHealth && (
        <div className="system-status">
          <small>System Status: {systemHealth.overall}</small>
          <small>Cache Hit Rate: {(systemHealth.cache.overallHitRate * 100).toFixed(1)}%</small>
        </div>
      )}
    </div>
  )
}
```

## Migration Examples

### 1. Migrating from Legacy API

```typescript
// Before: Legacy API usage
import { analyzeArtworkEducationally } from './services/educationWorkflow'

const legacyAnalysis = async (imageBase64: string) => {
  const result = await analyzeArtworkEducationally(imageBase64)
  return result.analysis
}

// After: Enhanced API usage
import { enhancedEducationalWorkflow } from './services/enhancedEducationalWorkflow'

const enhancedAnalysis = async (imageBase64: string) => {
  const analysis = await enhancedEducationalWorkflow.analyzeArtworkComprehensively(imageBase64)
  
  // Additional benefits available
  console.log('Quality indicators:', analysis.qualityIndicators)
  console.log('API metrics:', analysis.apiMetrics)
  console.log('Processing time:', analysis.processingTime)
  
  return analysis
}
```

### 2. Gradual Migration Strategy

```typescript
// Step 1: Add monitoring to existing code
import { monitoringService } from './services/monitoringService'

const monitoredLegacyAnalysis = async (imageBase64: string) => {
  const startTime = Date.now()
  
  try {
    const result = await analyzeArtworkEducationally(imageBase64)
    
    // Log performance
    monitoringService.logEvent({
      type: 'api_call',
      source: 'legacy-workflow',
      data: { 
        success: true, 
        duration: Date.now() - startTime 
      },
      severity: 'low'
    })
    
    return result.analysis
  } catch (error) {
    monitoringService.logError('Legacy analysis failed', error)
    throw error
  }
}

// Step 2: Add fallback to enhanced workflow
const hybridAnalysis = async (imageBase64: string) => {
  try {
    // Try enhanced workflow first
    return await enhancedEducationalWorkflow.analyzeArtworkComprehensively(imageBase64)
  } catch (error) {
    console.warn('Enhanced workflow failed, falling back to legacy')
    return await monitoredLegacyAnalysis(imageBase64)
  }
}

// Step 3: Full migration
const fullyEnhancedAnalysis = async (imageBase64: string) => {
  return await enhancedEducationalWorkflow.analyzeArtworkComprehensively(imageBase64)
}
```

## Performance Optimization Examples

### 1. Batch Processing

```typescript
async function batchAnalysis(imageBase64Array: string[]) {
  const analyses = []
  
  // Process images in parallel with concurrency limit
  const concurrencyLimit = 3
  const chunks = []
  
  for (let i = 0; i < imageBase64Array.length; i += concurrencyLimit) {
    chunks.push(imageBase64Array.slice(i, i + concurrencyLimit))
  }
  
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(imageBase64 => 
        enhancedEducationalWorkflow.analyzeArtworkComprehensively(imageBase64)
      )
    )
    analyses.push(...chunkResults)
  }
  
  return analyses
}
```

### 2. Preloading and Caching

```typescript
class ArtworkAnalysisCache {
  private cache = new Map<string, any>()
  private preloadQueue: string[] = []

  async preloadAnalysis(imageBase64: string) {
    if (this.cache.has(imageBase64)) {
      return this.cache.get(imageBase64)
    }
    
    try {
      const analysis = await enhancedEducationalWorkflow.analyzeArtworkComprehensively(imageBase64)
      this.cache.set(imageBase64, analysis)
      return analysis
    } catch (error) {
      console.error('Preload failed:', error)
      return null
    }
  }

  async batchPreload(imageBase64Array: string[]) {
    const results = await Promise.allSettled(
      imageBase64Array.map(imageBase64 => this.preloadAnalysis(imageBase64))
    )
    
    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value)
  }

  getCachedAnalysis(imageBase64: string) {
    return this.cache.get(imageBase64)
  }

  clearCache() {
    this.cache.clear()
  }
}
```

## Testing Examples

### 1. Unit Testing with Mocked APIs

```typescript
import { enhancedEducationalWorkflow } from '../services/enhancedEducationalWorkflow'
import { monitoringService } from '../services/monitoringService'

// Mock the optimized API client
jest.mock('../services/optimizedApiClient', () => ({
  optimizedApiClient: {
    analyzeWithGoogleVision: jest.fn(),
    analyzeWithMicrosoftVision: jest.fn(),
    analyzeWithClarifai: jest.fn(),
    generateAnalysis: jest.fn(),
    searchMetMuseum: jest.fn(),
    searchWikipedia: jest.fn()
  }
}))

describe('Enhanced Educational Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    monitoringService.clearLogs()
  })

  test('should analyze artwork successfully', async () => {
    // Mock successful API responses
    const mockVisionData = {
      labels: ['painting', 'artwork'],
      objects: ['canvas', 'brush'],
      colors: ['rgb(255, 0, 0)'],
      faces: 0
    }

    const mockEducationalAnalysis = {
      styleAnalysis: {
        primaryStyle: 'Impressionist',
        styleCharacteristics: ['Loose brushwork', 'Light effects']
      }
    }

    // Mock API calls
    const { optimizedApiClient } = require('../services/optimizedApiClient')
    optimizedApiClient.analyzeWithGoogleVision.mockResolvedValue({
      success: true,
      data: mockVisionData
    })
    
    optimizedApiClient.generateAnalysis.mockResolvedValue({
      success: true,
      data: mockEducationalAnalysis
    })

    // Test the workflow
    const result = await enhancedEducationalWorkflow.analyzeArtworkComprehensively('test-image-base64')
    
    expect(result.confidence).toBeGreaterThan(0)
    expect(result.analysisId).toBeDefined()
    expect(result.sources).toContain('Google Vision')
  })

  test('should handle API failures gracefully', async () => {
    const { optimizedApiClient } = require('../services/optimizedApiClient')
    optimizedApiClient.analyzeWithGoogleVision.mockResolvedValue({
      success: false,
      error: 'API key invalid'
    })

    const result = await enhancedEducationalWorkflow.analyzeArtworkComprehensively('test-image-base64')
    
    // Should return fallback analysis
    expect(result.confidence).toBeLessThan(0.5)
    expect(result.sources).toContain('Fallback')
  })
})
```

### 2. Integration Testing

```typescript
describe('API Integration Tests', () => {
  test('should perform health check', async () => {
    const health = await monitoringService.getSystemHealth()
    
    expect(health).toHaveProperty('overall')
    expect(health).toHaveProperty('apis')
    expect(['healthy', 'degraded', 'critical']).toContain(health.overall)
  })

  test('should track performance metrics', async () => {
    const initialMetrics = monitoringService.getPerformanceMetrics()
    
    // Perform some API calls
    await enhancedEducationalWorkflow.analyzeArtworkComprehensively('test-image-base64')
    
    const finalMetrics = monitoringService.getPerformanceMetrics()
    
    // Metrics should have changed
    expect(finalMetrics).not.toEqual(initialMetrics)
  })
})
```

These examples demonstrate the comprehensive capabilities of the optimized API integration system and provide practical guidance for implementation and migration.
