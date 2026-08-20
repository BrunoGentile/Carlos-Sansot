import { api } from './api.js';
const content = document.getElementById('adminContent');
const table = (rows) => `<table><tbody>${rows.map((row) => `<tr>${Object.values(row).map((value) => `<td>${value ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
async function load(section) {
  content.textContent = 'Cargando...';
  if (section === 'reservations') content.innerHTML = table(await api.adminListReservations());
  if (section === 'inquiries') content.innerHTML = table(await api.adminListInquiries());
  if (section === 'trips') content.innerHTML = table(await api.getTrips());
}
document.addEventListener('click', (event) => { if (event.target.dataset.section) load(event.target.dataset.section); });
load('trips');
