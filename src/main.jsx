import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './app.css'
import { AuthProvider } from './lib/auth'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import LandingPage from './pages/LandingPage'
import { Services, ServicePage } from './pages/Services'
import { Login, Signup } from './pages/Auth'
import Dashboard from './pages/Dashboard'
import { MyListings, Marketplace, BuyMarketplace, SellMarketplace, NewListing } from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import { Orders, OrderDetail } from './pages/Orders'
import Profile from './pages/Profile'

function Private({ children, role }) {
  return (
    <ProtectedRoute role={role}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/services" element={<Services />} />
        <Route path="/e-waste" element={<ServicePage type="e-waste" />} />
        <Route path="/battery-waste" element={<ServicePage type="battery-waste" />} />
        <Route path="/car-scrapping" element={<ServicePage type="car-scrapping" />} />
        <Route path="/e-rickshaw-scrapping" element={<ServicePage type="e-rickshaw-scrapping" />} />

        <Route path="/dashboard" element={<Private><Dashboard /></Private>} />

        {/* Public browsing. Actions inside a listing can still require login. */}
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/buy" element={<BuyMarketplace />} />
        <Route path="/marketplace/sell" element={<SellMarketplace />} />

        <Route path="/my-listings" element={<Private role="seller"><MyListings /></Private>} />
        <Route path="/listings/new" element={<Private role="seller"><NewListing /></Private>} />

        {/* Keep individual listing actions protected for the MVP. */}
        <Route path="/listings/:id" element={<Private><ListingDetail /></Private>} />

        <Route path="/quotes" element={<Private role="recycler"><Dashboard /></Private>} />
        <Route path="/orders" element={<Private><Orders /></Private>} />
        <Route path="/orders/:id" element={<Private><OrderDetail /></Private>} />
        <Route path="/profile" element={<Private><Profile /></Private>} />

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
