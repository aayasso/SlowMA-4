import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomeScreen from './components/HomeScreen'
import ArtworkAnalysisScreen from './components/ArtworkAnalysisScreen'

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
        </Routes>
      </div>
    </Router>
  )
}

export default App
