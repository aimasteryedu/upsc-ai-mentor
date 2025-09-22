import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { Navigation } from "./src/navigation";
import { supabase } from "./src/lib/supabase";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user role
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          setUserRole(userData?.role || 'learner');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        // Tell the application to render
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user role
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          setUserRole(userData?.role || 'learner');
        } else {
          setUser(null);
          setUserRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (!isReady) {
    return null; // Show splash screen
  }

  return (
    <SafeAreaProvider>
      <Navigation />
    </SafeAreaProvider>
  );
}
