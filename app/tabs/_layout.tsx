import { Tabs } from 'expo-router';
import { BottomTabBar } from '@/components';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <BottomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="plan" />
      <Tabs.Screen name="checkin" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
