export const SLOT_DEFINITIONS = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
];
 
// How many days ahead a user may book (including today).
export const BOOKING_WINDOW_DAYS = 14;
 
const pad = (n) => String(n).padStart(2, '0');
 
// Local YYYY-MM-DD. (Do NOT use toISOString(): it converts to UTC and shows
// the wrong day for users in India between 00:00 and 05:30.)
export function toLocalISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
 
export function todayISO() {
  return toLocalISO(new Date());
}
 
export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
 
export function addDays(date, n) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copy.setDate(copy.getDate() + n);
  return copy;
}
 
export function formatDateLong(iso) {
  return parseISODate(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
 
export function formatShortDate(isoOrTimestamp) {
  const d = new Date(isoOrTimestamp);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
 
export function formatTime(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${suffix}`;
}
 
export function formatSlotLabel(slot) {
  const [start, end] = slot.split('-');
  return `${formatTime(start)} – ${formatTime(end)}`;
}
 
// True once the slot's start time has passed.
export function isSlotInPast(dateISO, slot, now = new Date()) {
  const start = slot.split('-')[0];
  const [y, m, d] = dateISO.split('-').map(Number);
  const [hh, mm] = start.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0) <= now;
}