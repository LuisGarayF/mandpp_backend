// server.js
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const dbConfig = require('./dbConfig');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
async function initialize() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Conexión exitosa a Oracle DB');
    } catch (err) {
        console.error('Error en la conexión:', err);
    }
}

initialize();

// Rutas
app.get('/data', async (req, res) => {
    try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute('SELECT * FROM tu_tabla');
        res.json(result.rows);
        await connection.close();
    } catch (err) {
        console.error('Error al obtener datos:', err);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
