import { PreferredPositionMapper } from './PreferredPositionMapper';
import { BirthTraits } from '../../types';

describe('PreferredPositionMapper', () => {
  describe('getPreferredPosition', () => {
    it('should return GK for forwardness value 0 and leftishness value 0', () => {
      const birthTraits: BirthTraits = {
        potential: 85,
        forwardness: 0,
        leftishness: 0,
        aggressiveness: 70,
      };

      const result = PreferredPositionMapper.getPreferredPosition(birthTraits);
      expect(result).toBe('GK');
    });

    it('should return D L for forwardness value 1 and leftishness value 4', () => {
      const birthTraits: BirthTraits = {
        potential: 85,
        forwardness: 1,
        leftishness: 4,
        aggressiveness: 70,
      };

      const result = PreferredPositionMapper.getPreferredPosition(birthTraits);
      expect(result).toBe('D L');
    });

    it('should return F C for forwardness value 3 and leftishness value 2', () => {
      const birthTraits: BirthTraits = {
        potential: 90,
        forwardness: 3,
        leftishness: 2,
        aggressiveness: 80,
      };

      const result = PreferredPositionMapper.getPreferredPosition(birthTraits);
      expect(result).toBe('F C');
    });

    it('should return MF R for forwardness value 5 and leftishness value 1', () => {
      const birthTraits: BirthTraits = {
        potential: 78,
        forwardness: 5,
        leftishness: 1,
        aggressiveness: 60,
      };

      const result = PreferredPositionMapper.getPreferredPosition(birthTraits);
      expect(result).toBe('MF R');
    });

    it('should return error for invalid forwardness value', () => {
      const birthTraits: BirthTraits = {
        potential: 85,
        forwardness: 10, // Invalid forwardness
        leftishness: 3,
        aggressiveness: 70,
      };

      const result = PreferredPositionMapper.getPreferredPosition(birthTraits);
      expect(result).toBeInstanceOf(Error);
      if (result instanceof Error) {
        expect(result.message).toBe('unexistent forwardness');
      }
    });

    it('should return error for invalid leftishness value', () => {
      const birthTraits: BirthTraits = {
        potential: 85,
        forwardness: 2,
        leftishness: 8, // Invalid leftishness
        aggressiveness: 70,
      };

      const result = PreferredPositionMapper.getPreferredPosition(birthTraits);
      expect(result).toBeInstanceOf(Error);
      if (result instanceof Error) {
        expect(result.message).toBe('unexistent leftishness');
      }
    });

    it('should return M for forwardness value 2 and leftishness value 0', () => {
      const birthTraits: BirthTraits = {
        potential: 85,
        forwardness: 2,
        leftishness: 0,
        aggressiveness: 70,
      };

      const result = PreferredPositionMapper.getPreferredPosition(birthTraits);
      expect(result).toBe('M');
    });
  });

  describe('leftishnessToString', () => {
    it('should return R for value 1', () => {
      const result = PreferredPositionMapper.leftishnessToString(1);
      expect(result).toBe('R');
    });

    it('should return C for value 2', () => {
      const result = PreferredPositionMapper.leftishnessToString(2);
      expect(result).toBe('C');
    });

    it('should return CR for value 3', () => {
      const result = PreferredPositionMapper.leftishnessToString(3);
      expect(result).toBe('CR');
    });

    it('should return L for value 4', () => {
      const result = PreferredPositionMapper.leftishnessToString(4);
      expect(result).toBe('L');
    });

    it('should return LR for value 5', () => {
      const result = PreferredPositionMapper.leftishnessToString(5);
      expect(result).toBe('LR');
    });

    it('should return LC for value 6', () => {
      const result = PreferredPositionMapper.leftishnessToString(6);
      expect(result).toBe('LC');
    });

    it('should return LCR for value 7', () => {
      const result = PreferredPositionMapper.leftishnessToString(7);
      expect(result).toBe('LCR');
    });
  });
});
