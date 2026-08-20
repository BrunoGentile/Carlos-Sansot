import { API_BASE_URL } from './config.js';

async function request(action, payload = {}, method = 'GET') {
  const url = new URL(API_BASE_URL);
  url.searchParams.set('action', action);
  const options = method === 'GET' ? {} : { method, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, ...payload }) };
  if (method === 'GET') Object.entries(payload).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok || data.ok === false) throw new Error(data.error || 'Error de API');
  return data.data;
}

export const api = {
  getConfig: () => request('getConfig'),
  getTrips: () => request('getTrips'),
  getTrip: (id) => request('getTrip', { id }),
  createReservation: (reservation) => request('createReservation', { reservation }, 'POST'),
  createInquiry: (inquiry) => request('createInquiry', { inquiry }, 'POST'),
  adminListReservations: () => request('adminListReservations'),
  adminListInquiries: () => request('adminListInquiries'),
  adminSaveTrip: (trip) => request('adminSaveTrip', { trip }, 'POST'),
  adminUpdateReservation: (id_reserva, changes) => request('adminUpdateReservation', { id_reserva, changes }, 'POST'),
  adminUpdateInquiry: (id, changes) => request('adminUpdateInquiry', { id, changes }, 'POST')
};
