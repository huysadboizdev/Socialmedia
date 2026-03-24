import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Assets (Currently commented out because they are missing in the mobile/assets folder)
// import homeIcon from '../../assets/trangchu.png';
// import servicesIcon from '../../assets/alll_list.gif';
// import missionsIcon from '../../assets/điemanh.gif';
// import depositIcon from '../../assets/naptien.png';
// import profileIcon from '../../assets/thongtin.png';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090b', // zinc-950
          borderTopColor: '#27272a', // zinc-800
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#71717a', // zinc-500
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Dịch vụ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          title: 'Nhiệm vụ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="deposit"
        options={{
          title: 'Nạp tiền',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="card-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
