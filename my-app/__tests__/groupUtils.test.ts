import {
  normalizeGroupName,
  getGroupTheme,
  getGroupTextStyle,
  getGroupDisplayName,
  isValidGroup,
  getAllGroups,
  getGroupKey,
} from "@/services/utils/groupUtils";
import { GROUP_DEFINITIONS, DEFAULT_GROUP } from "@/constants/groups";

describe("groupUtils", () => {
  describe("normalizeGroupName", () => {
    it("normalizes blå variants", () => {
      expect(normalizeGroupName("blå")).toBe("bla");
      expect(normalizeGroupName("Blå")).toBe("bla");
      expect(normalizeGroupName("BLA.")).toBe("bla");
      expect(normalizeGroupName("blå gruppe")).toBe("bla");
    });

    it("normalizes rød variants", () => {
      expect(normalizeGroupName("rød")).toBe("rod");
      expect(normalizeGroupName("RØD")).toBe("rod");
      expect(normalizeGroupName("ra,d gruppe")).toBe("rod");
      expect(normalizeGroupName("red group")).toBe("rod");
    });

    it("returns empty string for undefined/null", () => {
      expect(normalizeGroupName(undefined)).toBe("");
      expect(normalizeGroupName("")).toBe("");
    });

    it("returns empty string for unknown group", () => {
      expect(normalizeGroupName("unknown")).toBe("");
    });
  });

  describe("getGroupTheme", () => {
    it("returns blå theme", () => {
      const theme = getGroupTheme("blå");
      expect(theme).toEqual(GROUP_DEFINITIONS.bla.colors);
    });

    it("returns rød theme", () => {
      const theme = getGroupTheme("rød");
      expect(theme).toEqual(GROUP_DEFINITIONS.rod.colors);
    });

    it("returns default theme for unknown group", () => {
      const theme = getGroupTheme("unknown");
      expect(theme).toEqual(DEFAULT_GROUP.colors);
    });
  });

  describe("getGroupTextStyle", () => {
    it("returns style object with color property", () => {
      const style = getGroupTextStyle("blå");
      expect(style).toHaveProperty("color");
      expect(style.color).toBe(GROUP_DEFINITIONS.bla.colors.text);
    });
  });

  describe("getGroupDisplayName", () => {
    it("returns display name for blå", () => {
      expect(getGroupDisplayName("blå")).toBe("Blå gruppe");
    });

    it("returns display name for rød", () => {
      expect(getGroupDisplayName("rød")).toBe("Rød gruppe");
    });

    it("returns empty for unknown group", () => {
      expect(getGroupDisplayName("unknown")).toBe("");
    });
  });

  describe("getGroupKey", () => {
    it("resolves known groups", () => {
      expect(getGroupKey("Blå gruppe")).toBe("bla");
      expect(getGroupKey("Rød")).toBe("rod");
    });

    it("returns null for unknown", () => {
      expect(getGroupKey("gul")).toBeNull();
    });
  });

  describe("isValidGroup", () => {
    it("returns true for defined groups", () => {
      expect(isValidGroup("blå")).toBe(true);
      expect(isValidGroup("rød")).toBe(true);
    });

    it("returns false for undefined/null", () => {
      expect(isValidGroup(undefined)).toBe(false);
      expect(isValidGroup("")).toBe(false);
    });

    it("returns false for unknown groups", () => {
      expect(isValidGroup("unknown")).toBe(false);
    });
  });

  describe("getAllGroups", () => {
    it("returns all defined groups", () => {
      const groups = getAllGroups();
      expect(groups.length).toBeGreaterThan(0);
    });

    it("includes blå and rød display names", () => {
      const groups = getAllGroups();
      const blaGroup = groups.find((g) => g.key === "bla");
      const rodGroup = groups.find((g) => g.key === "rod");
      expect(blaGroup?.displayName).toBe("Blå gruppe");
      expect(rodGroup?.displayName).toBe("Rød gruppe");
    });
  });
});
