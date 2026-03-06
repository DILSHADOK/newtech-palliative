require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const db = {
  query: (text, params) => pool.query(text, params),
  run: (text, params, callback) => pool.query(text, params).then(() => callback(null)).catch(err => callback(err)),
  get: (text, params, callback) => pool.query(text, params).then(res => callback(null, res.rows[0])).catch(err => callback(err)),
  all: (text, params, callback) => pool.query(text, params).then(res => callback(null, res.rows)).catch(err => callback(err))
};

// initialize tables
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipments (
        name TEXT PRIMARY KEY,
        qty INTEGER
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        name TEXT,
        qty INTEGER,
        time TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        amount NUMERIC,
        method TEXT,
        time TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        name TEXT,
        age INTEGER,
        condition TEXT,
        address TEXT,
        priority TEXT,
        time TEXT
      )
    `);

    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

initDB();

const app = express();
app.use(cors());
app.use(express.json());

// equipment routes
app.get('/api/equipments', async (req, res) => {
  try {
    const result = await pool.query('SELECT name, qty FROM equipments');
    const equipments = result.rows.reduce((acc, { name, qty }) => { acc[name] = qty; return acc; }, {});
    res.json(equipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/equipments', async (req, res) => {
  try {
    const { name, qty } = req.body;
    if (!name || typeof qty !== 'number') return res.status(400).json({ error: 'invalid' });
    await pool.query('INSERT INTO equipments (name,qty) VALUES ($1,$2) ON CONFLICT(name) DO UPDATE SET qty=qty+$2', [name, qty]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/equipments/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const { qty } = req.body;
    if (typeof qty !== 'number') return res.status(400).json({ error: 'invalid' });
    await pool.query('UPDATE equipments SET qty=$1 WHERE name=$2', [qty, name]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// orders
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT id,name,qty,time FROM orders');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { name, qty } = req.body;
    if (!name || typeof qty !== 'number') return res.status(400).json({ error: 'invalid' });
    const time = new Date().toISOString();
    const result = await pool.query('INSERT INTO orders (name,qty,time) VALUES ($1,$2,$3) RETURNING id', [name, qty, time]);
    res.json({ id: result.rows[0].id, name, qty, time });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM orders WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// donations
app.get('/api/donations', async (req, res) => {
  try {
    const result = await pool.query('SELECT id,name,email,amount,method,time FROM donations ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/donations', async (req, res) => {
  try {
    const { name, email, amount, method } = req.body;
    if (!name || !email || typeof amount !== 'number' || !method) {
      return res.status(400).json({ error: 'invalid' });
    }
    const time = new Date().toISOString();
    const result = await pool.query('INSERT INTO donations (name,email,amount,method,time) VALUES ($1,$2,$3,$4,$5) RETURNING id', [name, email, amount, method, time]);
    res.json({ id: result.rows[0].id, name, email, amount, method, time });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// patients
app.get('/api/patients', async (req, res) => {
  try {
    const result = await pool.query('SELECT id,name,age,condition,address,priority,time FROM patients ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const { name, age, condition, address, priority } = req.body;
    if (!name || typeof age !== 'number' || !condition || !address || !priority) {
      return res.status(400).json({ error: 'invalid' });
    }
    const time = new Date().toISOString();
    const result = await pool.query('INSERT INTO patients (name,age,condition,address,priority,time) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id', [name, age, condition, address, priority, time]);
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const [patientsRes, ordersRes, donationsRes, equipmentsRes, totalUnitsRes] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM patients'),
      pool.query('SELECT COUNT(*) as count FROM orders'),
      pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM donations'),
      pool.query('SELECT COUNT(*) as count FROM equipments WHERE qty > 0'),
      pool.query('SELECT COALESCE(SUM(qty), 0) as total FROM equipments')
    ]);
    
    const stats = {
      patients: parseInt(patientsRes.rows[0].count) || 0,
      orders: parseInt(ordersRes.rows[0].count) || 0,
      donations: 0,
      equipments: parseInt(equipmentsRes.rows[0].count) || 0,
      totalDonated: parseFloat(donationsRes.rows[0].total) || 0,
      totalUnits: parseInt(totalUnitsRes.rows[0].total) || 0
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// serve frontend static files (must be after all API routes)
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

// start server
const port = process.env.PORT || 3000;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on port ${port}`);
});

// graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    pool.end(() => process.exit(0));
  });
});
