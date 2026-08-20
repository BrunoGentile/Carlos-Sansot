import test from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../src/js/api.js';

test('api exposes frontend and admin operations', () => {
  ['getConfig','getTrips','getTrip','createReservation','createInquiry','adminListReservations','adminListInquiries','adminSaveTrip','adminUpdateReservation','adminUpdateInquiry'].forEach((name) => assert.equal(typeof api[name], 'function'));
});
