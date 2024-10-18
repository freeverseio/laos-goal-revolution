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
});
