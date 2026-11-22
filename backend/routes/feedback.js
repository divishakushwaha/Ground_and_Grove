const express = require('express');
const db = require('../db');
const router = express.Router();

const insertFeedback = db.prepare('INSERT INTO feedback (name, rating, message) VALUES (?, ?, ?)');
const selectFeedback = db.prepare('SELECT * FROM feedback ORDER BY id DESC');

// POST /api/feedback
router.post('/', (req, res) => {
  const { name, rating, message } = req.body || {};
  const stars = Number(rating);

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return res.status(400).json({ error: 'Choose a rating from 1 to 5' });
  }
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'Please write a short message' });
  }

  const info = insertFeedback.run(
    name && String(name).trim() ? String(name).trim().slice(0, 100) : 'Anonymous',
    stars,
    String(message).trim().slice(0, 1000)
  );
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

// GET /api/feedback
router.get('/', (req, res) => {
  res.json(selectFeedback.all());
});

module.exports = router;
