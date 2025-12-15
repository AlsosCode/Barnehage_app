import { Child } from "@/services/api";
import { getGroupDisplayName, getGroupKey } from "./groupUtils";

function sanitizeChildName(name: string | undefined, fallbackId: number): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return `Barn ${fallbackId}`;
  if (trimmed.toLowerCase() === "ukjent barn") return `Barn ${fallbackId}`;
  return trimmed;
}

function sanitizeAge(age: Child["age"]): number {
  return typeof age === "number" && Number.isFinite(age) && age > 0 ? age : 0;
}

/**
 * Normalize child values for display so we avoid unknown names/groups leaking to UI.
 */
export function normalizeChildForDisplay(child: Child): Child {
  const groupKey = getGroupKey(child.group);
  const safeGroup = groupKey ? getGroupDisplayName(groupKey) : "";

  return {
    ...child,
    name: sanitizeChildName(child.name, child.id),
    age: sanitizeAge(child.age),
    group: safeGroup,
  };
}
