import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from "expo-video-thumbnails";

import api from "@/services/api";
import VideoPlayer from "@/components/media/video-player";
import { Palette } from "@/constants/theme";
import { useLogger } from "@/hooks/useLogger";
import { useLocale } from "@/contexts/LocaleContext";
import { GroupKey } from "@/constants/groups";
import {
  getAllGroups,
  getGroupDisplayName,
  getGroupTheme,
} from "@/services/utils/groupUtils";

type LocalMedia = { uri: string; type: "image" | "video"; posterUri?: string };

export default function CreateActivityScreen() {
  const { locale } = useLocale();
  const { log, error: logError } = useLogger("CreateActivityScreen");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<GroupKey | null>(null);
  const [mediaItems, setMediaItems] = useState<LocalMedia[]>([]);
  const [loading, setLoading] = useState(false);

  const isNorwegian = locale === "nb";

  const text = {
    title: isNorwegian ? "Nytt innlegg" : "New post",
    subtitle: isNorwegian
      ? "Del dagens aktiviteter med foreldrene."
      : "Share today’s activities with parents.",
    addPhoto: isNorwegian ? "Legg til bilde" : "Add photo",
    addVideo: isNorwegian ? "Legg til video" : "Add video",
    takePhoto: isNorwegian ? "Ta bilde" : "Take photo",
    recordVideo: isNorwegian ? "Ta video" : "Record video",
    imageLabel: isNorwegian ? "Bilde" : "Image",
    videoLabel: isNorwegian ? "Video" : "Video",
    remove: isNorwegian ? "Fjern" : "Remove",
    titlePlaceholder: isNorwegian
      ? "Tittel på aktivitet (f.eks. Tur til skogen)"
      : "Activity title (e.g. Trip to the forest)",
    descriptionPlaceholder: isNorwegian
      ? "Beskriv hva dere gjorde i dag..."
      : "Describe what you did today...",
    groupLabel: isNorwegian ? "Velg gruppe" : "Select group",
    groupHint: isNorwegian
      ? "Velg hvilken gruppe innlegget gjelder."
      : "Choose which group this post belongs to.",
    publish: isNorwegian ? "Publiser aktivitet" : "Publish activity",
    missingInfoTitle: isNorwegian ? "Mangler informasjon" : "Missing information",
    missingInfoBody: isNorwegian
      ? "Skriv inn både tittel og beskrivelse."
      : "Please enter both a title and a description.",
    missingGroupTitle: isNorwegian ? "Velg gruppe" : "Select group",
    missingGroupBody: isNorwegian
      ? "Velg Blå eller Rød gruppe før du publiserer."
      : "Choose Blue or Red group before publishing.",
    savedTitle: isNorwegian ? "Lagret" : "Saved",
    savedBody: isNorwegian
      ? "Aktiviteten er lagt til i feeden."
      : "The activity has been added to the feed.",
    errorTitle: isNorwegian ? "Feil" : "Error",
    errorBody: isNorwegian
      ? "Kunne ikke lagre aktiviteten. Sjekk at backend kjører og prøv igjen."
      : "Could not save the activity. Check that the backend server is running and try again.",
    permissionTitle: isNorwegian ? "Tillatelse kreves" : "Permission required",
    permissionMediaBody: isNorwegian
      ? "Gi tilgang til bilder og video for å legge ved media."
      : "Allow access to photos and videos to attach media.",
    permissionCameraBody: isNorwegian
      ? "Gi tilgang til kamera for å ta bilde eller video."
      : "Allow access to the camera to take photos or videos.",
  };

  const ensureLibraryPermission = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(text.permissionTitle, text.permissionMediaBody);
      return false;
    }
    return true;
  };

  const ensureCameraPermission = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(text.permissionTitle, text.permissionCameraBody);
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (!(await ensureLibraryPermission())) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      setMediaItems((prev) => [
        ...prev,
        { uri: res.assets[0].uri, type: "image" },
      ]);
    }
  };

  const pickVideo = async () => {
    if (!(await ensureLibraryPermission())) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      let posterUri: string | undefined;
      try {
        const thumb = await VideoThumbnails.getThumbnailAsync(
          res.assets[0].uri,
          { time: 1000 }
        );
        posterUri = thumb.uri;
      } catch {
        // ignore thumbnail errors
      }
      setMediaItems((prev) => [
        ...prev,
        { uri: res.assets[0].uri, type: "video", posterUri },
      ]);
    }
  };

  const takePhoto = async () => {
    if (!(await ensureCameraPermission())) return;
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      setMediaItems((prev) => [
        ...prev,
        { uri: res.assets[0].uri, type: "image" },
      ]);
    }
  };

  const recordVideo = async () => {
    if (!(await ensureCameraPermission())) return;
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      let posterUri: string | undefined;
      try {
        const thumb = await VideoThumbnails.getThumbnailAsync(
          res.assets[0].uri,
          { time: 1000 }
        );
        posterUri = thumb.uri;
      } catch {
        // ignore thumbnail errors
      }
      setMediaItems((prev) => [
        ...prev,
        { uri: res.assets[0].uri, type: "video", posterUri },
      ]);
    }
  };

  const removeMediaAt = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  const isHttpUrl = (u: string) => /^https?:\/\//i.test(u);

  const handleCreateActivity = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(text.missingInfoTitle, text.missingInfoBody);
      return;
    }
    if (!selectedGroup) {
      Alert.alert(text.missingGroupTitle, text.missingGroupBody);
      return;
    }

    const normalizedGroup = getGroupDisplayName(selectedGroup);

    try {
      setLoading(true);
      log("Creating activity", { title, group: normalizedGroup });

      const uploaded: {
        type: "image" | "video";
        url: string;
        posterUrl?: string;
      }[] = [];

      for (const item of mediaItems) {
        const url = isHttpUrl(item.uri)
          ? item.uri
          : await api.media.upload(
              item.uri,
              item.type === "video" ? "video/mp4" : "image/jpeg"
            );

        let posterUrl: string | undefined;
        if (item.type === "video" && item.posterUri) {
          posterUrl = isHttpUrl(item.posterUri)
            ? item.posterUri
            : await api.media.upload(item.posterUri, "image/jpeg");
        }

        uploaded.push({ type: item.type, url, posterUrl });
      }

      const firstImage = uploaded.find((m) => m.type === "image")?.url ?? null;
      const firstVideo = uploaded.find((m) => m.type === "video")?.url ?? null;

      await api.activities.create({
        title: title.trim(),
        description: description.trim(),
        group: normalizedGroup,
        imageUrl: firstImage || undefined,
        videoUrl: firstVideo || undefined,
        media: uploaded.length ? uploaded : undefined,
      });

      Alert.alert(text.savedTitle, text.savedBody);
      setTitle("");
      setDescription("");
      setSelectedGroup(null);
      setMediaItems([]);
      log("Activity created successfully");
    } catch (error) {
      logError("Error creating activity", { error });
      Alert.alert(text.errorTitle, text.errorBody);
    } finally {
      setLoading(false);
    }
  };

  const groups = getAllGroups();

  const renderMediaPreview = (item: LocalMedia, index: number) => {
    const VP = VideoPlayer as unknown as React.ComponentType<any>;
    return (
      <View key={`${item.uri}-${index}`} style={styles.previewBox}>
        {item.type === "image" ? (
          <Image source={{ uri: item.uri }} style={styles.previewImage} />
        ) : (
          <VP
            source={{ uri: item.uri }}
            style={styles.previewVideo}
            useNativeControls
            nativeControls
            resizeMode="contain"
            usePoster={!!item.posterUri}
            posterSource={
              item.posterUri ? { uri: item.posterUri } : undefined
            }
          />
        )}
        <View style={styles.previewFooter}>
          <Text style={styles.previewLabel}>
            {item.type === "image" ? text.imageLabel : text.videoLabel}
          </Text>
          <TouchableOpacity onPress={() => removeMediaAt(index)}>
            <Text style={styles.removeText}>{text.remove}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{text.title}</Text>
      <Text style={styles.subtitle}>{text.subtitle}</Text>

      <View style={styles.groupSection}>
        <Text style={styles.groupLabel}>{text.groupLabel}</Text>
        <View style={styles.groupChipsRow}>
          {groups.map((g) => {
            const active = selectedGroup === g.key;
            const theme = getGroupTheme(g.key);
            return (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.groupChip,
                  {
                    borderColor: active ? Palette.primary : theme.border,
                    backgroundColor: active ? "#FFFFFF" : theme.bg,
                  },
                ]}
                onPress={() =>
                  setSelectedGroup((prev) => (prev === g.key ? null : g.key))
                }
              >
                <Text
                  style={[styles.groupChipText, { color: theme.text }]}
                >
                  {g.displayName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.groupHint}>{text.groupHint}</Text>
      </View>

      <View style={styles.mediaRow}>
        <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
          <Text style={styles.mediaButtonText}>{text.addPhoto}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
          <Text style={styles.mediaButtonText}>{text.addVideo}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
          <Text style={styles.mediaButtonText}>{text.takePhoto}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton} onPress={recordVideo}>
          <Text style={styles.mediaButtonText}>{text.recordVideo}</Text>
        </TouchableOpacity>
      </View>

      {mediaItems.map((m, idx) => renderMediaPreview(m, idx))}

      <TextInput
        style={styles.input}
        placeholder={text.titlePlaceholder}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder={text.descriptionPlaceholder}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateActivity}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{text.publish}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F5F7FB",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#003366",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: "#4B5563",
  },
  groupSection: {
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#111827",
  },
  groupChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  groupChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  groupChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  groupHint: {
    fontSize: 12,
    color: "#6B7280",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d4dd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  multilineInput: {
    textAlignVertical: "top",
    minHeight: 120,
  },
  button: {
    backgroundColor: Palette.primary,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  mediaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  mediaButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  mediaButtonText: {
    color: "#374151",
    fontWeight: "600",
  },
  previewBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 6,
  },
  previewVideo: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    backgroundColor: "#000",
    marginBottom: 6,
  },
  previewLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  previewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  removeText: {
    color: Palette.danger,
    fontWeight: "700",
  },
});
