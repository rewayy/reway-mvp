import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="loading-screen">Loading Reway…</div>

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const currentRole = profile?.role || user?.user_metadata?.role

  if (role && currentRole && currentRole !== role) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
