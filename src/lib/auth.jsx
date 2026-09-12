import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    async function initialiseAuth() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    }

    initialiseAuth()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !session?.user) {
      setProfile(null)
      return
    }

    let cancelled = false

    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile(data || null)
      })

    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    profile,
    loading,
    signOut: () => supabase?.auth.signOut(),
  }), [session, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
