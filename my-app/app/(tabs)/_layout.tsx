import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>

      {/* Hjem/tab 1 */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      {/* Se barnets info */}
      <Tabs.Screen
        name="childinfo"
        options={{
          title: 'Barnet',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />

      {/* Redigere kontaktinfo */}
      <Tabs.Screen
        name="editinfo"
        options={{
          title: 'Kontaktinfo',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="pencil" color={color} />
          ),
        }}
      />

      {/* Barnehageoversikt */}
      <Tabs.Screen
        name="status"
        options={{
          title: 'Oversikt',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />

      {/* Check-out */}
      <Tabs.Screen
        name="checkout"
        options={{
          title: 'Check-out',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
        }}
      />

      {/* Check-in */}
      <Tabs.Screen
        name="checkin"
        options={{
          title: 'Check-in',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
        }}
      />

      {/* Ny aktivitet */}
      <Tabs.Screen
        name="createActivity"
        options={{
          title: 'Nytt innlegg',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="square.and.pencil" color={color} />
          ),
        }}
      />

      {/* Identity */}
      <Tabs.Screen
        name="identity"
        options={{
          title: 'Identity',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.fill.checkmark" size={28} color={color} />
          ),
        }}
      />

      {/* Ny forelderprofil */}
      <Tabs.Screen
        name="createParent"
        options={{
          title: 'Ny forelder',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="person.crop.circle.badge.plus"
              color={color}
            />
          ),
        }}
      />

    </Tabs>
  );
}
