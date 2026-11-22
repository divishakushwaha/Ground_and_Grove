const express = require('express');
const db = require('../db');
const router = express.Router();

const insertReservation = db.prepare(
  'INSERT INTO reservations (name, contact, date, time, guests) VALUES (?, ?, ?, ?, ?)'
);
const selectReservations = db.prepare('SELECT * FROM reservations ORDER BY date, time');

// POST /api/reservations
router.post('/', (req, res) => {
  const { name, contact, date, time, guests } = req.body || {};
  const guestCount = Number(guests);

  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name is required' });
  if (!contact || !String(contact).trim()) return res.status(400).json({ error: 'Email or phone is required' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return res.status(400).json({ error: 'Pick a valid date' });
  if (!/^\d{2}:\d{2}$/.test(time || '')) return res.status(400).json({ error: 'Pick a valid time' });
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
    return res.status(400).json({ error: 'Guests must be between 1 and 20' });
  }

  const info = insertReservation.run(
    String(name).trim().slice(0, 100),
    String(contact).trim().slice(0, 100),
    date,
    time,
    guestCount
  );
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

// GET /api/reservations
router.get('/', (req, res) => {
  res.json(selectReservations.all());
});

module.exports = router;
