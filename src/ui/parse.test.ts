import { describe, expect, it } from 'vitest';
import { parseAttendees, parseMinutes, validateRequired } from './parse';

describe('UI input parsing', () => {
  it('P01 required fields, minutes and attendees parsing', () => {
    expect(validateRequired('', '720')).toBe('Start is required.');
    expect(validateRequired('660', ' ')).toBe('End is required.');
    expect(parseMinutes('660')).toBe(660);
    expect(parseMinutes('abc')).toBeNull();
    expect(parseAttendees('30')).toBe(30);
    expect(parseAttendees('0')).toBeNull();
    expect(parseAttendees('2.5')).toBeNull();
    expect(parseAttendees('')).toBeNull();
  });
});
