import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from "react-native";
import api, { Parent } from "@/services/api";
import { Palette } from "@/constants/theme";
import { ChildStatus } from "@/constants/statuses";
import { getAllGroups, getGroupDisplayName } from "@/services/utils/groupUtils";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";

export default function CreateChildScreen() {
  const { t } = useLocale();
  const { userRole, parentId: authParentId } = useAuth();
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState("");
  const [groupKey, setGroupKey] = useState<string | null>(null);
  const [allergies, setAllergies] = useState("");
  const [status, setStatus] = useState<ChildStatus>(ChildStatus.HOME);
  const [parentId, setParentId] = useState<number | null>(null);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const groups = useMemo(() => getAllGroups(), []);

  useEffect(() => {
    api.parents
      .getAll()
      .then((all) => {
        if (userRole === "guest" && authParentId != null) {
          const own = all.filter((p) => p.id === authParentId);
          setParents(own);
          if (own.length > 0) {
            setParentId(own[0].id);
          }
        } else {
          setParents(all);
        }
      })
      .catch(() => Alert.alert(t("createChild.alert.error")));
  }, [t, userRole, authParentId]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(t('createChild.alert.name'), t('createChild.alert.nameBody'));
      return;
    }
    if (!parentId) {
      Alert.alert(t('createChild.alert.parent'), t('createChild.alert.parentBody'));
      return;
    }
    if (!groupKey) {
      Alert.alert(t('createChild.alert.group'), t('createChild.alert.groupBody'));
      return;
    }
    if (!acceptPrivacy) {
      Alert.alert(t('createChild.alert.consent'), t('createChild.alert.consentBody'));
      return;
    }

    try {
      setLoading(true);
      const parsedAge = age ? Number(age) : undefined;
      await api.children.create({
        name: name.trim(),
        birthDate: birthDate.trim(),
        age: parsedAge,
        group: getGroupDisplayName(groupKey),
        allergies: allergies
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a.length > 0),
        status,
        parentId,
        consentGiven: true,
      } as any);
      Alert.alert(t('createChild.alert.success'));
      setName("");
      setBirthDate("");
      setAge("");
      setGroupKey(null);
      setAllergies("");
      setStatus(ChildStatus.HOME);
      setParentId(null);
      setAcceptPrivacy(false);
    } catch {
      Alert.alert(t('createChild.alert.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('createChild.title')}</Text>
      <Text style={styles.subtitle}>{t('createChild.subtitle')}</Text>

      <Text style={styles.label}>{t('createChild.nameLabel')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('createChild.namePlaceholder')}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>{t('createChild.birthLabel')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('createChild.birthPlaceholder')}
        value={birthDate}
        onChangeText={setBirthDate}
      />

      <Text style={styles.label}>{t('createChild.ageLabel')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('createChild.agePlaceholder')}
        keyboardType="number-pad"
        value={age}
        onChangeText={setAge}
      />

      <Text style={styles.label}>{t('createChild.parentLabel')}</Text>
      <View style={styles.chipRow}>
        {parents.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.chip, parentId === p.id && styles.chipActive]}
            onPress={() => setParentId(p.id)}
          >
            <Text style={[styles.chipText, parentId === p.id && styles.chipTextActive]}>
              {p.name || p.email}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t('createChild.groupLabel')}</Text>
      <View style={styles.chipRow}>
        {groups.map((g) => (
          <TouchableOpacity
            key={g.key}
            style={[styles.chip, groupKey === g.key && styles.chipActive]}
            onPress={() => setGroupKey(g.key)}
          >
            <Text style={[styles.chipText, groupKey === g.key && styles.chipTextActive]}>{g.displayName}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t('createChild.statusLabel')}</Text>
      <View style={styles.chipRow}>
        {[
          { key: ChildStatus.HOME, label: t('createChild.status.home') },
          { key: ChildStatus.CHECKED_IN, label: t('createChild.status.in') },
          { key: ChildStatus.CHECKED_OUT, label: t('createChild.status.out') },
        ].map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.chip, status === s.key && styles.chipActive]}
            onPress={() => setStatus(s.key)}
          >
            <Text style={[styles.chipText, status === s.key && styles.chipTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t('createChild.allergiesLabel')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('createChild.allergiesPlaceholder')}
        value={allergies}
        onChangeText={setAllergies}
      />

      <TouchableOpacity
        style={[styles.checkboxRow]}
        onPress={() => setAcceptPrivacy((v) => !v)}
      >
        <View style={[styles.checkbox, acceptPrivacy && styles.checkboxChecked]}>
          {acceptPrivacy && <Text style={styles.checkboxTick}>?</Text>}
        </View>
        <Text style={styles.checkboxLabel}>
          {t('createChild.consent')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        style={[styles.button, (loading || !acceptPrivacy) && styles.buttonDisabled]}
        disabled={loading || !acceptPrivacy}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('createChild.save')}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Palette.background,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Palette.header,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Palette.textMuted,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d4dd',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Palette.card,
    fontSize: 14,
    color: Palette.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  chipActive: {
    borderColor: Palette.primary,
    backgroundColor: '#E0E7FF',
  },
  chipText: {
    color: Palette.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Palette.primary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  checkboxTick: {
    color: '#fff',
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    color: Palette.text,
    fontSize: 14,
  },
  button: {
    backgroundColor: Palette.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
