import { GROUP_DEFINITIONS, DEFAULT_GROUP, GroupKey } from "@/constants/groups";

export interface GroupTheme {
  text: string;
  bg: string;
  border: string;
}

/**
 * Normalize a group string to an internal key ("bla" | "rod")
 */
export function normalizeGroupName(group: string | undefined): string {
  if (!group) return "";
  const lower = group.toLowerCase();
  const ascii = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleaned = ascii.replace(/[^a-z]/g, "");

  if (cleaned.includes("bla")) return "bla";
  if (cleaned.includes("rod") || cleaned.includes("red")) return "rod";

  for (const [key, def] of Object.entries(GROUP_DEFINITIONS)) {
    const normalizedKeywords = def.keywords.map((k) =>
      k
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    );
    if (normalizedKeywords.some((k) => cleaned.includes(k.replace(/[^a-z]/g, "")) || ascii.includes(k))) {
      return key;
    }
  }

  return "";
}

export function getGroupKey(group: string | undefined): GroupKey | null {
  const normalized = normalizeGroupName(group);
  return (normalized && normalized in GROUP_DEFINITIONS ? (normalized as GroupKey) : null);
}

export function getGroupTheme(group: string | undefined): GroupTheme {
  const key = getGroupKey(group);
  const groupDef = key ? GROUP_DEFINITIONS[key] : undefined;
  return groupDef?.colors || DEFAULT_GROUP.colors;
}

export function getGroupTextStyle(group: string | undefined): { color: string } {
  return { color: getGroupTheme(group).text };
}

export function getGroupDisplayName(group: string | GroupKey | undefined): string {
  const key = typeof group === "string" ? getGroupKey(group) : group ?? null;
  const groupDef = key ? GROUP_DEFINITIONS[key] : undefined;
  return groupDef?.displayName ?? "";
}

export function isValidGroup(group: string | undefined): boolean {
  return getGroupKey(group) !== null;
}

export function getAllGroups() {
  return Object.entries(GROUP_DEFINITIONS).map(([key, def]) => ({
    key: key as GroupKey,
    ...def,
  }));
}
