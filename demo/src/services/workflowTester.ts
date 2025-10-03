// Workflow Testing Suite
// Comprehensive testing tools for the multistage analysis workflow

export interface TestCase {
  name: string
  description: string
  imageBase64: string
  expectedStages: string[]
  expectedAPIs: string[]
  timeout: number
  config?: any
}

export interface TestResult {
  testCase: string
  success: boolean
  duration: number
  stages: any[]
  errors: string[]
  metrics: any
  recommendations: string[]
}

export interface TestSuite {
  name: string
  description: string
  testCases: TestCase[]
  results: TestResult[]
  summary: {
    totalTests: number
    passedTests: number
    failedTests: number
    averageDuration: number
    commonIssues: string[]
  }
}

class WorkflowTester {
  private testCases: TestCase[] = []
  private results: TestResult[] = []

  constructor() {
    this.initializeDefaultTestCases()
  }

  // Initialize default test cases
  private initializeDefaultTestCases() {
    this.testCases = [
      {
        name: 'Basic Artwork Analysis',
        description: 'Test basic workflow with a simple artwork image',
        imageBase64: this.createTestImage('artwork'),
        expectedStages: ['vision', 'interpretation', 'recall', 'synthesis'],
        expectedAPIs: ['Clarifai', 'Google Vision', 'Microsoft Vision', 'OpenAI', 'Wikipedia', 'Met Museum'],
        timeout: 30000
      },
      {
        name: 'Portrait Analysis',
        description: 'Test workflow with a portrait image',
        imageBase64: this.createTestImage('portrait'),
        expectedStages: ['vision', 'interpretation', 'recall', 'synthesis'],
        expectedAPIs: ['Clarifai', 'Google Vision', 'Microsoft Vision', 'OpenAI', 'Wikipedia', 'Met Museum'],
        timeout: 30000
      },
      {
        name: 'Landscape Analysis',
        description: 'Test workflow with a landscape image',
        imageBase64: this.createTestImage('landscape'),
        expectedStages: ['vision', 'interpretation', 'recall', 'synthesis'],
        expectedAPIs: ['Clarifai', 'Google Vision', 'Microsoft Vision', 'OpenAI', 'Wikipedia', 'Met Museum'],
        timeout: 30000
      },
      {
        name: 'Minimal Configuration',
        description: 'Test workflow with minimal API configuration',
        imageBase64: this.createTestImage('minimal'),
        expectedStages: ['vision', 'interpretation', 'recall', 'synthesis'],
        expectedAPIs: ['Art Institute', 'Wikipedia'],
        timeout: 15000,
        config: {
          enableVisionAPIs: { clarifai: false, googleVision: false, microsoftVision: false },
          enableRecallAPIs: { wikipedia: true, metMuseum: true, artInstitute: true, harvard: false, artSearch: false },
          enableAI: { openai: false }
        }
      },
      {
        name: 'High Performance Configuration',
        description: 'Test workflow with all APIs enabled for maximum performance',
        imageBase64: this.createTestImage('performance'),
        expectedStages: ['vision', 'interpretation', 'recall', 'synthesis'],
        expectedAPIs: ['Clarifai', 'Google Vision', 'Microsoft Vision', 'OpenAI', 'Wikipedia', 'Met Museum', 'Art Institute', 'Harvard', 'Color Analysis', 'Texture Analysis', 'Emotional Analysis'],
        timeout: 60000,
        config: {
          enableVisionAPIs: { clarifai: true, googleVision: true, microsoftVision: true },
          enableRecallAPIs: { wikipedia: true, metMuseum: true, artInstitute: true, harvard: true, artSearch: true, colorAnalysis: true, textureAnalysis: true, emotionalAnalysis: true },
          enableAI: { openai: true },
          performance: { parallelExecution: true, timeoutMs: 30000, retryAttempts: 3 }
        }
      }
    ]
  }

  // Create test image (placeholder - in real implementation, this would be actual base64 images)
  private createTestImage(type: string): string {
    // This is a placeholder - in a real implementation, you would have actual test images
    const testImages = {
      artwork: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      portrait: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      landscape: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      minimal: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      performance: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
    }
    return testImages[type] || testImages.artwork
  }

  // Run a single test case
  async runTestCase(testCase: TestCase): Promise<TestResult> {
    console.log(`🧪 Running test case: ${testCase.name}`)
    
    const startTime = Date.now()
    const errors: string[] = []
    let success = false
    let stages: any[] = []
    let metrics: any = {}

    try {
      // Import the unified workflow service
      const { default: UnifiedWorkflowService } = await import('./unifiedWorkflowService')
      
      // Create workflow instance with test configuration
      const workflow = new UnifiedWorkflowService(testCase.config)
      
      // Run the workflow
      const result = await Promise.race([
        workflow.analyzeArtwork(testCase.imageBase64),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), testCase.timeout)
        )
      ]) as any

      // Validate results
      const validation = this.validateResult(result, testCase)
      success = validation.success
      errors.push(...validation.errors)
      stages = result.stages || []
      metrics = result.data || {}

    } catch (error) {
      console.error(`❌ Test case failed: ${testCase.name}`, error)
      errors.push(error instanceof Error ? error.message : 'Unknown error')
      success = false
    }

    const duration = Date.now() - startTime
    const recommendations = this.generateRecommendations(testCase, success, errors, duration)

    const testResult: TestResult = {
      testCase: testCase.name,
      success,
      duration,
      stages,
      errors,
      metrics,
      recommendations
    }

    this.results.push(testResult)
    console.log(`${success ? '✅' : '❌'} Test case ${testCase.name} completed in ${duration}ms`)

    return testResult
  }

  // Validate test result against expectations
  private validateResult(result: any, testCase: TestCase): { success: boolean; errors: string[] } {
    const errors: string[] = []

    // Check if workflow completed successfully
    if (!result.success) {
      errors.push('Workflow did not complete successfully')
    }

    // Check expected stages
    if (result.stages) {
      const completedStages = result.stages.map((s: any) => s.stage)
      const missingStages = testCase.expectedStages.filter(stage => !completedStages.includes(stage))
      if (missingStages.length > 0) {
        errors.push(`Missing expected stages: ${missingStages.join(', ')}`)
      }
    }

    // Check expected APIs
    if (result.sources) {
      const usedAPIs = result.sources
      const missingAPIs = testCase.expectedAPIs.filter(api => !usedAPIs.includes(api))
      if (missingAPIs.length > 0) {
        errors.push(`Missing expected APIs: ${missingAPIs.join(', ')}`)
      }
    }

    // Check data quality
    if (result.data) {
      if (!result.data.visionData) {
        errors.push('Missing vision data')
      }
      if (!result.data.initialInsights) {
        errors.push('Missing initial insights')
      }
      if (!result.data.recallData) {
        errors.push('Missing recall data')
      }
      if (!result.data.finalAnalysis) {
        errors.push('Missing final analysis')
      }
    }

    return {
      success: errors.length === 0,
      errors
    }
  }

  // Generate recommendations based on test results
  private generateRecommendations(testCase: TestCase, success: boolean, errors: string[], duration: number): string[] {
    const recommendations: string[] = []

    if (!success) {
      if (errors.some(e => e.includes('timeout'))) {
        recommendations.push('Consider increasing timeout or optimizing API calls')
      }
      if (errors.some(e => e.includes('API'))) {
        recommendations.push('Check API configuration and keys')
      }
      if (errors.some(e => e.includes('Missing'))) {
        recommendations.push('Verify all required services are properly configured')
      }
    }

    if (duration > testCase.timeout * 0.8) {
      recommendations.push('Performance is close to timeout limit - consider optimization')
    }

    if (duration < 1000) {
      recommendations.push('Very fast execution - consider if all APIs are being called')
    }

    return recommendations
  }

  // Run all test cases
  async runAllTests(): Promise<TestSuite> {
    console.log('🧪 Starting comprehensive workflow test suite...')
    
    const startTime = Date.now()
    this.results = []

    // Run all test cases
    for (const testCase of this.testCases) {
      await this.runTestCase(testCase)
    }

    const totalDuration = Date.now() - startTime
    const summary = this.generateSummary()

    console.log(`✅ Test suite completed in ${totalDuration}ms`)
    console.log(`📊 Results: ${summary.passedTests}/${summary.totalTests} tests passed`)

    return {
      name: 'Comprehensive Workflow Test Suite',
      description: 'Tests all aspects of the multistage analysis workflow',
      testCases: this.testCases,
      results: this.results,
      summary
    }
  }

  // Generate test suite summary
  private generateSummary() {
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.success).length
    const failedTests = totalTests - passedTests
    const averageDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests

    // Find common issues
    const allErrors = this.results.flatMap(r => r.errors)
    const errorCounts = allErrors.reduce((acc, error) => {
      acc[error] = (acc[error] || 0) + 1
      return acc
    }, {} as { [key: string]: number })

    const commonIssues = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([error, count]) => `${error} (${count} times)`)

    return {
      totalTests,
      passedTests,
      failedTests,
      averageDuration,
      commonIssues
    }
  }

  // Run specific test cases
  async runTestCases(testNames: string[]): Promise<TestResult[]> {
    const results: TestResult[] = []
    
    for (const testName of testNames) {
      const testCase = this.testCases.find(tc => tc.name === testName)
      if (testCase) {
        const result = await this.runTestCase(testCase)
        results.push(result)
      } else {
        console.warn(`Test case not found: ${testName}`)
      }
    }

    return results
  }

  // Add custom test case
  addTestCase(testCase: TestCase) {
    this.testCases.push(testCase)
  }

  // Get test results
  getResults(): TestResult[] {
    return this.results
  }

  // Get test cases
  getTestCases(): TestCase[] {
    return this.testCases
  }

  // Generate test report
  generateReport(): string {
    const summary = this.generateSummary()
    
    let report = `# Workflow Test Report\n\n`
    report += `## Summary\n`
    report += `- Total Tests: ${summary.totalTests}\n`
    report += `- Passed: ${summary.passedTests}\n`
    report += `- Failed: ${summary.failedTests}\n`
    report += `- Success Rate: ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%\n`
    report += `- Average Duration: ${summary.averageDuration.toFixed(0)}ms\n\n`

    if (summary.commonIssues.length > 0) {
      report += `## Common Issues\n`
      summary.commonIssues.forEach(issue => {
        report += `- ${issue}\n`
      })
      report += `\n`
    }

    report += `## Test Results\n\n`
    this.results.forEach(result => {
      report += `### ${result.testCase}\n`
      report += `- Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}\n`
      report += `- Duration: ${result.duration}ms\n`
      if (result.errors.length > 0) {
        report += `- Errors:\n`
        result.errors.forEach(error => {
          report += `  - ${error}\n`
        })
      }
      if (result.recommendations.length > 0) {
        report += `- Recommendations:\n`
        result.recommendations.forEach(rec => {
          report += `  - ${rec}\n`
        })
      }
      report += `\n`
    })

    return report
  }

  // Export test data
  exportData(): any {
    return {
      timestamp: new Date(),
      testCases: this.testCases,
      results: this.results,
      summary: this.generateSummary()
    }
  }
}

export default new WorkflowTester()
