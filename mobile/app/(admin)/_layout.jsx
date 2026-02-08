import { Tabs, useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from '@expo/vector-icons';

export default function AdminLayout() {
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
        router.replace('/(tab)/home');
    }
  }, [user, isLoading]);

  if (isLoading || !user || user.role !== 'admin') {
     return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
     );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600'
        }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
            title: "Trang chủ",
            tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
            )
        }} 
      />
      <Tabs.Screen 
        name="users" 
        options={{ 
            title: "Người Dùng",
            tabBarIcon: ({ color, size }) => (
                <Ionicons name="people" size={size} color={color} />
            )
        }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{ 
            title: "Đơn Hàng",
            tabBarIcon: ({ color, size }) => (
                <Ionicons name="cart" size={size} color={color} />
            )
        }} 
      />
      <Tabs.Screen 
        name="menu" 
        options={{ 
            title: "Menu",
            tabBarIcon: ({ color, size }) => (
                <Ionicons name="grid" size={size} color={color} />
            )
        }} 
      />
      
      {/* Hidden Tabs (accessible via navigation but not on bar) */}
      <Tabs.Screen name="services" options={{ href: null }} />
      <Tabs.Screen name="deposits" options={{ href: null }} />
      <Tabs.Screen name="missions" options={{ href: null }} />
      <Tabs.Screen name="mission-requests" options={{ href: null }} />
      <Tabs.Screen name="withdrawals" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
