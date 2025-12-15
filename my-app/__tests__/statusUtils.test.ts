import { 
  ChildStatus
} from '@/constants/statuses';
import { 
  getStatusLabel, 
  getStatusDescription, 
  getStatusColor,
  isValidStatus,
  getAllStatuses,
  toChildStatus
} from '@/services/utils/statusUtils';
import { Palette } from '@/constants/theme';

describe('statusUtils', () => {
  describe('getStatusLabel', () => {
    it('should return "inne" for CHECKED_IN status', () => {
      expect(getStatusLabel(ChildStatus.CHECKED_IN)).toBe('inne');
    });

    it('should return "ute" for CHECKED_OUT status', () => {
      expect(getStatusLabel(ChildStatus.CHECKED_OUT)).toBe('ute');
    });

    it('should return "hjemme" for HOME status', () => {
      expect(getStatusLabel(ChildStatus.HOME)).toBe('hjemme');
    });
  });

  describe('getStatusDescription', () => {
    it('should return correct description for CHECKED_IN', () => {
      const description = getStatusDescription('Ola', ChildStatus.CHECKED_IN);
      expect(description).toBe('Ola er for tiden i barnehagen.');
    });

    it('should return correct description for CHECKED_OUT', () => {
      const description = getStatusDescription('Kari', ChildStatus.CHECKED_OUT);
      expect(description).toBe('Kari er ikke sjekket inn.');
    });

    it('should return correct description for HOME', () => {
      const description = getStatusDescription('Per', ChildStatus.HOME);
      expect(description).toBe('Per er meldt hjemme i dag.');
    });
  });

  describe('getStatusColor', () => {
    it('should return statusIn color for CHECKED_IN', () => {
      expect(getStatusColor(ChildStatus.CHECKED_IN)).toBe(Palette.statusIn);
    });

    it('should return statusOut color for CHECKED_OUT', () => {
      expect(getStatusColor(ChildStatus.CHECKED_OUT)).toBe(Palette.statusOut);
    });

    it('should return statusHome color for HOME', () => {
      expect(getStatusColor(ChildStatus.HOME)).toBe(Palette.statusHome);
    });
  });

  describe('isValidStatus', () => {
    it('should return true for valid ChildStatus values', () => {
      expect(isValidStatus(ChildStatus.CHECKED_IN)).toBe(true);
      expect(isValidStatus(ChildStatus.CHECKED_OUT)).toBe(true);
      expect(isValidStatus(ChildStatus.HOME)).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isValidStatus('invalid')).toBe(false);
      expect(isValidStatus(null)).toBe(false);
      expect(isValidStatus(undefined)).toBe(false);
      expect(isValidStatus(123)).toBe(false);
    });
  });

  describe('getAllStatuses', () => {
    it('should return all status values', () => {
      const statuses = getAllStatuses();
      expect(statuses).toEqual([
        ChildStatus.CHECKED_IN,
        ChildStatus.CHECKED_OUT,
        ChildStatus.HOME,
      ]);
    });

    it('should return array with 3 statuses', () => {
      expect(getAllStatuses()).toHaveLength(3);
    });
  });

  describe('toChildStatus', () => {
    it('should convert valid string to ChildStatus', () => {
      expect(toChildStatus(ChildStatus.CHECKED_IN)).toBe(ChildStatus.CHECKED_IN);
      expect(toChildStatus(ChildStatus.CHECKED_OUT)).toBe(ChildStatus.CHECKED_OUT);
      expect(toChildStatus(ChildStatus.HOME)).toBe(ChildStatus.HOME);
    });

    it('should return null for invalid values', () => {
      expect(toChildStatus('invalid')).toBeNull();
      expect(toChildStatus(null)).toBeNull();
      expect(toChildStatus(undefined)).toBeNull();
    });
  });
});
