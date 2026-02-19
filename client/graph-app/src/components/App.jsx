import { useState } from 'react'
import Home from './home'
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Trigonometry from './Trigonometry'
import Statistics from './stats'
import CustomFunct from './CustomFunc'
import ODESolver from './ODESolver'
import HelpTutorials from './HelpTutorial'
import Settings from './Settings'
import Calculus from './Calculus'
import LandingPg from './LandingPg'
import Register from './Register'
import Login from './Login'
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider } from '../contexts/AuthContext'
import { isAuthenticated } from '../simulationAPI'

function App() {

  return (
    <>
    <AuthProvider>
      <Router>
        <Routes>     
          {/* Public Routes - Accessible without login */}
          <Route path="/landing-page" element={<LandingPg />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes - Only accessible when logged in */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/graph/trigonometry" 
            element={
              <ProtectedRoute>
                <Trigonometry />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/graph/statistics" 
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/graph/custom" 
            element={
              <ProtectedRoute>
                <CustomFunct />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/help-tutorials" 
            element={
              <ProtectedRoute>
                <HelpTutorials />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/graph/ode" 
            element={
              <ProtectedRoute>
                <ODESolver />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/graph/calculus" 
            element={
              <ProtectedRoute>
                <Calculus />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          
          {/* Conditional Fallback - Inline version */}
          <Route 
            path="*" 
            element={
              isAuthenticated() ? 
                <Navigate to="/" replace /> : 
                <Navigate to="/landing-page" replace />
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
    </>
  )
}

export default App