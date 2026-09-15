import React, { useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import {
  supabase,
  isSupabaseConfigured,
} from '../lib/supabase'


// ============================================================
// LOGIN
// ============================================================

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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

      // Give a clearer message when the email has not been verified yet
      if (
        signInError.message
          ?.toLowerCase()
          .includes('email not confirmed')
      ) {
        setError(
          'Your email has not been verified yet. Please check your inbox and confirm your email before signing in.'
        )
      } else {
        setError(signInError.message)
      }

      return
    }


    // If the user originally tried to access a protected page,
    // return them there after login.
    const requestedPath = location.state?.from

    if (requestedPath) {
      setBusy(false)
      navigate(requestedPath, { replace: true })
      return
    }


    // Otherwise determine the user's role.
    const { data: profile, error: profileError } =
      await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()


    if (profileError) {
      console.error(
        'Could not load profile:',
        profileError
      )
    }


    setBusy(false)


    // Recycler → Marketplace
    // Seller → Dashboard
    navigate(
      profile?.role === 'recycler'
        ? '/marketplace'
        : '/dashboard',
      { replace: true }
    )
  }


  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your Reway marketplace activity."
    >

      <form
        className="auth-form"
        onSubmit={submit}
      >

        {/* EMAIL */}

        <label>
          Email address

          <input
            value={email}
            onChange={e =>
              setEmail(e.target.value)
            }
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>


        {/* PASSWORD */}

        <label>
          Password

          <input
            value={password}
            onChange={e =>
              setPassword(e.target.value)
            }
            type={
              showPassword
                ? 'text'
                : 'password'
            }
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </label>


        {/* SHOW PASSWORD */}

        <label className="show-password">

          <input
            type="checkbox"
            checked={showPassword}
            onChange={e =>
              setShowPassword(
                e.target.checked
              )
            }
          />

          <span>
            Show password
          </span>

        </label>


        {/* ERROR */}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}


        {/* LOGIN */}

        <button
          className="primary-btn"
          disabled={busy}
        >
          {busy
            ? 'Signing in…'
            : 'Sign in'}
        </button>

      </form>


      <p className="auth-switch">

        Don't have an account?{' '}

        <Link to="/signup">
          Create one
        </Link>

      </p>

    </AuthLayout>
  )
}



// ============================================================
// SIGNUP
// ============================================================

export function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()


  // ------------------------------------------------------------
  // ROLE FROM URL
  // ------------------------------------------------------------
  //
  // /signup?role=seller
  // /signup?role=recycler
  //

  const requestedRole =
    searchParams.get('role')

  const initialRole =
    requestedRole === 'recycler'
      ? 'recycler'
      : 'seller'


  // ------------------------------------------------------------
  // FORM
  // ------------------------------------------------------------

  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    role: initialRole,
  })


  // Confirm password
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')


  // Show/hide passwords
  const [
    showPassword,
    setShowPassword,
  ] = useState(false)


  // ------------------------------------------------------------
  // EMAIL VERIFICATION
  // ------------------------------------------------------------

  const [
    verificationEmail,
    setVerificationEmail,
  ] = useState('')


  const [
    resendMessage,
    setResendMessage,
  ] = useState('')


  const [
    resendBusy,
    setResendBusy,
  ] = useState(false)


  // ------------------------------------------------------------
  // GENERAL STATE
  // ------------------------------------------------------------

  const [error, setError] =
    useState('')

  const [busy, setBusy] =
    useState(false)


  const update = (key, value) => {

    setForm(current => ({
      ...current,
      [key]: value,
    }))

  }



  // ============================================================
  // CREATE ACCOUNT
  // ============================================================

  async function submit(e) {

    e.preventDefault()

    setError('')
    setResendMessage('')


    // ----------------------------------------------------------
    // PASSWORD VALIDATION
    // ----------------------------------------------------------

    if (form.password.length < 8) {

      setError(
        'Password must be at least 8 characters.'
      )

      return

    }


    if (
      form.password !==
      confirmPassword
    ) {

      setError(
        'Passwords do not match.'
      )

      return

    }


    // ----------------------------------------------------------
    // SUPABASE CHECK
    // ----------------------------------------------------------

    if (!supabase) {

      setError(
        'Connect Supabase first. See .env.example.'
      )

      return

    }


    setBusy(true)


    // ----------------------------------------------------------
    // CREATE SUPABASE AUTH USER
    // ----------------------------------------------------------
    //
    // IMPORTANT:
    //
    // We only create the Auth user here.
    //
    // The profiles row is created by your
    // Supabase database trigger:
    //
    // on_auth_user_created
    //
    // Do NOT upsert into profiles here.
    // ----------------------------------------------------------

    const {
      data,
      error: signUpError,
    } =
      await supabase.auth.signUp({

        email: form.email,

        password: form.password,

        options: {

          data: {

            full_name:
              form.name,

            company_name:
              form.company,

            role:
              form.role,

          },

        },

      })


    // ----------------------------------------------------------
    // SIGNUP ERROR
    // ----------------------------------------------------------

    if (signUpError) {

      setBusy(false)

      setError(
        signUpError.message
      )

      return

    }


    setBusy(false)


    // ----------------------------------------------------------
    // EMAIL VERIFICATION REQUIRED
    // ----------------------------------------------------------
    //
    // When Supabase email confirmation is enabled,
    // data.session will be null.
    //
    // Instead of immediately sending the user to login,
    // show the verification screen.
    // ----------------------------------------------------------

    if (!data.session) {

      setVerificationEmail(
        form.email
      )

      return

    }


    // ----------------------------------------------------------
    // EMAIL CONFIRMATION DISABLED
    // ----------------------------------------------------------
    //
    // If confirmation is disabled, Supabase gives us
    // a session immediately.
    // ----------------------------------------------------------

    navigate(

      form.role === 'recycler'
        ? '/marketplace'
        : '/dashboard',

      { replace: true }

    )

  }



  // ============================================================
  // RESEND VERIFICATION EMAIL
  // ============================================================

  async function resendVerificationEmail() {

    setError('')
    setResendMessage('')


    if (
      !supabase ||
      !verificationEmail
    ) {
      return
    }


    setResendBusy(true)


    const {
      error: resendError,
    } =
      await supabase.auth.resend({

        type: 'signup',

        email:
          verificationEmail,

      })


    setResendBusy(false)


    if (resendError) {

      setError(
        resendError.message
      )

      return

    }


    setResendMessage(
      'Verification email sent again. Please check your inbox.'
    )

  }



  // ============================================================
  // EMAIL VERIFICATION SCREEN
  // ============================================================

  if (verificationEmail) {

    return (

      <AuthLayout

        title="Check your email"

        subtitle="Verify your email address to activate your Reway account."

      >

        <div className="verification-box">


          {/* ICON */}

          <div
            className="verification-icon"
            aria-hidden="true"
          >
            ✉
          </div>


          {/* MESSAGE */}

          <h3>
            Verification email sent
          </h3>


          <p>
            We've sent a verification link to:
          </p>


          <strong className="verification-email">
            {verificationEmail}
          </strong>


          <p>
            Click the verification link in the
            email to confirm your address and
            activate your Reway account.
          </p>


          <p className="verification-note">

            Didn't receive it? Check your spam
            or junk folder, or resend the email.

          </p>


          {/* ERROR */}

          {error && (

            <div className="error-box">

              {error}

            </div>

          )}


          {/* RESEND SUCCESS */}

          {resendMessage && (

            <div className="success-box">

              {resendMessage}

            </div>

          )}


          {/* SIGN IN */}

          <Link
            to="/login"
            className="primary-btn"
          >

            Go to sign in

          </Link>


          {/* RESEND */}

          <button

            type="button"

            className="secondary-btn"

            disabled={resendBusy}

            onClick={
              resendVerificationEmail
            }

          >

            {
              resendBusy
                ? 'Sending…'
                : 'Resend verification email'
            }

          </button>


          {/* WRONG EMAIL */}

          <button

            type="button"

            className="auth-text-button"

            onClick={() => {

              setVerificationEmail('')
              setResendMessage('')
              setError('')

            }}

          >

            Used the wrong email? Go back

          </button>


        </div>

      </AuthLayout>

    )

  }



  // ============================================================
  // SIGNUP FORM
  // ============================================================

  return (

    <AuthLayout

      title="Create your Reway account"

      subtitle="Join the digital marketplace for e-waste transactions."

    >

      <form

        className="auth-form"

        onSubmit={submit}

      >


        {/* ======================================================
            ACCOUNT TYPE
        ====================================================== */}

        <label>

          Account type


          <div className="role-picker">


            {/* SELLER */}

            <button

              type="button"

              className={
                form.role === 'seller'
                  ? 'selected'
                  : ''
              }

              onClick={() =>
                update(
                  'role',
                  'seller'
                )
              }

            >

              <b>
                Sell e-waste
              </b>

              <span>
                List material and receive quotes.
              </span>

            </button>



            {/* RECYCLER */}

            <button

              type="button"

              className={
                form.role === 'recycler'
                  ? 'selected'
                  : ''
              }

              onClick={() =>
                update(
                  'role',
                  'recycler'
                )
              }

            >

              <b>
                Buy e-waste
              </b>

              <span>
                Discover listings and submit quotes.
              </span>

            </button>


          </div>

        </label>



        {/* ======================================================
            FULL NAME
        ====================================================== */}

        <label>

          Full name

          <input

            value={form.name}

            onChange={e =>
              update(
                'name',
                e.target.value
              )
            }

            required

            autoComplete="name"

            placeholder="Your name"

          />

        </label>



        {/* ======================================================
            COMPANY
        ====================================================== */}

        <label>

          Company name

          <input

            value={form.company}

            onChange={e =>
              update(
                'company',
                e.target.value
              )
            }

            required

            autoComplete="organization"

            placeholder="Company name"

          />

        </label>



        {/* ======================================================
            EMAIL
        ====================================================== */}

        <label>

          Email address

          <input

            value={form.email}

            onChange={e =>
              update(
                'email',
                e.target.value
              )
            }

            type="email"

            required

            autoComplete="email"

            placeholder="you@example.com"

          />

        </label>



        {/* ======================================================
            PASSWORD
        ====================================================== */}

        <label>

          Password

          <input

            value={form.password}

            onChange={e =>
              update(
                'password',
                e.target.value
              )
            }

            type={
              showPassword
                ? 'text'
                : 'password'
            }

            minLength="8"

            required

            autoComplete="new-password"

            placeholder="Minimum 8 characters"

          />

        </label>



        {/* ======================================================
            CONFIRM PASSWORD
        ====================================================== */}

        <label>

          Confirm password

          <input

            value={
              confirmPassword
            }

            onChange={e =>
              setConfirmPassword(
                e.target.value
              )
            }

            type={
              showPassword
                ? 'text'
                : 'password'
            }

            minLength="8"

            required

            autoComplete="new-password"

            placeholder="Re-enter your password"

          />

        </label>



        {/* ======================================================
            SHOW PASSWORD
        ====================================================== */}

        <label className="show-password">

          <input

            type="checkbox"

            checked={
              showPassword
            }

            onChange={e =>
              setShowPassword(
                e.target.checked
              )
            }

          />

          <span>
            Show passwords
          </span>

        </label>



        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="error-box">

            {error}

          </div>

        )}



        {/* ======================================================
            CREATE ACCOUNT
        ====================================================== */}

        <button

          className="primary-btn"

          disabled={busy}

        >

          {
            busy
              ? 'Creating…'
              : 'Create account'
          }

        </button>


      </form>



      <p className="auth-switch">

        Already have an account?{' '}

        <Link to="/login">

          Sign in

        </Link>

      </p>


    </AuthLayout>

  )

}



// ============================================================
// SHARED AUTH LAYOUT
// ============================================================

function AuthLayout({
  title,
  subtitle,
  children,
}) {

  return (

    <div className="auth-page">

      <div className="auth-card">


        {/* LOGO */}

        <Link
          to="/"
          className="auth-logo"
        >

          <span className="brand-dot">
            R
          </span>

          {' '}

          REWAY

        </Link>



        {/* HEADING */}

        <div className="auth-heading">

          <span className="eyebrow">
            MARKETPLACE ACCESS
          </span>

          <h1>
            {title}
          </h1>

          <p>
            {subtitle}
          </p>

        </div>



        {/* SUPABASE CONFIG WARNING */}

        {!isSupabaseConfigured && (

          <div className="warning-box">

            Supabase is not configured yet.
            Add your{' '}

            <code>
              VITE_SUPABASE_URL
            </code>

            {' '}and{' '}

            <code>
              VITE_SUPABASE_ANON_KEY
            </code>

            {' '}to your environment variables.

          </div>

        )}



        {children}


      </div>

    </div>

  )

}