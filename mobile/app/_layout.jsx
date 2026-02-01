import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { AuthProvider, AuthContext } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
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
      const inAdminGroup = segments[0] === "(admin)";
      const inTabsGroup = segments[0] === "(tab)";
      // Check for protected routes outside of groups
      const isProtectedRoute = inTabsGroup || inAdminGroup || segments[0] === "history" || segments[0] === "orders";

      // If user is logged in
      if (user) {
        // Redirect logic based on role
        if (user.role === 'admin') {
            // Admin should perform work in (admin)
            // But if they want to view the app, they can navigate manually.
            // Default redirect:
            if (inAuthGroup || segments.length === 0) {
                 router.replace("/(admin)");
            }
        } else {
            // Normal user
            if (inAuthGroup || inAdminGroup || segments.length === 0) {
                 router.replace("/(tab)/home");
            }
        }
      } 
      // If user is NOT logged in
      else {
        // If they are trying to access protected routes, send to login
        if (isProtectedRoute) {
            router.replace("/(auth)/login");
        }
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
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(tab)" options={{ headerShown: false }} />
        <Stack.Screen name="history" options={{ headerShown: false }} />
        <Stack.Screen name="orders" options={{ headerShown: false }} />
        <Stack.Screen name="support" options={{ headerShown: false }} />
        <Stack.Screen name="terms" options={{ headerShown: false }} />
    </Stack>
  );
}


export default function RootLayout() {
  return (
    <ThemeProvider>
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    </ThemeProvider>
  );
}
