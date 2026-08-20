const SHEETS = { VIAJES: 'VIAJES', RESERVAS: 'RESERVAS', CONSULTAS: 'CONSULTAS', CONFIGURACION: 'CONFIGURACION' };
const ADMIN_EMAILS = ['admin@example.com'];

function doGet(e) { return handle_(e.parameter.action, e.parameter); }
function doPost(e) { const body = JSON.parse(e.postData.contents || '{}'); return handle_(body.action, body); }
function handle_(action, payload) {
  try {
    const routes = { getTrips, getTrip, getConfig, createReservation, createInquiry, adminListReservations, adminListInquiries, adminSaveTrip, adminUpdateReservation, adminUpdateInquiry };
    if (!routes[action]) throw new Error('Acción inválida');
    return json_({ ok: true, data: routes[action](payload || {}) });
  } catch (error) { return json_({ ok: false, error: error.message }); }
}
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name) { return ss_().getSheetByName(name); }
function rows_(name) { const values = sheet_(name).getDataRange().getValues(); const headers = values.shift(); return values.filter(r => r.some(Boolean)).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]]))); }
function append_(name, object) { const sh = sheet_(name); const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]; sh.appendRow(headers.map(h => object[h] ?? '')); }
function json_(payload) { return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON); }
function requireAdmin_() { const email = Session.getActiveUser().getEmail(); if (!ADMIN_EMAILS.includes(email)) throw new Error('No autorizado'); }
function getConfig() { return Object.fromEntries(rows_(SHEETS.CONFIGURACION).map(r => [r.clave, r.valor])); }
function getTrips() { return rows_(SHEETS.VIAJES).filter(t => String(t.estado).toLowerCase() === 'activo'); }
function getTrip({ id }) { const trip = rows_(SHEETS.VIAJES).find(t => String(t.id) === String(id)); if (!trip) throw new Error('Viaje no encontrado'); return trip; }
function createReservation({ reservation }) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const trip = getTrip({ id: reservation.id_viaje });
    const passengers = Number(reservation.cantidad_pasajeros); if (!Number.isInteger(passengers) || passengers < 1) throw new Error('Cantidad inválida');
    if (Number(trip.cupos_disponibles) < passengers) throw new Error('Cupos insuficientes');
    ['nombre','apellido','email','telefono'].forEach(f => { if (!reservation[f]) throw new Error(`Falta ${f}`); });
    const unit = Number(trip.precio_promocional || trip.precio); const total = unit * passengers; const id = Utilities.getUuid();
    append_(SHEETS.RESERVAS, { id_reserva: id, id_viaje: trip.id, viaje: trip.nombre, fecha_reserva: new Date(), ...reservation, precio_unitario: unit, total, estado_reserva: 'pendiente', estado_pago: 'pendiente' });
    updateTripCapacity_(trip.id, Number(trip.cupos_disponibles) - passengers);
    return { id_reserva: id, total, moneda: trip.moneda };
  } finally { lock.releaseLock(); }
}
function createInquiry({ inquiry }) { append_(SHEETS.CONSULTAS, { id: Utilities.getUuid(), fecha: new Date(), estado: 'nueva', ...inquiry }); return { ok: true }; }
function adminListReservations() { requireAdmin_(); return rows_(SHEETS.RESERVAS); }
function adminListInquiries() { requireAdmin_(); return rows_(SHEETS.CONSULTAS); }
function adminSaveTrip({ trip }) { requireAdmin_(); upsert_(SHEETS.VIAJES, 'id', trip.id || Utilities.getUuid(), { ...trip, fecha_actualizacion: new Date() }); return { ok: true }; }
function adminUpdateReservation({ id_reserva, changes }) { requireAdmin_(); upsert_(SHEETS.RESERVAS, 'id_reserva', id_reserva, changes); return { ok: true }; }
function adminUpdateInquiry({ id, changes }) { requireAdmin_(); upsert_(SHEETS.CONSULTAS, 'id', id, changes); return { ok: true }; }
function updateTripCapacity_(id, capacity) { upsert_(SHEETS.VIAJES, 'id', id, { cupos_disponibles: capacity, fecha_actualizacion: new Date() }); }
function upsert_(name, key, value, changes) {
  const sh = sheet_(name); const values = sh.getDataRange().getValues(); const headers = values[0]; const keyIndex = headers.indexOf(key); let row = values.findIndex((r, i) => i && String(r[keyIndex]) === String(value));
  if (row < 0) { append_(name, { [key]: value, ...changes }); return; }
  headers.forEach((h, i) => { if (Object.prototype.hasOwnProperty.call(changes, h)) sh.getRange(row + 1, i + 1).setValue(changes[h]); });
}
