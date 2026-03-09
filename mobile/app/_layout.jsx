import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { AuthProvider, AuthContext } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { useContext, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NotificationOverlay from "../components/NotificationOverlay";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
        <NotificationOverlay />
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="(tab)" />
            <Stack.Screen name="history" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="support" />
            <Stack.Screen name="terms" />
            <Stack.Screen name="chat-admin" />
            <Stack.Screen name="report-order" />
        </Stack>
    </GestureHandlerRootView>
  );
}


export default function RootLayout() {
  return (
    <SafeAreaProvider>
        <ThemeProvider>
            <AuthProvider>
                <RootLayoutNav />
            </AuthProvider>
        </ThemeProvider>
    </SafeAreaProvider>
  );
}
