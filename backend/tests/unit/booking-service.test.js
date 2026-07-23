import { describe, expect, it } from 'vitest';
import { daysInclusive } from '../../src/utils/dates.js';

describe('daysInclusive', () => {
  it('counts both start and end dates', () => {
    expect(
      daysInclusive(
        new Date('2026-07-18T00:00:00.000Z'),
        new Date('2026-07-20T00:00:00.000Z'),
      ),
    ).toBe(3);
  });
});