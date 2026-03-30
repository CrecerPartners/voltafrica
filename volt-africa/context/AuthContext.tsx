import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import * as SecureStore from "expo-secure-store";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string, university?: string, accountType?: string) => Promise<{ data: any; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: Error | null }>;
  signOut: (options?: { skipRedirect?: boolean }) => Promise<void>;
  verifyOtp: (email: string, token: string, type: "signup" | "email") => Promise<{ error: Error | null }>;
  sendLoginOtp: (email: string) => Promise<{ error: Error | null }>;
  resendLoginOtp: (email: string) => Promise<{ error: Error | null }>;
  resendSignupOtp: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const intentionalSignOut = useRef(false);

  const clearStaleSession = async () => {
    // Clear all Supabase-related keys from SecureStore to remove invalid tokens
    const keys = ["supabase-auth-token", "sb-yaojxewpkrjonrvqpsxi-auth-token"];
    for (const key of keys) {
      try { await SecureStore.deleteItemAsync(key); } catch {}
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Stale token — clear it so the user can log in fresh
        clearStaleSession();
        setSession(null);
        setUser(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        setSession(session);
        setUser(session?.user ?? null);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name?: string, university?: string, accountType?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name || "", university: university || "", account_type: accountType || "" } },
    });
    return { data, error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error: error as Error | null };
  };

  const signOut = async (options?: { skipRedirect?: boolean }) => {
    if (options?.skipRedirect) intentionalSignOut.current = true;
    await supabase.auth.signOut();
    intentionalSignOut.current = false;
  };

  const verifyOtp = async (email: string, token: string, type: "signup" | "email") => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type });
    return { error: error as Error | null };
  };

  const sendLoginOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    return { error: error as Error | null };
  };

  const resendLoginOtp = sendLoginOtp;

  const resendSignupOtp = async (email: string) => {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut, verifyOtp, sendLoginOtp, resendLoginOtp, resendSignupOtp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
