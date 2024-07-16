const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all org_details
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM org_details WHERE soft_deleted = false');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get org_detail by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM org_details WHERE id = $1 AND soft_deleted = false', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new org_detail
router.post('/', async (req, res) => {
  const { org_name, nick_name, widget_id, orientation } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO org_details (org_name, nick_name, widget_id, orientation) VALUES ($1, $2, $3, $4) RETURNING *',
      [org_name, nick_name, widget_id, orientation]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update org_detail
router.put('/:id', async (req, res) => {
  const { org_name, nick_name, widget_id, orientation } = req.body;
  try {
    const result = await pool.query(
      'UPDATE org_details SET org_name = $1, nick_name = $2, widget_id = $3, orientation = $4 WHERE id = $5 RETURNING *',
      [org_name, nick_name, widget_id, orientation, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Soft delete org_detail
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE org_details SET soft_deleted = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
