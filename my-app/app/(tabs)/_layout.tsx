import { Tabs, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/contexts/AuthContext";
import { Palette } from "@/constants/theme";
import { useLocale } from "@/contexts/LocaleContext";

export default function TabLayout() {
  const { userRole, logout } = useAuth();
  const router = useRouter();
  const { t, toggleLocale } = useLocale();

  const handleLogout = () => {
    logout();
    router.replace('/login' as any);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Palette.header,
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: Palette.border,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: userRole === 'admin',
        headerStyle: {
          backgroundColor: Palette.header,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleLocale} style={styles.langButton}>
              <Text style={styles.langText}>{t('locale.toggle')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logg ut</Text>
            </TouchableOpacity>
          </View>
        ),
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab.stamping'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          href: userRole === 'guest' ? '/(tabs)' : null,
        }}
      />

      <Tabs.Screen
        name="editinfo"
        options={{
          title: t('tab.contact'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="pencil" color={color} />
          ),
          href: userRole === 'guest' ? '/(tabs)/editinfo' : null,
        }}
      />

      <Tabs.Screen
        name="status"
        options={{
          title: t('tab.overview'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
          href: userRole === 'admin' ? '/(tabs)/status' : null,
        }}
      />

      <Tabs.Screen
        name="identity"
        options={{
          title: t('tab.identity'),
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.fill.checkmark" size={28} color={color} />
          ),
          href: userRole === 'admin' ? '/(tabs)/identity' : null,
        }}
      />

      <Tabs.Screen
        name="checkin"
        options={{
          title: t('tab.checkin'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
          href: userRole === 'admin' ? '/(tabs)/checkin' : null,
        }}
      />

      <Tabs.Screen
        name="checkout"
        options={{
          title: t('tab.checkout'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
          href: userRole === 'admin' ? '/(tabs)/checkout' : null,
        }}
      />

      <Tabs.Screen
        name="createActivity"
        options={{
          title: t('tab.newPost'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="square.and.pencil" color={color} />
          ),
          href: userRole === 'admin' ? '/(tabs)/createActivity' : null,
        }}
      />

      <Tabs.Screen
        name="createchild"
        options={{
          title: t('tab.newChild'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.2.fill" color={color} />
          ),
          href: userRole ? '/(tabs)/createchild' : null,
        }}
      />

      <Tabs.Screen
        name="activities"
        options={{
          title: t('tab.activities'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="photo.on.rectangle" color={color} />
          ),
          href: '/(tabs)/activities',
        }}
      />

      <Tabs.Screen
        name="createparent"
        options={{
          title: t('tab.newParent'),
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="person.crop.circle.badge.plus"
              color={color}
            />
          ),
          href: userRole === 'admin' ? '/(tabs)/createparent' : null,
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: 'Meldinger',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="bubble.left.and.bubble.right.fill" color={color} />
          ),
          href: userRole ? '/(tabs)/messages' : null,
        }}
      />

      <Tabs.Screen
        name="childinfo"
        options={{
          title: 'Barnets Info',
          href: null,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 10,
  },
  langButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  langText: {
    color: Palette.header,
    fontWeight: '700',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
