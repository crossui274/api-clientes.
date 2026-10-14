// Rutas CRUD de la entidad "cliente".
// SEGURIDAD: todas las consultas usan parámetros (?) con pool.execute(),
// por lo que los datos del usuario NUNCA se concatenan al SQL (previene inyección SQL).
const express = require('express');
const pool = require('../db');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_REGEX = /^[0-9+\-\s()]{7,20}$/;

// ---------- Validaciones ----------

// El id debe ser un entero positivo (rechaza "abc", "1 OR 1=1", etc.)
function validarId(req, res, next) {
  const id = req.params.id;
  if (!/^\d+$/.test(id) || Number(id) < 1) {
    return res.status(400).json({ error: 'El id debe ser un número entero positivo.' });
  }
  req.idCliente = Number(id);
  next();
}

// Valida y normaliza el cuerpo (nombre, email, telefono)
function validarCuerpo(req, res, next) {
  const { nombre, email, telefono } = req.body || {};
  const errores = [];

  if (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 100) {
    errores.push('nombre es obligatorio (2 a 100 caracteres).');
  }
  if (typeof email !== 'string' || email.length > 150 || !EMAIL_REGEX.test(email.trim())) {
    errores.push('email es obligatorio y debe tener un formato válido.');
  }
  if (telefono !== undefined && telefono !== null && telefono !== '') {
    if (typeof telefono !== 'string' || !TELEFONO_REGEX.test(telefono)) {
      errores.push('telefono debe tener entre 7 y 20 caracteres (números, +, -, espacios o paréntesis).');
    }
  }

  if (errores.length > 0) {
    return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });
  }

  req.datos = {
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    telefono: telefono ? telefono.trim() : null,
  };
  next();
}

// ---------- CREATE: POST /clientes ----------
router.post('/', validarCuerpo, async (req, res, next) => {
  try {
    const { nombre, email, telefono } = req.datos;
    const [result] = await pool.execute(
      'INSERT INTO cliente (nombre, email, telefono) VALUES (?, ?, ?)',
      [nombre, email, telefono]
    );
    const [rows] = await pool.execute('SELECT * FROM cliente WHERE id_cliente = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ---------- READ (todos): GET /clientes ----------
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM cliente ORDER BY id_cliente');
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

// ---------- READ (uno): GET /clientes/:id ----------
router.get('/:id', validarId, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM cliente WHERE id_cliente = ?', [req.idCliente]);
    if (rows.length === 0) {
      return res.status(404).json({ error: `No existe un cliente con id ${req.idCliente}.` });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ---------- UPDATE: PUT /clientes/:id ----------
router.put('/:id', validarId, validarCuerpo, async (req, res, next) => {
  try {
    const { nombre, email, telefono } = req.datos;
    const [result] = await pool.execute(
      'UPDATE cliente SET nombre = ?, email = ?, telefono = ? WHERE id_cliente = ?',
      [nombre, email, telefono, req.idCliente]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `No existe un cliente con id ${req.idCliente}.` });
    }
    const [rows] = await pool.execute('SELECT * FROM cliente WHERE id_cliente = ?', [req.idCliente]);
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ---------- DELETE: DELETE /clientes/:id ----------
router.delete('/:id', validarId, async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM cliente WHERE id_cliente = ?', [req.idCliente]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `No existe un cliente con id ${req.idCliente}.` });
    }
    res.status(200).json({ mensaje: `Cliente ${req.idCliente} eliminado correctamente.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
