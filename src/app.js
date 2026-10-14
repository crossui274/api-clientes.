// Punto de entrada de la API
require('dotenv').config();
const express = require('express');
const clientesRouter = require('./routes/clientes');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de clientes funcionando', endpoints: '/clientes' });
});

app.use('/clientes', clientesRouter);

// Ruta no encontrada -> 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  // JSON mal formado en el body -> 400
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido.' });
  }
  // Email duplicado (restricción UNIQUE de MySQL) -> 409 Conflict
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Conflicto: ya existe un cliente con ese email.' });
  }
  // Error de conexión con la base de datos -> 503
  if (['ECONNREFUSED', 'PROTOCOL_CONNECTION_LOST', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR'].includes(err.code)) {
    console.error('Error de BD:', err.code);
    return res.status(503).json({ error: 'No se pudo conectar con la base de datos.' });
  }
  // Cualquier otro error: se registra en consola pero NO se expone el detalle al cliente
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
