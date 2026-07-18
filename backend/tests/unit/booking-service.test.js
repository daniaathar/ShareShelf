import test from 'node:test';
import assert from 'node:assert/strict';
import { daysInclusive } from '../../src/utils/dates.js';

test('daysInclusive counts both start and end dates', () => {
  assert.equal(daysInclusive(new Date('2026-07-18T00:00:00.000Z'), new Date('2026-07-20T00:00:00.000Z')), 3);
});
