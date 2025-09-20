'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error refreshing user:', error);
        setUser(null);
        return;
      }
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Unexpected error refreshing user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Unexpected error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        switch (event) {
          case 'SIGNED_IN':
            setUser(session?.user ?? null);
            setLoading(false);
            // kalau user ada di /login, arahkan ke home
            if (pathname === '/login') {
              router.push('/');
              router.refresh();
            }
            break;

          case 'SIGNED_OUT':
            setUser(null);
            router.push('/login');
            router.refresh();
            break;

          case 'TOKEN_REFRESHED':
            setUser(session?.user ?? null);
            break;

          default:
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        setUser(data.user);
        await refreshUser();
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setUser(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signOut,
    signIn,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};