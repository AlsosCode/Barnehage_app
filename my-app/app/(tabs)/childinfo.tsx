import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api, { Child } from "@/services/api";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function ChildInfoScreen() {
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams();
  const router = useRouter();
  const childId = params.childId ? parseInt(params.childId as string) : null;

  useEffect(() => {
    if (childId) {
      fetchChildInfo(childId);
    } else {
      setError('Ingen barn valgt');
      setLoading(false);
    }
  }, [childId]);

  const fetchChildInfo = async (id: number) => {
    try {
      setLoading(true);
      const fetchedChild = await api.children.getById(id);
      setChild(fetchedChild);
      setError(null);
    } catch (err) {
      setError('Kunne ikke hente barnets informasjon. Sjekk at serveren kjører.');
      console.error('Error fetching child:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.secondary} />
        <Text style={styles.loadingText}>Laster informasjon...</Text>
      </View>
    );
  }

  if (error || !child) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error || 'Ingen barneinformasjon tilgjengelig'}</Text>
        {childId && (
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchChildInfo(childId)}>
            <Text style={styles.retryText}>Prøv igjen</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Tilbake</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{child.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{child.name}</Text>
          <Text style={styles.group}>{child.group}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasjon</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Alder:</Text>
            <Text style={styles.value}>{child.age} år</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Fødselsdato:</Text>
            <Text style={styles.value}>{formatDate(child.birthDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Avdeling:</Text>
            <Text style={styles.value}>{child.group}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <View style={[styles.statusBadge,
              child.status === 'checked_in' && styles.statusIn,
              child.status === 'checked_out' && styles.statusOut,
              child.status === 'home' && styles.statusHome
            ]}>
              <Text style={styles.statusText}>
                {child.status === 'checked_in' && '✓ Inne'}
                {child.status === 'checked_out' && '✓ Ute'}
                {child.status === 'home' && 'Hjemme'}
              </Text>
            </View>
          </View>
        </View>

        {child.allergies && child.allergies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allergier</Text>
            {child.allergies.map((allergy, index) => (
              <View key={index} style={styles.allergyItem}>
                <Text style={styles.allergyText}>⚠️ {allergy}</Text>
              </View>
            ))}
          </View>
        )}

        {child.checkedInAt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tidspunkter</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Sjekket inn:</Text>
              <Text style={styles.value}>
                {new Date(child.checkedInAt).toLocaleTimeString('nb-NO', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
            {child.checkedOutAt && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Sjekket ut:</Text>
                <Text style={styles.value}>
                  {new Date(child.checkedOutAt).toLocaleTimeString('nb-NO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  header: {
    backgroundColor: Colors.light.primary,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textWhite,
    fontWeight: Typography.fontWeight.semibold,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.avatarBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  avatarText: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textWhite,
  },
  name: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.textWhite,
    marginBottom: Spacing.xs,
  },
  group: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textWhite,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.light.card,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.base,
    color: Colors.light.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  label: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
  },
  value: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  statusIn: {
    backgroundColor: Colors.light.successLight,
  },
  statusOut: {
    backgroundColor: Colors.light.warningLight,
  },
  statusHome: {
    backgroundColor: Colors.light.errorLight,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  allergyItem: {
    backgroundColor: Colors.light.warningLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  allergyText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.warningText,
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryText: {
    color: Colors.light.textWhite,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
