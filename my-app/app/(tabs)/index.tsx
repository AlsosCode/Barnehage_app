import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import api, { Child, Activity } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Palette } from "@/constants/theme";
import { GroupKey } from "@/constants/groups";
import VideoPlayer from "@/components/media/video-player";
import { ChildStatus } from "@/constants/statuses";
import {
  getStatusLabel as getStatusLabelFromEnum,
  getStatusDescription as getStatusDescriptionFromEnum,
} from "@/services/utils/statusUtils";
import { getGroupTheme, getGroupKey, getGroupDisplayName } from "@/services/utils/groupUtils";
import { normalizeChildForDisplay } from "@/services/utils/childUtils";
import { normalizeActivityForDisplay } from "@/services/utils/activityUtils";

export default function HomeScreen() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeSection, setActiveSection] = useState<"children" | "activities">("children");
  const [selectedGroup, setSelectedGroup] = useState<GroupKey | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState<{ visible: boolean; uri: string | null }>({
    visible: false,
    uri: null,
  });

  const { parentId, userRole } = useAuth();
  const router = useRouter();

  const toDateKey = (iso: string) => new Date(iso).toISOString().slice(0, 10);
  const todayKey = toDateKey(new Date().toISOString());
  const formatDateLabel = (key: string) => {
    if (key === todayKey) return "I dag";
    const d = new Date(key);
    try {
      return d.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" });
    } catch {
      return d.toDateString();
    }
  };

  const getAvailableDatesForGroup = (list: Activity[], group: GroupKey) => {
    const keys = new Set<string>();
    list.forEach((a) => {
      if (getGroupKey(a.group) === group) keys.add(toDateKey(a.createdAt));
    });
    return Array.from(keys).sort((a, b) => b.localeCompare(a));
  };

  const loadData = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        const allChildren = await api.children.getAll();
        if (signal?.aborted) return;

        let relevant = allChildren;
        if (userRole === "guest" && parentId != null) {
          relevant = allChildren.filter((child) => child.parentId === parentId);
        }

        relevant = [...relevant].sort((a, b) => a.name.localeCompare(b.name, "nb-NO"));

        if (signal?.aborted) return;
        const sanitizedChildren = relevant.map(normalizeChildForDisplay);
        setChildren(sanitizedChildren);

        // Hent aktiviteter og filtrer til gyldige grupper og relevante grupper for gjest
        let fetchedActivities: Activity[] = await api.activities.getAll();
        let sanitizedActivities = fetchedActivities
          .map(normalizeActivityForDisplay)
          .filter((a): a is Activity => Boolean(a));

        if (userRole === "guest") {
          const allowedGroupKeys = new Set(
            sanitizedChildren
              .map((c) => getGroupKey(c.group))
              .filter((g): g is GroupKey => Boolean(g))
          );
          sanitizedActivities = sanitizedActivities.filter(
            (a) => getGroupKey(a.group) && allowedGroupKeys.has(getGroupKey(a.group) as GroupKey)
          );
        }

        sanitizedActivities.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        if (signal?.aborted) return;
        setActivities(sanitizedActivities);
      } catch (err) {
        if (signal?.aborted) return;
        console.error("Error fetching home data:", err);
        setError("Kunne ikke hente data. Sjekk nettverk og prøv igjen.");
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [userRole, parentId]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  const getDateLabel = () => {
    const date = new Date();
    try {
      return date.toLocaleDateString("nb-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return date.toDateString();
    }
  };

  const getStatusLabel = (child: Child) => {
    return getStatusLabelFromEnum(child.status);
  };

  const getStatusDescription = (child: Child): string => {
    return getStatusDescriptionFromEnum(child.name, child.status);
  };

  const handleCheckIn = async (child: Child) => {
    try {
      setActionLoadingId(child.id);
      await api.children.checkIn(child.id);
      Alert.alert("Suksess", `${child.name} er sjekket inn.`);
      await loadData();
    } catch (err) {
      console.error("Check-in error:", err);
      Alert.alert("Feil", "Kunne ikke sjekke inn. Prøv igjen.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCheckOut = async (child: Child) => {
    try {
      setActionLoadingId(child.id);
      await api.children.checkOut(child.id);
      Alert.alert("Suksess", `${child.name} er sjekket ut.`);
      await loadData();
    } catch (err) {
      console.error("Check-out error:", err);
      Alert.alert("Feil", "Kunne ikke sjekke ut. Prøv igjen.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkHome = async (child: Child) => {
    try {
      setActionLoadingId(child.id);
      await api.children.update(child.id, {
        status: ChildStatus.HOME,
        checkedInAt: null,
        checkedOutAt: null,
      });
      Alert.alert("Registrert", `${child.name} er meldt hjemme i dag.`);
      await loadData();
    } catch (err) {
      console.error("Mark-home error:", err);
      Alert.alert("Feil", "Kunne ikke oppdatere status. Prøv igjen.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderChildCard = (child: Child) => {
    const statusLabel = getStatusLabel(child);
    const isLoading = actionLoadingId === child.id;

    const mainActionLabel = statusLabel === "inne" ? "Stemple ut" : "Stemple inn";

    const mainActionHandler =
      statusLabel === "inne" ? () => handleCheckOut(child) : () => handleCheckIn(child);

    const initial = child.name.trim().charAt(0).toUpperCase() || "?";
    const ageText = child.age && child.age > 0 ? `${child.age} år` : "";
    const groupKey = getGroupKey(child.group);
    const groupTheme = getGroupTheme(child.group);

    return (
      <View key={child.id} style={styles.childCardWrapper}>
        <View style={styles.childCard}>
          <View style={styles.childInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.childTextContainer}>
              <Text style={styles.childName}>{child.name}</Text>
              <View style={styles.childMetaRow}>
                {ageText ? <Text style={styles.childMeta}>{ageText}</Text> : null}
                <View
                  style={[
                    styles.groupDot,
                    { backgroundColor: groupKey ? groupTheme.text : Palette.border },
                  ]}
                  accessibilityLabel={groupKey ? getGroupDisplayName(groupKey) : "Gruppe ikke satt"}
                />
              </View>
            </View>
          </View>

          <View
            style={[
              styles.statusPill,
              statusLabel === "inne" && styles.statusPillIn,
              statusLabel === "ute" && styles.statusPillOut,
              statusLabel === "hjemme" && styles.statusPillHome,
            ]}
          >
            <Text style={styles.statusPillText}>
              {statusLabel === "inne"
                ? "Inne"
                : statusLabel === "hjemme"
                ? "Hjemme"
                : "Ute"}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.mainActionButton,
              statusLabel === "inne" && styles.mainActionButtonOut,
              statusLabel !== "inne" && styles.mainActionButtonIn,
              isLoading && styles.mainActionButtonDisabled,
            ]}
            onPress={mainActionHandler}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.mainActionText}>{mainActionLabel}</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleMarkHome(child)}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Meld hjemme i dag</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.statusDescription}>{getStatusDescription(child)}</Text>
      </View>
    );
  };

  const renderActivityCard = (activity: Activity) => {
    const theme = getGroupTheme(activity.group);
    const groupKey = getGroupKey(activity.group);
    const groupName = groupKey ? getGroupDisplayName(groupKey) : "";
    const VP = VideoPlayer as unknown as React.ComponentType<any>;
    return (
      <View key={activity.id} style={styles.activityCard}>
        {!!groupName && (
          <View style={[styles.groupPill, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text style={[styles.groupPillText, { color: theme.text }]}>{groupName}</Text>
          </View>
        )}
        <Text style={styles.activityTitle}>{activity.title}</Text>
        {!!activity.description && <Text style={styles.activityDescription}>{activity.description}</Text>}
        {activity.media &&
          activity.media.map((m, idx) =>
            m.type === "image" ? (
              <TouchableOpacity key={`${m.url}-${idx}`} onPress={() => setImageModal({ visible: true, uri: m.url })}>
                <Image source={{ uri: m.url }} style={styles.activityMediaImage} resizeMode="cover" />
              </TouchableOpacity>
            ) : (
              <VP
                key={`${m.url}-${idx}`}
                source={{ uri: m.url }}
                style={styles.activityMediaVideo}
                useNativeControls
                nativeControls
                resizeMode="contain"
                usePoster={!!m.posterUrl}
                posterSource={m.posterUrl ? { uri: m.posterUrl } : undefined}
              />
            )
          )}
        {!activity.media && (
          <>
            {!!activity.imageUrl && (
              <TouchableOpacity onPress={() => setImageModal({ visible: true, uri: activity.imageUrl! })}>
                <Image source={{ uri: activity.imageUrl }} style={styles.activityMediaImage} resizeMode="cover" />
              </TouchableOpacity>
            )}
            {!!activity.videoUrl && (
              <VP source={{ uri: activity.videoUrl }} style={styles.activityMediaVideo} useNativeControls nativeControls resizeMode="contain" />
            )}
          </>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Laster barn...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
          <Text style={styles.retryText}>Prøv igjen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!children || children.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ingen barn registrert for denne brukeren.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.push("/(tabs)/editinfo")}>
          <Text style={styles.retryText}>Legg inn kontaktinfo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isGuest = userRole === "guest";
  const guestGroupKeys = isGuest
    ? (Array.from(
        new Set(
          children
            .map((c) => getGroupKey(c.group))
            .filter((g): g is GroupKey => Boolean(g))
        )
      ) as GroupKey[])
    : [];

  const filteredActivities = activities.filter((a) => {
    const key = getGroupKey(a.group);
    const matchesGroup = !selectedGroup || (key && key === selectedGroup);
    const matchesDate = !selectedDate || toDateKey(a.createdAt) === selectedDate;
    return matchesGroup && matchesDate;
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hjem</Text>
          <Text style={styles.headerSubtitle}>{getDateLabel()}</Text>
        </View>
      </View>

      {isGuest && (
        <View style={styles.quickBlocks}>
          <TouchableOpacity
            style={[styles.quickBlock, activeSection === "children" && styles.quickBlockActive]}
            onPress={() => setActiveSection("children")}
          >
            <Text style={styles.quickBlockTitle}>Mine barn</Text>
            <Text style={styles.quickBlockText}>Se og stemple inn/ut</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBlock, activeSection === "activities" && styles.quickBlockActive]}
            onPress={() => setActiveSection("activities")}
          >
            <Text style={styles.quickBlockTitle}>Hva har de gjort i dag?</Text>
            <Text style={styles.quickBlockText}>Aktiviteter fra barnehagen</Text>
          </TouchableOpacity>
        </View>
      )}

      {(!isGuest || activeSection === "children") && (
        <>
          <Text style={styles.sectionTitle}>Dine barn i dag</Text>
          {children.map(renderChildCard)}
        </>
      )}

      {isGuest && activeSection === "activities" && (
        <>
          <Text style={styles.sectionTitle}>Aktiviteter</Text>

          <View style={styles.chipsRow}>
            {guestGroupKeys.map((g) => {
              const theme = getGroupTheme(g);
              const active = selectedGroup === g;
              return (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.chip,
                    {
                      borderColor: active ? Palette.primary : theme.border,
                      backgroundColor: active ? "#ffffff" : theme.bg,
                    },
                  ]}
                  onPress={() => {
                    setSelectedGroup((prev) => (prev === g ? null : g));
                    setSelectedDate(null);
                  }}
                >
                  <Text style={[styles.chipText, { color: theme.text }]}>{getGroupDisplayName(g)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {!!selectedGroup && (
            <View style={styles.chipsRow}>
              {getAvailableDatesForGroup(activities, selectedGroup).map((d) => {
                const active = selectedDate === d;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[styles.chip, { borderColor: active ? Palette.primary : Palette.border }]}
                    onPress={() => setSelectedDate((prev) => (prev === d ? null : d))}
                  >
                    <Text style={styles.chipText}>{formatDateLabel(d)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {filteredActivities.length === 0 ? (
            <Text style={styles.emptyText}>Ingen aktiviteter for valgt filter.</Text>
          ) : (
            filteredActivities.map(renderActivityCard)
          )}
          <Modal
            visible={imageModal.visible}
            transparent
            onRequestClose={() => setImageModal({ visible: false, uri: null })}
          >
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback onPress={() => setImageModal({ visible: false, uri: null })}>
                <View style={{ flex: 1 }}>
                  <ScrollView
                    style={styles.modalContent}
                    maximumZoomScale={3}
                    minimumZoomScale={1}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                    centerContent
                  >
                    {imageModal.uri && (
                      <Image source={{ uri: imageModal.uri }} style={styles.modalImage} resizeMode="contain" />
                    )}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </Modal>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Palette.header,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Palette.text,
    marginBottom: 12,
  },
  quickBlocks: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  quickBlock: {
    flex: 1,
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    shadowColor: Palette.shadow.color,
    shadowOpacity: Palette.shadow.opacity,
    shadowRadius: Palette.shadow.radius,
    shadowOffset: Palette.shadow.offset,
    elevation: Palette.shadow.elevation,
  },
  quickBlockActive: {
    borderColor: Palette.primary,
  },
  quickBlockTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.header,
    marginBottom: 4,
  },
  quickBlockText: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  childCardWrapper: {
    marginBottom: 16,
  },
  childCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Palette.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: Palette.shadow.color,
    shadowOpacity: Palette.shadow.opacity,
    shadowRadius: Palette.shadow.radius,
    shadowOffset: Palette.shadow.offset,
    elevation: Palette.shadow.elevation,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
  childTextContainer: {
    flexShrink: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: Palette.text,
  },
  childMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  childMeta: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  groupMeta: {
    fontWeight: "700",
  },
  groupDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    minWidth: 70,
    alignItems: "center",
  },
  statusPillIn: { backgroundColor: Palette.statusIn },
  statusPillOut: { backgroundColor: Palette.statusOut },
  statusPillHome: { backgroundColor: Palette.statusHome },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },
  mainActionButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mainActionButtonIn: { backgroundColor: Palette.success },
  mainActionButtonOut: { backgroundColor: Palette.danger },
  mainActionButtonDisabled: {
    opacity: 0.7,
  },
  mainActionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: Palette.card,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  statusDescription: {
    marginTop: 6,
    fontSize: 13,
    color: Palette.textMuted,
  },
  centered: {
    flex: 1,
    backgroundColor: Palette.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#4B5563",
  },
  errorText: {
    fontSize: 15,
    color: "#B91C1C",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    color: Palette.textMuted,
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  groupPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    marginBottom: 6,
  },
  groupPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.text,
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 12,
    color: Palette.textMuted,
    marginBottom: 6,
  },
  activityDescription: {
    fontSize: 14,
    color: Palette.text,
  },
  activityMediaPlaceholder: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  activityMediaText: {
    fontSize: 12,
    color: "#374151",
  },
  activityMediaImage: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginTop: 8,
  },
  activityMediaVideo: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: "#000",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.text,
  },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)" },
  modalContent: { flex: 1 },
  modalImage: { width: "100%", height: "100%" },
});
