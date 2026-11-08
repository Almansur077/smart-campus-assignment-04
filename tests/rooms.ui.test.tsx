/** Integration / UI behaviour checks for the room catalog (F1-F5) through the real <App />. */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../src/App';

afterEach(cleanup);

const setAttendees = (v: string) => fireEvent.change(screen.getByLabelText('Attendees'), { target: { value: v } });
const rooms = () => screen.queryAllByRole('radio').map((r) => (r as HTMLInputElement).value);
const setTime = (s: string, e: string) => {
  fireEvent.change(screen.getByLabelText('Start (minutes after midnight)'), { target: { value: s } });
  fireEvent.change(screen.getByLabelText('End (minutes after midnight)'), { target: { value: e } });
};
const check = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Check availability' }));
  return screen.getByRole('status').textContent;
};

describe('UI: room catalog, filters and switching', () => {
  it('I01 F1 capacity filter: 30 shows B-204 and A-101, 31 hides B-204', () => {
    render(<App />);
    expect(rooms()).toEqual(['B-204', 'A-101', 'C-310', 'D-015', 'E-120']);
    setAttendees('30');
    expect(rooms()).toEqual(['B-204', 'A-101']);
    setAttendees('31');
    expect(rooms()).toEqual(['A-101']);
    expect(screen.getByTestId('match-count').textContent).toBe('1 of 5 rooms match');
  });
  it('I02 F2 equipment filter needs ALL selected items', () => {
    render(<App />);
    fireEvent.click(screen.getByLabelText('Projector'));
    fireEvent.click(screen.getByLabelText('Microphone'));
    expect(rooms()).toEqual(['A-101', 'E-120']);
  });
  it('I03 F4 empty state when nothing matches, and the check button is disabled', () => {
    render(<App />);
    fireEvent.click(screen.getByLabelText('Computers'));
    fireEvent.click(screen.getByLabelText('Microphone'));
    expect(rooms()).toEqual([]);
    expect(screen.getByTestId('empty-state').textContent).toMatch('No rooms match your requirements');
    expect((screen.getByRole('button', { name: 'Check availability' }) as HTMLButtonElement).disabled).toBe(true);
  });
  it('I04 F5 switching room refreshes the result with the new room bookings', () => {
    render(<App />);
    setTime('660', '720');
    expect(check()).toBe('AvailableRoom B-204 is available for this time.');
    fireEvent.click(screen.getByLabelText('C-310 Computer Lab'));
    expect(screen.getByRole('status').textContent).toBe('UnavailableOverlaps an existing booking (660–720 min = 11:00–12:00).');
    fireEvent.click(screen.getByLabelText('D-015 Meeting Room'));
    expect(screen.getByRole('status').textContent).toBe('AvailableRoom D-015 is available for this time.');
  });
  it('I05 F3 a blocked catalog room is reported unavailable in the UI', () => {
    render(<App />);
    fireEvent.click(screen.getByLabelText('E-120 Media Studio'));
    setTime('700', '720');
    expect(check()).toBe('UnavailableRoom E-120 is blocked (demo) and cannot be used.');
  });
  it('I06 filtering out the selected room hides the stale result and selects the first match', () => {
    render(<App />);
    expect(check()).toBe('AvailableRoom B-204 is available for this time.');
    setAttendees('31');
    expect(screen.queryByRole('status')).toBeNull();
    expect((screen.getByLabelText('A-101 Lecture Hall') as HTMLInputElement).checked).toBe(true);
  });
  it('I07 invalid attendees shows a clear message', () => {
    render(<App />);
    setAttendees('0');
    expect(screen.getByText('Enter a whole number of attendees from 1 to 500.')).toBeTruthy();
  });
});
