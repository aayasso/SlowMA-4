import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import apiService from '../services/apiService'
import './ApiStatusScreen.css'

interface ApiStatus {
  [key: string]: boolean
}

const ApiStatusScreen: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({})
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkApiStatus = async () => {
    setLoading(true)
    try {
      const status = await apiService.checkApiStatus()
      setApiStatus(status)
      setLastChecked(new Date())
    } catch (error) {
      console.error('Failed to check API status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  const getApiInfo = (apiName: string) => {
    const apiInfo = {
      googleVision: {
        name: 'Google Vision API',
        description: 'Advanced image analysis and object detection',
        required: true,
        cost: 'Pay per request'
      },
      microsoftVision: {
        name: 'Microsoft Computer Vision',
        description: 'Image analysis, OCR, and object detection',
        required: true,
        cost: 'Pay per request'
      },
      artInstitute: {
        name: 'Art Institute of Chicago',
        description: 'Free access to art collection data',
        required: false,
        cost: 'Free'
      },
      openai: {
        name: 'OpenAI GPT-4',
        description: 'AI-powered artistic analysis and insights',
        required: false,
        cost: 'Pay per token'
      },
      rijksmuseum: {
        name: 'Rijksmuseum API',
        description: 'Dutch art collection and metadata',
        required: false,
        cost: 'Free'
      },
      metMuseum: {
        name: 'Metropolitan Museum of Art',
        description: 'Extensive art collection database',
        required: false,
        cost: 'Free'
      },
      wikipedia: {
        name: 'Wikipedia API',
        description: 'Educational content and context',
        required: false,
        cost: 'Free'
      }
    }

    return apiInfo[apiName as keyof typeof apiInfo] || {
      name: apiName,
      description: 'Unknown API',
      required: false,
      cost: 'Unknown'
    }
  }

  const getStatusIcon = (isAvailable: boolean, isRequired: boolean) => {
    if (isAvailable) {
      return <CheckCircle size={20} color="#10B981" />
    } else if (isRequired) {
      return <XCircle size={20} color="#EF4444" />
    } else {
      return <AlertCircle size={20} color="#F59E0B" />
    }
  }

  const getStatusText = (isAvailable: boolean, isRequired: boolean) => {
    if (isAvailable) {
      return 'Available'
    } else if (isRequired) {
      return 'Required - Not Configured'
    } else {
      return 'Optional - Not Configured'
    }
  }

  const getStatusClass = (isAvailable: boolean, isRequired: boolean) => {
    if (isAvailable) {
      return 'status-available'
    } else if (isRequired) {
      return 'status-required'
    } else {
      return 'status-optional'
    }
  }

  const availableCount = Object.values(apiStatus).filter(Boolean).length
  const totalCount = Object.keys(apiStatus).length

  return (
    <div className="api-status-screen">
      <div className="header">
        <h1>API Status Dashboard</h1>
        <button 
          onClick={checkApiStatus} 
          disabled={loading}
          className="refresh-button"
        >
          <RefreshCw size={20} className={loading ? 'spinning' : ''} />
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      <div className="summary">
        <div className="summary-card">
          <h3>API Status Summary</h3>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-number">{availableCount}</span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat">
              <span className="stat-number">{totalCount - availableCount}</span>
              <span className="stat-label">Not Configured</span>
            </div>
            <div className="stat">
              <span className="stat-number">{totalCount}</span>
              <span className="stat-label">Total APIs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="api-list">
        {Object.entries(apiStatus).map(([apiName, isAvailable]) => {
          const info = getApiInfo(apiName)
          const isRequired = info.required
          
          return (
            <div key={apiName} className="api-card">
              <div className="api-header">
                <div className="api-name">
                  {getStatusIcon(isAvailable, isRequired)}
                  <h3>{info.name}</h3>
                </div>
                <div className={`api-status ${getStatusClass(isAvailable, isRequired)}`}>
                  {getStatusText(isAvailable, isRequired)}
                </div>
              </div>
              
              <div className="api-details">
                <p className="api-description">{info.description}</p>
                <div className="api-meta">
                  <span className="api-cost">Cost: {info.cost}</span>
                  <span className={`api-requirement ${isRequired ? 'required' : 'optional'}`}>
                    {isRequired ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {lastChecked && (
        <div className="last-checked">
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}

      <div className="setup-instructions">
        <h3>Setup Instructions</h3>
        <p>
          To configure additional APIs, add your API keys to the <code>.env</code> file in the demo directory.
          Copy <code>env.example</code> to <code>.env</code> and add your keys.
        </p>
        <div className="required-apis">
          <h4>Required APIs (at least one needed):</h4>
          <ul>
            <li>Google Vision API - For basic image analysis</li>
            <li>Microsoft Computer Vision - Alternative image analysis</li>
            <li>Art Institute of Chicago - Always available (free)</li>
          </ul>
        </div>
        <div className="optional-apis">
          <h4>Optional APIs (enhance analysis):</h4>
          <ul>
            <li>OpenAI GPT-4 - AI-powered artistic insights</li>
            <li>Rijksmuseum API - Dutch art collection (FREE)</li>
            <li>Metropolitan Museum of Art - Extensive art database (FREE)</li>
            <li>Wikipedia API - Educational content (FREE)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ApiStatusScreen
