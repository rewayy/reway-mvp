import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function AppShell({ children }) {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()
  const role = profile?.role || user?.user_metadata?.role || 'seller'

  const links = role === 'recycler'
    ? [
        ['/marketplace', 'Marketplace'],
        ['/quotes', 'My Quotes'],
        ['/orders', 'Orders'],
        ['/profile', 'Profile'],
      ]
    : [
        ['/dashboard', 'Overview'],
        ['/my-listings', 'My Listings'],
        ['/marketplace', 'Marketplace'],
        ['/orders', 'Orders'],
        ['/profile', 'Profile'],
      ]

  async function logout() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="app-brand">
          <span className="brand-dot">R</span>
          <span>REWAY</span>
        </Link>

        <div className="workspace-label">WORKSPACE</div>

        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/dashboard'}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {(profile?.full_name || user?.email || 'R')[0].toUpperCase()}
            </div>

            <div>
              <b>{profile?.full_name || user?.email || 'Reway user'}</b>
              <small>{role}</small>
            </div>
          </div>

          <button className="logout" onClick={logout}>Sign out</button>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <div>
            <span className="eyebrow">REWAY MARKETPLACE</span>
            <h1>{role === 'recycler' ? 'Recycler workspace' : 'Seller workspace'}</h1>
          </div>

          <div className="top-actions">
            <span className="verified-pill">● Account active</span>
            <Link className="view-site" to="/">View website ↗</Link>
          </div>
        </header>

        <div className="app-content">{children}</div>
      </main>
    </div>
  )
}
