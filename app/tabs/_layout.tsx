import { Tabs } from 'expo-router';
import { BottomTabBar } from '@/components';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <BottomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="checkin" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="plan" options={{ href: null }} />
    </Tabs>
  );
}
