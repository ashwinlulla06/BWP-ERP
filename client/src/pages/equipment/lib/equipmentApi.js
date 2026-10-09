import * as mock from './mockData';
 
// NOTE: Create React App only substitutes the literal text process.env.REACT_APP_*,
// so these must not be read through an alias.
export const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// Mock data is ON by default until the backend is ready.
// Set REACT_APP_USE_MOCK=false in client/.env to use the real API.
export const USE_MOCK = process.env.REACT_APP_USE_MOCK !== 'false';
 
function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}
 
// Person 1 stores the session as JSON under "unireserve_auth": { token, user }.
function readToken() {
  try {
    const session = JSON.parse(window.localStorage.getItem('unireserve_auth'));
    return (session && session.token) || null;
  } catch (e) {
    return null;
  }
}
 
// Promise wrapper around XMLHttpRequest.
function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, API_ROOT + path, true);
    xhr.timeout = 10000;
    xhr.setRequestHeader('Accept', 'application/json');
    const token = readToken(); // same Bearer token Person 1's axios interceptor sends
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    if (body !== undefined) xhr.setRequestHeader('Content-Type', 'application/json');
 
    xhr.onload = () => {
      let payload = null;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch (e) {
        payload = null;
      }
      const ok = xhr.status >= 200 && xhr.status < 300 && payload && payload.success !== false;
      if (ok) {
        resolve(payload.data);
      } else {
        const fallback = xhr.status === 401 ? 'Please log in to continue.' : 'Something went wrong. Please try again.';
        reject(httpError((payload && payload.message) || fallback, xhr.status));
      }
    };
    xhr.onerror = () => reject(httpError('Cannot reach the server. Check that the backend is running.', 0));
    xhr.ontimeout = () => reject(httpError('The server took too long to respond.', 0));
    xhr.send(body !== undefined ? JSON.stringify(body) : null);
  });
}
 
export function getEquipment() {
  return USE_MOCK ? mock.getEquipment() : request('GET', '/equipment');
}
 
export async function getEquipmentById(id) {
  const list = await getEquipment();
  const found = list.find((item) => String(item.id) === String(id));
  if (!found) throw httpError('This equipment could not be found.', 404);
  return found;
}
 
// The real-time availability check. Called when the date changes, every 15 s
// while the page is open, and once more right before a booking is confirmed.
export async function getSlots(equipmentId, date) {
  const data = USE_MOCK
    ? await mock.getSlots(equipmentId, date)
    : await request('GET', `/equipment/${encodeURIComponent(equipmentId)}/slots?date=${encodeURIComponent(date)}`);
  const slots = (data && Array.isArray(data.slots) ? data.slots : []).map((s) => {
    const available = Number(s.available_qty);
    return {
      ...s,
      available_qty: Number.isNaN(available) ? 0 : available,
      is_available: s.is_available !== undefined ? Boolean(s.is_available) : available > 0,
    };
  });
  return { ...data, slots };
}
 
export function bookEquipment({ equipment_id, date, time_slot }) {
  const payload = { equipment_id, date, time_slot };
  return USE_MOCK ? mock.bookEquipment(payload) : request('POST', '/equipment/book', payload);
}
 
export function cancelBooking(id) {
  return USE_MOCK ? mock.cancelBooking(id) : request('DELETE', `/equipment/booking/${encodeURIComponent(id)}`);
}
 
export function getMyBookings() {
  return USE_MOCK ? mock.getMyBookings() : request('GET', '/equipment/my-bookings');
}