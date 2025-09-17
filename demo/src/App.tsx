import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomeScreen from './components/HomeScreen'
import ArtworkAnalysisScreen from './components/ArtworkAnalysisScreen'
import ApiStatusScreen from './components/ApiStatusScreen'

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="app">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/analysis" element={<ArtworkAnalysisScreen />} />
          <Route path="/api-status" element={<ApiStatusScreen />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
