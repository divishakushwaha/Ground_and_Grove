const express = require('express');
const db = require('../db');
const router = express.Router();

const insertOrder = db.prepare(
  'INSERT INTO orders (customer_name, phone, order_type, notes, total) VALUES (?, ?, ?, ?, ?)'
);
const insertItem = db.prepare(
  'INSERT INTO order_items (order_id, item_name, price, quantity) VALUES (?, ?, ?, ?)'
);
const selectOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC');
const selectItems = db.prepare(
  'SELECT item_name, price, quantity FROM order_items WHERE order_id = ?'
);

// Saves the order and all its lines together, or nothing at all.
const saveOrder = db.transaction((order, items, total) => {
  const info = insertOrder.run(order.name, order.phone, order.orderType, order.notes, total);
  for (const item of items) {
    insertItem.run(info.lastInsertRowid, item.name, item.price, item.quantity);
  }
  return info.lastInsertRowid;
});

// POST /api/orders
router.post('/', (req, res) => {
  const { name, phone, orderType, notes, items } = req.body || {};

  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name is required' });
  if (!phone || !String(phone).trim()) return res.status(400).json({ error: 'Phone is required' });
  if (!['pickup', 'delivery'].includes(orderType)) {
    return res.status(400).json({ error: 'Order type must be pickup or delivery' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty' });
  }

  const cleanItems = [];
  for (const it of items) {
    const price = Number(it.price);
    const quantity = Number(it.quantity);
    if (!it.name || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      return res.status(400).json({ error: 'One of the items is invalid' });
    }
    cleanItems.push({ name: String(it.name).trim().slice(0, 100), price, quantity });
  }

  const total = Math.round(cleanItems.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100;
  const orderId = saveOrder(
    {
      name: String(name).trim().slice(0, 100),
      phone: String(phone).trim().slice(0, 30),
      orderType,
      notes: notes ? String(notes).trim().slice(0, 300) : null
    },
    cleanItems,
    total
  );

  res.status(201).json({ id: Number(orderId), total });
});

// GET /api/orders
router.get('/', (req, res) => {
  const orders = selectOrders.all().map((o) => ({ ...o, items: selectItems.all(o.id) }));
  res.json(orders);
});

module.exports = router;
