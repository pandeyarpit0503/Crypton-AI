import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { auth } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData?: { full_name?: string }) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signInWithGoogle: () => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ data: any; error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('=== GETTING INITIAL SESSION ===')
      try {
        const { session, error } = await auth.getSession()
        console.log('Initial session result:', { session, error })

        if (error) {
          console.error('Error getting initial session:', error)
        }

        setSession(session)
        setUser(session?.user ?? null)
        console.log('Set initial auth state:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id
        })
      } catch (err) {
        console.error('Exception getting initial session:', err)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    console.log('=== SETTING UP AUTH STATE LISTENER ===')
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGE ===')
        console.log('Event:', event)
        console.log('Session:', session)
        console.log('User:', session?.user)

        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        console.log('Updated auth state:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id
        })
      }
    )

    return () => {
      console.log('=== CLEANING UP AUTH LISTENER ===')
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, userData?: { full_name?: string }) => {
    setLoading(true)
    const result = await auth.signUp(email, password, userData)
    setLoading(false)
    return result
  }

  const signIn = async (email: string, password: string) => {
    console.log('=== SIGNIN ATTEMPT IN CONTEXT ===')
    console.log('Email:', email)

    setLoading(true)

    try {
      const result = await auth.signIn(email, password)
      console.log('Signin result in context:', result)

      if (result.data?.session) {
        console.log('Session received, updating state immediately')
        setSession(result.data.session)
        setUser(result.data.session.user)
      }

      return result
    } catch (err) {
      console.error('Signin error in context:', err)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    const result = await auth.signOut()
    setLoading(false)
    return result
  }

  const signInWithGoogle = async () => {
    console.log('=== GOOGLE SIGNIN IN CONTEXT ===')
    setLoading(true)

    try {
      const result = await auth.signInWithGoogle()
      console.log('Google signin result in context:', result)
      return result
    } catch (err) {
      console.error('Google signin error in context:', err)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    return await auth.resetPassword(email)
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
