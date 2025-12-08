import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { isAuthenticated, userRole } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!router) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      setTimeout(() => {
        router.replace('/login' as any);
      }, 1);
    } else if (isAuthenticated && !inAuthGroup && segments.length > 0) {
      setTimeout(() => {
        // Naviger til riktig første side basert på brukerrolle
        if (userRole === 'admin') {
          router.replace('/(tabs)/identity' as any);
        } else {
          router.replace('/(tabs)' as any);
        }
      }, 1);
    }
  }, [isAuthenticated, userRole, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
