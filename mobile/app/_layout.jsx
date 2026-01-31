import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { AuthProvider, AuthContext } from "../context/AuthContext";
import { useContext, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

const RootLayoutNav = () => {
    const { user, isInitialized } = useContext(AuthContext);
    const segments = useSegments();
    const router = useRouter();
    const rootNavigationState = useRootNavigationState();

    useEffect(() => {
      if (!isInitialized) return;
      if (!rootNavigationState?.key) return; // Wait for navigation to be ready

      const inAuthGroup = segments[0] === "(auth)";
      const inTabsGroup = segments[0] === "(tab)";

      // If user is logged in, redirect to home if they are in auth group or on landing page
      if (user && (inAuthGroup || segments.length === 0)) {
        router.replace("/(tab)/home");
      } 
      // If user is NOT logged in:
      else if (!user) {
        // If they are trying to access protected tabs, send to login
        if (inTabsGroup) {
            router.replace("/(auth)/login");
        }
        // If they are deep in auth flow (e.g. cached state) but we want to force Landing on fresh open?
        // The user wants "Open app -> Landing". 
        // We can force replace to "/" if we detect we are not at root and not in tabs.
        // However, this might annoy users actively trying to login.
        // Let's rely on the "initialRouteName" for fresh starts, but explicitly handle the case 
        // where we might be falsely stuck in (auth).
      }
    }, [user, segments, isInitialized, rootNavigationState, router]);

    if (!isInitialized) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09090b'}}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tab)" options={{ headerShown: false }} />
        <Stack.Screen name="history" options={{ headerShown: false }} />
        <Stack.Screen name="support" options={{ headerShown: false }} />
        <Stack.Screen name="terms" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
        <RootLayoutNav />
    </AuthProvider>
  );
}
