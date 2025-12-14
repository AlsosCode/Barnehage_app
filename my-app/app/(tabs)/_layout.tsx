import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { userRole } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#003366',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>

      {/* Gjest får index + editinfo */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Stempling',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          href: userRole === 'guest' ? '/(tabs)' : null,
        }}
      />


      <Tabs.Screen
        name="editinfo"
        options={{
          title: 'Kontaktinfo',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="pencil" color={color} />
          ),
          href: userRole === 'guest' ? '/(tabs)/editinfo' : null,
        }}
      />

      {/* Admin-sider */}
      <Tabs.Screen
        name="identity"
        options={{
          title: 'Identity',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.fill.checkmark" size={28} color={color} />
          ),
          href: userRole === 'admin' ? '/(tabs)/identity' : null,
        }}
      />

      <Tabs.Screen
        name="checkin"
        options={{
          title: 'Check-in',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
          href: userRole === 'admin' ? '/(tabs)/checkin' : null,
        }}
      />

      <Tabs.Screen
        name="checkout"
        options={{
          title: 'Check-out',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
          href: userRole === 'admin' ? '/(tabs)/checkout' : null,
        }}
      />

      <Tabs.Screen
        name="createActivity"
        options={{
          title: 'Nytt innlegg',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="square.and.pencil" color={color} />
          ),
          href: userRole === 'admin' ? '/(tabs)/createActivity' : null,
        }}
      />

      <Tabs.Screen
        name="status"
        options={{
          title: 'Oversikt',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
          href: userRole === 'admin' ? '/(tabs)/status' : null,
        }}
      />

      {/* Feed - visible for both guest and admin */}
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="newspaper.fill" color={color} />
          ),
        }}
      />

      {/* Messages - visible for both guest and admin */}
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Meldinger',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="message.fill" color={color} />
          ),
        }}
      />

      {/* Skjulte skjermer */}
      <Tabs.Screen
        name="childinfo"
        options={{
          title: 'Barnets Info',
          href: null,
        }}
      />


      {/* Ny forelder */}
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

