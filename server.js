require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` }); // Cargar las variables de entorno según el entorno

const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración para usar el driver Thick
oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_LIB_DIR });

// Conexión a la base de datos
async function initialize() {
    try {
        await oracledb.createPool({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTION_STRING
        });
        console.log('Conexión exitosa a Oracle DB');
    } catch (err) {
        console.error('Error en la conexión:', err);
    }
}

initialize();

// Rutas

app.get('/', (req, res) => {
    res.send(`Servidor corriendo en el puerto ${PORT}`);
    console.log('Variables de entorno:');
    console.log('PORT:', process.env.PORT);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
    console.log('DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING);
    console.log('ORACLE_CLIENT_LIB_DIR:', process.env.ORACLE_CLIENT_LIB_DIR);
});

app.get('/data/:usuprodefid', async (req, res) => {
    const usuprodefid = req.params.usuprodefid;
    try {
        const connection = await oracledb.getConnection();
        const result = await connection.execute('SELECT * FROM SGDP_USER.TBL_USUPRODEF WHERE USUPRODEFID = :id', [usuprodefid]);
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
