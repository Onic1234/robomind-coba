import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

let sessionShared: Session | null = null;
const listeners = new Set<(session: Session | null) => void>();

// Subscribe to auth state updates from Supabase globally
supabase.auth.getSession().then(({ data: { session } }) => {
  sessionShared = session;
  listeners.forEach((listener) => listener(session));
});

supabase.auth.onAuthStateChange((_event, session) => {
  sessionShared = session;
  listeners.forEach((listener) => listener(session));
});

export const authState = {
  session: () => sessionShared,
  subscribe: (listener: (session: Session | null) => void) => {
    listeners.add(listener);
    // Initialize listener with current value
    listener(sessionShared);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(sessionShared);

  useEffect(() => {
    return authState.subscribe(setSession);
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const updateChildName = async (newName: string) => {
    if (!session) return;
    const { data, error } = await supabase.auth.updateUser({
      data: { child_name: newName },
    });
    if (error) {
      throw error;
    }
    return data;
  };

  const updateAvatarUrl = async (url: string) => {
    if (!session) return;
    const { data, error } = await supabase.auth.updateUser({
      data: { avatar_url: url },
    });
    if (error) {
      throw error;
    }
    return data;
  };

  return {
    isLoggedIn: !!session,
    session,
    user: session?.user || null,
    childName: session?.user?.user_metadata?.child_name || 
      (session?.user?.email 
        ? session.user.email.split("@")[0].charAt(0).toUpperCase() + session.user.email.split("@")[0].slice(1) 
        : "Aira"),
    avatarUrl: session?.user?.user_metadata?.avatar_url || null,
    login,
    logout,
    updateChildName,
    updateAvatarUrl,
  };
}
