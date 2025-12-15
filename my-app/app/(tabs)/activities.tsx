import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, TouchableWithoutFeedback, FlatList } from 'react-native';
import api, { Activity, Child } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Palette } from '@/constants/theme';
import VideoPlayer from '@/components/media/video-player';
import { GroupKey } from '@/constants/groups';
import { getGroupTheme as getGroupThemeUtil, getGroupKey, getGroupDisplayName } from '@/services/utils/groupUtils';
import { normalizeChildForDisplay } from '@/services/utils/childUtils';
import { normalizeActivityForDisplay } from '@/services/utils/activityUtils';

export default function ActivitiesScreen() {
  const { userRole, parentId } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<GroupKey | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState<{ visible: boolean; uri: string | null }>({ visible: false, uri: null });
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;

  const toDateKey = (iso: string) => new Date(iso).toISOString().slice(0, 10);
  const todayKey = toDateKey(new Date().toISOString());
  const formatDateLabel = (key: string) => {
    if (key === todayKey) return 'I dag';
    const d = new Date(key);
    try {
      return d.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch {
      return d.toDateString();
    }
  };

  const getGroupTheme = (group?: string) => {
    return getGroupThemeUtil(group);
  };

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const groupParam = selectedGroup ? getGroupDisplayName(selectedGroup) : undefined;
      const [firstPage, allChildren] = await Promise.all([
        api.activities.getPage({ limit: pageSize, offset: 0, group: groupParam, date: selectedDate ?? undefined }),
        api.children.getAll(),
      ]);

      const sanitizedChildren = allChildren.map(normalizeChildForDisplay);

      // Filter for guest: only groups their kids belong to
      let filtered = firstPage.items
        .map(normalizeActivityForDisplay)
        .filter((a): a is Activity => Boolean(a));

      if (userRole === 'guest' && parentId != null) {
        const kids = sanitizedChildren.filter(c => c.parentId === parentId);
        const groups = new Set(
          kids
            .map(k => getGroupKey(k.group))
            .filter((g): g is GroupKey => Boolean(g))
        );
        filtered = filtered.filter(a => {
          const key = getGroupKey(a.group);
          return key && groups.has(key);
        });
        setChildren(kids);
      } else {
        setChildren(sanitizedChildren);
      }

      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setActivities(filtered);
      setOffset((firstPage.offset ?? 0) + filtered.length);
      setTotal(firstPage.total);
    } finally {
      setLoading(false);
    }
  }, [userRole, parentId, selectedGroup, selectedDate]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const guestGroups = useMemo(() => {
    if (userRole === 'guest') {
      return Array.from(
        new Set(
          children
            .map(c => getGroupKey(c.group))
            .filter((g): g is GroupKey => Boolean(g))
        )
      );
    }
    return Array.from(
      new Set(
        activities
          .map(a => getGroupKey(a.group))
          .filter((g): g is GroupKey => Boolean(g))
      )
    );
  }, [userRole, children, activities]);

  const availableDates = useMemo(() => {
    const keys = new Set<string>();
    activities.forEach(a => {
      const key = getGroupKey(a.group);
      if (!selectedGroup || (key && key === selectedGroup)) keys.add(toDateKey(a.createdAt));
    });
    return Array.from(keys).sort((a, b) => b.localeCompare(a));
  }, [activities, selectedGroup]);

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const key = getGroupKey(a.group);
      return (!selectedGroup || (key && key === selectedGroup)) && (!selectedDate || toDateKey(a.createdAt) === selectedDate);
    });
  }, [activities, selectedGroup, selectedDate]);

  const loadMore = async () => {
    if (loadingMore) return;
    if (typeof total === 'number' && offset >= total) return;
    try {
      setLoadingMore(true);
      const groupParam = selectedGroup ? getGroupDisplayName(selectedGroup) : undefined;
      const page = await api.activities.getPage({ limit: pageSize, offset, group: groupParam, date: selectedDate ?? undefined });
      let items = page.items
        .map(normalizeActivityForDisplay)
        .filter((a): a is Activity => Boolean(a));
      if (userRole === 'guest' && parentId != null) {
        const kids = children;
        const groups = new Set(
          kids
            .map(k => getGroupKey(k.group))
            .filter((g): g is GroupKey => Boolean(g))
        );
        items = items.filter(a => {
          const key = getGroupKey(a.group);
          return key && groups.has(key);
        });
      }
      setActivities(prev => [...prev, ...items]);
      setOffset((page.offset ?? offset) + items.length);
      setTotal(page.total);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  };

  const renderCard = (a: Activity) => {
    const theme = getGroupTheme(a.group);
    const VP = VideoPlayer as unknown as React.ComponentType<any>;
    return (
      <View key={a.id} style={styles.card}>
        <View style={[styles.groupPill, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <Text style={[styles.groupPillText, { color: theme.text }]}>{a.group}</Text>
        </View>
        <Text style={styles.title}>{a.title}</Text>
        {!!a.description && <Text style={styles.desc}>{a.description}</Text>}
        {/* Ny: render media[] hvis tilgjengelig */}
        {a.media && a.media.map((m, idx) => (
          m.type === 'image' ? (
            <TouchableOpacity key={`${m.url}-${idx}`} onPress={() => setImageModal({ visible: true, uri: m.url })}>
              <Image source={{ uri: m.url }} style={styles.mediaImage} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            <VP
              key={`${m.url}-${idx}`}
              source={{ uri: m.url }}
              style={styles.mediaVideo}
              useNativeControls
              nativeControls
              resizeMode="contain"
              usePoster={!!m.posterUrl}
              posterSource={m.posterUrl ? { uri: m.posterUrl } : undefined}
            />
          )
        ))}
        {/* Legacy-felter som fallback */}
        {!a.media && (
          <>
            {!!a.imageUrl && (
              <TouchableOpacity onPress={() => setImageModal({ visible: true, uri: a.imageUrl! })}>
                <Image source={{ uri: a.imageUrl }} style={styles.mediaImage} resizeMode="cover" />
              </TouchableOpacity>
            )}
            {!!a.videoUrl && (
              <VP source={{ uri: a.videoUrl }} style={styles.mediaVideo} useNativeControls nativeControls resizeMode="contain" />
            )}
          </>
        )}
        <Text style={styles.dateText}>{formatDateLabel(toDateKey(a.createdAt))}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.centeredText}>Laster aktiviteter...</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View>
      <Text style={styles.pageTitle}>Aktiviteter</Text>
      <View style={styles.chipsRow}>
        {guestGroups.map(g => {
          const theme = getGroupTheme(g);
          const active = selectedGroup === g;
          return (
            <TouchableOpacity key={g} style={[styles.chip, { borderColor: active ? Palette.primary : theme.border, backgroundColor: active ? '#FFFFFF' : theme.bg }]} onPress={() => { setSelectedGroup(prev => prev === g ? null : g); setSelectedDate(null); }}>
              <Text style={[styles.chipText, { color: theme.text }]}>{getGroupDisplayName(g)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.chipsRow}>
        {availableDates.map(d => {
          const active = selectedDate === d;
          return (
            <TouchableOpacity key={d} style={[styles.chip, { borderColor: active ? Palette.primary : Palette.border, backgroundColor: '#FFFFFF' }]} onPress={() => setSelectedDate(prev => prev === d ? null : d)}>
              <Text style={styles.chipText}>{formatDateLabel(d)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {filteredActivities.length === 0 && (
        <Text style={styles.empty}>Ingen aktiviteter for valgt filter.</Text>
      )}
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={filteredActivities}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => renderCard(item)}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={typeof total === 'number' && activities.length < total ? (
          <TouchableOpacity style={styles.loadMore} onPress={loadMore} disabled={loadingMore}>
            <Text style={styles.loadMoreText}>{loadingMore ? 'Laster...' : 'Vis mer'}</Text>
          </TouchableOpacity>
        ) : null}
        onEndReachedThreshold={0.3}
        onEndReached={loadMore}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Fullskjerm-bilde med enkel zoom */}
      <Modal visible={imageModal.visible} transparent onRequestClose={() => setImageModal({ visible: false, uri: null })}>
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback onPress={() => setImageModal({ visible: false, uri: null })}>
            <View style={{ flex: 1 }}>
              <ScrollView
                style={styles.modalContent}
                maximumZoomScale={3}
                minimumZoomScale={1}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: Palette.header, marginBottom: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600', color: Palette.text },
  card: { backgroundColor: Palette.card, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: Palette.border },
  title: { fontSize: 16, fontWeight: '700', color: Palette.text, marginBottom: 6 },
  desc: { fontSize: 14, color: Palette.text, marginBottom: 8 },
  groupPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, marginBottom: 6 },
  groupPillText: { fontSize: 12, fontWeight: '700' },
  mediaImage: { width: '100%', height: 220, borderRadius: 10, marginBottom: 8 },
  mediaVideo: { width: '100%', height: 220, borderRadius: 10, backgroundColor: '#000', marginBottom: 8 },
  dateText: { fontSize: 12, color: Palette.textMuted },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.background, padding: 24 },
  centeredText: { marginTop: 8, color: Palette.textMuted },
  empty: { color: Palette.textMuted },
  loadMore: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: Palette.card, borderWidth: 1, borderColor: Palette.border, marginTop: 6 },
  loadMoreText: { color: Palette.text, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' },
  modalContent: { flex: 1 },
  modalImage: { width: '100%', height: '100%' },
});
