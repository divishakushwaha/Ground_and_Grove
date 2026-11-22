const express = require('express');
const path = require('path');
require('./db'); // creates the database + tables on first run

const app = express();
const PORT = process.env.PORT || 3000;

// Allow the page to call this API even when it is opened straight from disk (file://).
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown API route' }));

// Bonus: the site also works at http://localhost:3000
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Grounds and Grooves API running at http://localhost:${PORT}`);
});
