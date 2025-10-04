// Comprehensive monitoring and logging service
import { ApiResponse } from './optimizedApiClient'

// Monitoring event types
export interface MonitoringEvent {
  id: string
  type: 'api_call' | 'error' | 'performance' | 'cache_hit' | 'circuit_breaker' | 'rate_limit'
  timestamp: number
  source: string
  data: any
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface PerformanceMetrics {
  apiName: string
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  averageLatency: number
  minLatency: number
  maxLatency: number
  errorRate: number
  lastCallTime: number
}

export interface CacheMetrics {
  apiName: string
  totalRequests: number
  cacheHits: number
  cacheMisses: number
  hitRate: number
  totalSize: number
  evictions: number
}

export interface CircuitBreakerMetrics {
  apiName: string
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failures: number
  successRate: number
  lastFailureTime?: number
  nextAttemptTime?: number
}

export interface RateLimitMetrics {
  apiName: string
  requestsInWindow: number
  windowStart: number
  windowSize: number
  maxRequests: number
  throttled: boolean
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical'
  apis: Record<string, {
    status: 'healthy' | 'degraded' | 'critical'
    latency?: number
    errorRate: number
    lastCheck: number
  }>
  cache: {
    totalHits: number
    totalMisses: number
    overallHitRate: number
  }
  circuitBreakers: Record<string, CircuitBreakerMetrics>
  rateLimiters: Record<string, RateLimitMetrics>
  timestamp: number
}

// Enhanced logger class
class Logger {
  private logs: MonitoringEvent[] = []
  private maxLogs: number = 1000
  private enableConsoleLogging: boolean = true

  constructor() {
    // Set up error handling for uncaught exceptions
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError('Uncaught Error', event.error, { 
          filename: event.filename, 
          lineno: event.lineno, 
          colno: event.colno 
        })
      })

      window.addEventListener('unhandledrejection', (event) => {
        this.logError('Unhandled Promise Rejection', event.reason)
      })
    }
  }

  logEvent(event: Omit<MonitoringEvent, 'id' | 'timestamp'>): void {
    const fullEvent: MonitoringEvent = {
      ...event,
      id: this.generateId(),
      timestamp: Date.now()
    }

    // Add to logs array
    this.logs.push(fullEvent)
    
    // Maintain max log size
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console logging based on severity
    if (this.enableConsoleLogging) {
      this.logToConsole(fullEvent)
    }

    // Store in localStorage for persistence (browser only)
    if (typeof localStorage !== 'undefined') {
      this.persistLog(fullEvent)
    }
  }

  logApiCall(apiName: string, response: ApiResponse<any>, duration: number): void {
    const success = response.success
    const severity = success ? 'low' : 'high'
    
    this.logEvent({
      type: 'api_call',
      source: apiName,
      data: {
        success,
        duration,
        retryCount: response.retryCount,
        error: response.error,
        timestamp: response.timestamp
      },
      severity
    })
  }

  logError(message: string, error?: Error, context?: any): void {
    this.logEvent({
      type: 'error',
      source: 'system',
      data: {
        message,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined,
        context
      },
      severity: 'critical'
    })
  }

  logPerformance(apiName: string, metrics: Partial<PerformanceMetrics>): void {
    this.logEvent({
      type: 'performance',
      source: apiName,
      data: metrics,
      severity: 'medium'
    })
  }

  logCacheHit(apiName: string, cacheKey: string): void {
    this.logEvent({
      type: 'cache_hit',
      source: apiName,
      data: { cacheKey },
      severity: 'low'
    })
  }

  logCircuitBreaker(apiName: string, state: string, failures: number): void {
    this.logEvent({
      type: 'circuit_breaker',
      source: apiName,
      data: { state, failures },
      severity: state === 'OPEN' ? 'high' : 'medium'
    })
  }

  logRateLimit(apiName: string, throttled: boolean, requestsInWindow: number): void {
    this.logEvent({
      type: 'rate_limit',
      source: apiName,
      data: { throttled, requestsInWindow },
      severity: throttled ? 'medium' : 'low'
    })
  }

  private logToConsole(event: MonitoringEvent): void {
    const timestamp = new Date(event.timestamp).toISOString()
    const prefix = `[${timestamp}] [${event.severity.toUpperCase()}] [${event.source}]`
    
    switch (event.severity) {
      case 'critical':
        console.error(prefix, event.type, event.data)
        break
      case 'high':
        console.warn(prefix, event.type, event.data)
        break
      case 'medium':
        console.info(prefix, event.type, event.data)
        break
      case 'low':
        console.debug(prefix, event.type, event.data)
        break
    }
  }

  private persistLog(event: MonitoringEvent): void {
    try {
      const existingLogs = localStorage.getItem('api-monitoring-logs')
      const logs = existingLogs ? JSON.parse(existingLogs) : []
      
      logs.push(event)
      
      // Keep only last 100 logs in localStorage
      const trimmedLogs = logs.slice(-100)
      
      localStorage.setItem('api-monitoring-logs', JSON.stringify(trimmedLogs))
    } catch (error) {
      console.warn('Failed to persist log:', error)
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  getLogs(filter?: { type?: string; severity?: string; source?: string }): MonitoringEvent[] {
    let filteredLogs = this.logs

    if (filter) {
      filteredLogs = this.logs.filter(log => {
        if (filter.type && log.type !== filter.type) return false
        if (filter.severity && log.severity !== filter.severity) return false
        if (filter.source && log.source !== filter.source) return false
        return true
      })
    }

    return filteredLogs
  }

  clearLogs(): void {
    this.logs = []
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('api-monitoring-logs')
    }
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Performance monitoring class
class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetrics>()
  private latencies = new Map<string, number[]>()

  recordApiCall(apiName: string, success: boolean, latency: number): void {
    const existing = this.metrics.get(apiName) || {
      apiName,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageLatency: 0,
      minLatency: Infinity,
      maxLatency: 0,
      errorRate: 0,
      lastCallTime: 0
    }

    // Update metrics
    existing.totalCalls++
    if (success) {
      existing.successfulCalls++
    } else {
      existing.failedCalls++
    }
    existing.errorRate = existing.failedCalls / existing.totalCalls
    existing.lastCallTime = Date.now()

    // Update latency metrics
    const latencies = this.latencies.get(apiName) || []
    latencies.push(latency)
    
    // Keep only last 100 latencies
    if (latencies.length > 100) {
      latencies.splice(0, latencies.length - 100)
    }
    this.latencies.set(apiName, latencies)

    // Calculate latency statistics
    existing.minLatency = Math.min(existing.minLatency, latency)
    existing.maxLatency = Math.max(existing.maxLatency, latency)
    existing.averageLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length

    this.metrics.set(apiName, existing)
  }

  getMetrics(apiName?: string): PerformanceMetrics | Record<string, PerformanceMetrics> {
    if (apiName) {
      return this.metrics.get(apiName) || {
        apiName,
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageLatency: 0,
        minLatency: 0,
        maxLatency: 0,
        errorRate: 0,
        lastCallTime: 0
      }
    }
    
    return Object.fromEntries(this.metrics.entries())
  }

  resetMetrics(apiName?: string): void {
    if (apiName) {
      this.metrics.delete(apiName)
      this.latencies.delete(apiName)
    } else {
      this.metrics.clear()
      this.latencies.clear()
    }
  }
}

// Cache monitoring class
class CacheMonitor {
  private metrics = new Map<string, CacheMetrics>()

  recordCacheHit(apiName: string): void {
    const existing = this.getOrCreateMetrics(apiName)
    existing.totalRequests++
    existing.cacheHits++
    existing.hitRate = existing.cacheHits / existing.totalRequests
    this.metrics.set(apiName, existing)
  }

  recordCacheMiss(apiName: string): void {
    const existing = this.getOrCreateMetrics(apiName)
    existing.totalRequests++
    existing.cacheMisses++
    existing.hitRate = existing.cacheHits / existing.totalRequests
    this.metrics.set(apiName, existing)
  }

  recordCacheEviction(apiName: string): void {
    const existing = this.getOrCreateMetrics(apiName)
    existing.evictions++
    this.metrics.set(apiName, existing)
  }

  updateCacheSize(apiName: string, size: number): void {
    const existing = this.getOrCreateMetrics(apiName)
    existing.totalSize = size
    this.metrics.set(apiName, existing)
  }

  private getOrCreateMetrics(apiName: string): CacheMetrics {
    return this.metrics.get(apiName) || {
      apiName,
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      totalSize: 0,
      evictions: 0
    }
  }

  getMetrics(apiName?: string): CacheMetrics | Record<string, CacheMetrics> {
    if (apiName) {
      return this.metrics.get(apiName) || this.getOrCreateMetrics(apiName)
    }
    
    return Object.fromEntries(this.metrics.entries())
  }

  resetMetrics(apiName?: string): void {
    if (apiName) {
      this.metrics.delete(apiName)
    } else {
      this.metrics.clear()
    }
  }
}

// System health monitor
class HealthMonitor {
  private healthChecks = new Map<string, () => Promise<{ healthy: boolean; latency?: number; error?: string }>>()
  private lastHealthCheck = new Map<string, number>()
  private healthCheckInterval = 60000 // 1 minute

  constructor() {
    // Start periodic health checks
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.performHealthChecks()
      }, this.healthCheckInterval)
    }
  }

  registerHealthCheck(apiName: string, checkFn: () => Promise<{ healthy: boolean; latency?: number; error?: string }>): void {
    this.healthChecks.set(apiName, checkFn)
  }

  async performHealthChecks(): Promise<SystemHealth> {
    const results: Record<string, { status: 'healthy' | 'degraded' | 'critical'; latency?: number; errorRate: number; lastCheck: number }> = {}
    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy'
    const now = Date.now()

    for (const [apiName, checkFn] of this.healthChecks.entries()) {
      try {
        const start = Date.now()
        const result = await checkFn()
        const latency = Date.now() - start

        let status: 'healthy' | 'degraded' | 'critical' = 'healthy'
        
        if (!result.healthy) {
          status = 'critical'
          overallStatus = 'critical'
        } else if (latency > 5000) { // 5 second threshold
          status = 'degraded'
          if (overallStatus === 'healthy') overallStatus = 'degraded'
        }

        results[apiName] = {
          status,
          latency,
          errorRate: result.healthy ? 0 : 1,
          lastCheck: now
        }

        this.lastHealthCheck.set(apiName, now)
      } catch (error) {
        results[apiName] = {
          status: 'critical',
          errorRate: 1,
          lastCheck: now
        }
        overallStatus = 'critical'
        logger.logError(`Health check failed for ${apiName}`, error as Error)
      }
    }

    return {
      overall: overallStatus,
      apis: results,
      cache: cacheMonitor.getOverallCacheMetrics(),
      circuitBreakers: {}, // Will be populated by the API client
      rateLimiters: {}, // Will be populated by the API client
      timestamp: now
    }
  }

  async getSystemHealth(): Promise<SystemHealth> {
    return this.performHealthChecks()
  }
}

// Alert system
class AlertSystem {
  private alerts: Array<{
    id: string
    type: string
    message: string
    timestamp: number
    acknowledged: boolean
    severity: 'low' | 'medium' | 'high' | 'critical'
  }> = []

  createAlert(type: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): string {
    const alert = {
      id: this.generateId(),
      type,
      message,
      timestamp: Date.now(),
      acknowledged: false,
      severity
    }

    this.alerts.push(alert)

    // Log critical alerts
    if (severity === 'critical' || severity === 'high') {
      logger.logEvent({
        type: 'error',
        source: 'alert-system',
        data: { type, message, alertId: alert.id },
        severity
      })
    }

    return alert.id
  }

  getAlerts(filter?: { severity?: string; acknowledged?: boolean }): typeof this.alerts {
    let filteredAlerts = this.alerts

    if (filter) {
      filteredAlerts = this.alerts.filter(alert => {
        if (filter.severity && alert.severity !== filter.severity) return false
        if (filter.acknowledged !== undefined && alert.acknowledged !== filter.acknowledged) return false
        return true
      })
    }

    return filteredAlerts
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      return true
    }
    return false
  }

  clearAlerts(): void {
    this.alerts = []
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

// Main monitoring service class
export class MonitoringService {
  private logger = new Logger()
  private performanceMonitor = new PerformanceMonitor()
  private cacheMonitor = new CacheMonitor()
  private healthMonitor = new HealthMonitor()
  private alertSystem = new AlertSystem()

  // Logger methods
  logApiCall(apiName: string, response: ApiResponse<any>, duration: number): void {
    this.logger.logApiCall(apiName, response, duration)
    this.performanceMonitor.recordApiCall(apiName, response.success, duration)
    
    // Create alerts for high error rates
    if (!response.success) {
      this.checkForErrorRateAlerts(apiName)
    }
  }

  logCacheHit(apiName: string, cacheKey: string): void {
    this.logger.logCacheHit(apiName, cacheKey)
    this.cacheMonitor.recordCacheHit(apiName)
  }

  logCacheMiss(apiName: string): void {
    this.cacheMonitor.recordCacheMiss(apiName)
  }

  logCacheEviction(apiName: string): void {
    this.logger.logEvent({
      type: 'cache_hit',
      source: apiName,
      data: { action: 'eviction' },
      severity: 'low'
    })
    this.cacheMonitor.recordCacheEviction(apiName)
  }

  logCircuitBreaker(apiName: string, state: string, failures: number): void {
    this.logger.logCircuitBreaker(apiName, state, failures)
    
    if (state === 'OPEN') {
      this.alertSystem.createAlert(
        'circuit_breaker_open',
        `Circuit breaker opened for ${apiName} after ${failures} failures`,
        'high'
      )
    }
  }

  logRateLimit(apiName: string, throttled: boolean, requestsInWindow: number): void {
    this.logger.logRateLimit(apiName, throttled, requestsInWindow)
    
    if (throttled) {
      this.alertSystem.createAlert(
        'rate_limit_throttled',
        `Rate limit exceeded for ${apiName}`,
        'medium'
      )
    }
  }

  logError(message: string, error?: Error, context?: any): void {
    this.logger.logError(message, error, context)
    this.alertSystem.createAlert('system_error', message, 'critical')
  }

  // Performance monitoring
  getPerformanceMetrics(apiName?: string): PerformanceMetrics | Record<string, PerformanceMetrics> {
    return this.performanceMonitor.getMetrics(apiName)
  }

  resetPerformanceMetrics(apiName?: string): void {
    this.performanceMonitor.resetMetrics(apiName)
  }

  // Cache monitoring
  getCacheMetrics(apiName?: string): CacheMetrics | Record<string, CacheMetrics> {
    return this.cacheMonitor.getMetrics(apiName)
  }

  updateCacheSize(apiName: string, size: number): void {
    this.cacheMonitor.updateCacheSize(apiName, size)
  }

  resetCacheMetrics(apiName?: string): void {
    this.cacheMonitor.resetMetrics(apiName)
  }

  // Health monitoring
  registerHealthCheck(apiName: string, checkFn: () => Promise<{ healthy: boolean; latency?: number; error?: string }>): void {
    this.healthMonitor.registerHealthCheck(apiName, checkFn)
  }

  async getSystemHealth(): Promise<SystemHealth> {
    return this.healthMonitor.getSystemHealth()
  }

  // Alert system
  createAlert(type: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): string {
    return this.alertSystem.createAlert(type, message, severity)
  }

  getAlerts(filter?: { severity?: string; acknowledged?: boolean }): any[] {
    return this.alertSystem.getAlerts(filter)
  }

  acknowledgeAlert(alertId: string): boolean {
    return this.alertSystem.acknowledgeAlert(alertId)
  }

  clearAlerts(): void {
    this.alertSystem.clearAlerts()
  }

  // Logging
  getLogs(filter?: { type?: string; severity?: string; source?: string }): MonitoringEvent[] {
    return this.logger.getLogs(filter)
  }

  clearLogs(): void {
    this.logger.clearLogs()
  }

  exportLogs(): string {
    return this.logger.exportLogs()
  }

  // Comprehensive metrics export
  exportMetrics(): string {
    const metrics = {
      performance: this.getPerformanceMetrics(),
      cache: this.getCacheMetrics(),
      health: 'Run getSystemHealth() for current health status',
      alerts: this.getAlerts(),
      logs: this.getLogs().slice(-50) // Last 50 logs
    }

    return JSON.stringify(metrics, null, 2)
  }

  // Private helper methods
  private checkForErrorRateAlerts(apiName: string): void {
    const metrics = this.performanceMonitor.getMetrics(apiName) as PerformanceMetrics
    
    if (metrics.totalCalls >= 10 && metrics.errorRate > 0.5) {
      this.alertSystem.createAlert(
        'high_error_rate',
        `High error rate detected for ${apiName}: ${(metrics.errorRate * 100).toFixed(1)}%`,
        'high'
      )
    }
  }
}

// Extend CacheMonitor to include overall metrics
class CacheMonitor extends CacheMonitor {
  getOverallCacheMetrics(): { totalHits: number; totalMisses: number; overallHitRate: number } {
    const allMetrics = this.getMetrics() as Record<string, CacheMetrics>
    
    const totals = Object.values(allMetrics).reduce(
      (acc, metrics) => ({
        totalHits: acc.totalHits + metrics.cacheHits,
        totalMisses: acc.totalMisses + metrics.cacheMisses
      }),
      { totalHits: 0, totalMisses: 0 }
    )

    const overallHitRate = totals.totalHits + totals.totalMisses > 0 
      ? totals.totalHits / (totals.totalHits + totals.totalMisses)
      : 0

    return {
      totalHits: totals.totalHits,
      totalMisses: totals.totalMisses,
      overallHitRate
    }
  }
}

// Export singleton instances
export const monitoringService = new MonitoringService()
export const logger = monitoringService['logger']
export const performanceMonitor = monitoringService['performanceMonitor']
export const cacheMonitor = monitoringService['cacheMonitor']
export const healthMonitor = monitoringService['healthMonitor']
export const alertSystem = monitoringService['alertSystem']
