import { Activity } from "@/services/api";
import { getGroupDisplayName, getGroupKey } from "./groupUtils";

/**
 * Keep only activities that belong to allowed groups (blue/red) and map the group to display name.
 */
export function normalizeActivityForDisplay(activity: Activity): Activity | null {
  const key = getGroupKey(activity.group);
  if (!key) return null;

  return {
    ...activity,
    group: getGroupDisplayName(key),
  };
}
