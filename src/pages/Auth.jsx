import React, { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (!supabase) {
      setError('Connect Supabase first. See .env.example.')
      return
    }

    setBusy(true)

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (signInError) {
      setBusy(false)
      setError(signInError.message)
      return
    }

    // If the user was redirected to login from a protected page,
    // send them back there after login.
    const requestedPath = location.state?.from

    if (requestedPath) {
      setBusy(false)
      navigate(requestedPath, { replace: true })
      return
    }

    // Otherwise, determine where to send them based on role.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Could not load profile:', profileError)
    }

    setBusy(false)

    navigate(
      profile?.role === 'recycler' ? '/marketplace' : '/dashboard',
      { replace: true }
    )
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your Reway marketplace activity."
    >
      <form className="auth-form" onSubmit={submit}>
        <label>
          Work email
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            required
            placeholder="you@company.com"
          />
        </label>

        <label>
          Password
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            required
            placeholder="••••••••"
          />
        </label>

        {error && <div className="error-box">{error}</div>}

        <button className="primary-btn" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account? <Link to="/signup">Create one</Link>
      </p>
    </AuthLayout>
  )
}

export function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const requestedRole = searchParams.get('role')
  const initialRole =
    requestedRole === 'recycler' ? 'recycler' : 'seller'

  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    role: initialRole,
  })

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (key, value) => {
    setForm(current => ({
      ...current,
      [key]: value,
    }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')

    if (!supabase) {
      setError('Connect Supabase first. See .env.example.')
      return
    }

    setBusy(true)

    /*
      IMPORTANT:
      We only create the Supabase Auth user here.

      The profiles row should be created automatically by the
      database trigger "on_auth_user_created".

      Do NOT insert/upsert into profiles here because RLS can block it.
    */
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          company_name: form.company,
          role: form.role,
        },
      },
    })

    if (signUpError) {
      setBusy(false)
      setError(signUpError.message)
      return
    }

    setBusy(false)

    /*
      If Supabase email confirmation is ON,
      the account can be created without creating an active session.
      In that case we send the user to login.
    */
    if (!data.session) {
      navigate('/login', { replace: true })
      return
    }

    /*
      If email confirmation is OFF,
      Supabase gives us a session immediately.
    */
    navigate(
      form.role === 'recycler' ? '/marketplace' : '/dashboard',
      { replace: true }
    )
  }

  return (
    <AuthLayout
      title="Create your Reway account"
      subtitle="Join the digital marketplace for e-waste transactions."
    >
      <form className="auth-form" onSubmit={submit}>
        <label>
          Account type

          <div className="role-picker">
            <button
              type="button"
              className={form.role === 'seller' ? 'selected' : ''}
              onClick={() => update('role', 'seller')}
            >
              <b>Sell e-waste</b>
              <span>List material and receive quotes.</span>
            </button>

            <button
              type="button"
              className={form.role === 'recycler' ? 'selected' : ''}
              onClick={() => update('role', 'recycler')}
            >
              <b>Buy e-waste</b>
              <span>Discover listings and submit quotes.</span>
            </button>
          </div>
        </label>

        <label>
          Full name
          <input
            value={form.name}
            onChange={e => update('name', e.target.value)}
            required
            placeholder="Your name"
          />
        </label>

        <label>
          Company name
          <input
            value={form.company}
            onChange={e => update('company', e.target.value)}
            required
            placeholder="Company name"
          />
        </label>

        <label>
          Work email
          <input
            value={form.email}
            onChange={e => update('email', e.target.value)}
            type="email"
            required
            placeholder="you@company.com"
          />
        </label>

        <label>
          Password
          <input
            value={form.password}
            onChange={e => update('password', e.target.value)}
            type="password"
            minLength="8"
            required
            placeholder="Minimum 8 characters"
          />
        </label>

        {error && <div className="error-box">{error}</div>}

        <button className="primary-btn" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <span className="brand-dot">R</span>
          {' '}
          REWAY
        </Link>

        <div className="auth-heading">
          <span className="eyebrow">MARKETPLACE ACCESS</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="warning-box">
            Supabase is not configured yet. Add your
            {' '}
            <code>VITE_SUPABASE_URL</code>
            {' '}
            and
            {' '}
            <code>VITE_SUPABASE_ANON_KEY</code>
            {' '}
            to
            {' '}
            <code>.env.local</code>.
          </div>
        )}

        {children}
      </div>
    </div>
  )
}