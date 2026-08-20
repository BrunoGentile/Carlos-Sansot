import { api } from './api.js';

const money = (amount, currency = 'ARS') => new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(Number(amount || 0));
let trips = [];

function renderConfig(config) {
  document.getElementById('agencyName').textContent = config.nombre_agencia || 'Sansot Viajes';
  document.getElementById('tagline').textContent = config.texto_inicio || 'Viajes actualizados desde Google Sheets';
  const logo = document.getElementById('logo');
  logo.src = config.logo || '';
  logo.hidden = !config.logo;
  const whatsapp = document.getElementById('whatsappLink');
  whatsapp.href = config.whatsapp ? `https://wa.me/${config.whatsapp}` : '#';
}

function renderTrips(items) {
  const container = document.getElementById('trips');
  container.innerHTML = items.map((trip) => `<article class="card"><img src="${trip.imagen_principal || ''}" alt="${trip.nombre}"><h3>${trip.nombre}</h3><p class="meta">${trip.destino} · ${trip.fecha_salida} · ${trip.duracion}</p><p>${trip.descripcion_corta || ''}</p><p class="price">${money(trip.precio_promocional || trip.precio, trip.moneda || 'ARS')}</p><p>Cupos disponibles: ${trip.cupos_disponibles}</p><button class="btn" data-reserve="${trip.id}">Reservar</button></article>`).join('');
}

document.addEventListener('click', (event) => {
  const id = event.target.dataset.reserve;
  if (!id) return;
  const trip = trips.find((item) => item.id === id);
  const form = document.getElementById('bookingForm');
  form.id_viaje.value = trip.id;
  form.viaje.value = trip.nombre;
  document.getElementById('booking').classList.remove('hidden');
  form.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('bookingForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form));
  const result = await api.createReservation(payload);
  document.getElementById('bookingSummary').textContent = `Reserva ${result.id_reserva} registrada. Total: ${money(result.total, result.moneda)}`;
  form.reset();
});

(async function init() {
  try {
    const [config, loadedTrips] = await Promise.all([api.getConfig(), api.getTrips()]);
    renderConfig(config);
    trips = loadedTrips;
    renderTrips(trips);
  } catch (error) {
    document.getElementById('trips').innerHTML = `<p class="error">No se pudo cargar la información: ${error.message}</p>`;
  }
}());
