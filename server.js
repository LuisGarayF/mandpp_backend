require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

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

// Función para obtener una nueva conexión a la base de datos
async function getConnection() {
    try {
        return await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTION_STRING
        });
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
        throw err;
    }
}

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

app.get('/data/usuario/:defensoriaid', async (req, res) => {
    const defensoriaid = req.params.defensoriaid;
    //console.log('Received defensoriaid:', defensoriaid);
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT PRO.USUPRODEFID as usuprodefid,
                PRO.DEFENSORIAID as defensoriaid,
                PRO.USERNAME as username,
                PRO.CLAVE as clave,
                DEF.NOMDEFENSORIA as nomdefensoria,
                PRO.REGIONID as regionid,
                TU.TIPOUSUARIO as tipousuario,
                PU.PERFILUSUARIO as perfilusuario,
                INITCAP(USU.NOMBRES) || ' ' || INITCAP(USU.appaterno) || ' ' || INITCAP(USU.APMATERNO) as defensor,
                PRO.ESTADO as estado,
                PRO.BLOQUEADO as bloqueado,
                PRO.ESTADOLOGIN as estadologin,
                PRO.TELEFONO as telefono,
                PRO.MAIL as email,
                PRO.FECHATERMINO as fechatermino,
                PRO.FECHAINICIO as fechainicio,
                PRO.FECHACOMPUTO as fechacomputo,
                PRO.USUPRODEFID_REMPLAZADO as reemplazante,
                PRO.USUPRODEFID_SUSTITUYE as sustituto,
                Z.ZONA as zona,
                Z.COMUNAPRIN as comuna 
                FROM SGDP_USER.TBL_USUARIO USU
                    JOIN SGDP_USER.TBL_USUPRODEF PRO ON (USU.USUARIOID = PRO.USUARIOID)
                    JOIN SGDP_USER.TBL_DEFENSORIA DEF ON (DEF.DEFENSORIAID = PRO.DEFENSORIAID)
                    LEFT JOIN SGDP_USER.TBL_CONTRATO_NEW CON ON (CON.DEFENSORIAID = DEF.DEFENSORIAID)
                    JOIN SGDP_USER.TBL_TIPOUSUARIO TU ON (TU.TIPOUSUARIOID = PRO.TIPOUSUARIOID)
                    JOIN SGDP_USER.TBL_PERFILUSUARIO PU ON (PU.PERFILUSUARIOID = PRO.PERFILUSUARIOID)--5749286
                    LEFT JOIN SGDP_USER.TBL_ZONA Z ON DEF.ZONAID = Z.ASIMILAZONA_NEW
                WHERE PRO.ESTADO = 'V'
                    AND PRO.BLOQUEADO = 0
                    AND PRO.DEFENSORIAID = :id`, [defensoriaid]);

        const columnNames = result.metaData.map(meta => meta.name);
        const mappedResult = result.rows.map(row => {
            let mappedRow = {};
            row.forEach((value, index) => {
                mappedRow[columnNames[index].toLowerCase()] = value;
            });
            return mappedRow;
        });

        res.json(mappedResult);
    } catch (err) {
        console.error('Error al obtener datos:', err);
        res.status(500).json({ error: 'Error al obtener datos' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error al cerrar la conexión:', err);
            }
        }
    }
});

app.get('/regiones', async (req, res) => {
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT regionid AS regionid, 
                    INITCAP(nomregion) || ' ' || descripcion AS nomregion, 
                    capital AS capital, 
                    nomresumido AS nomresumido, 
                    sigla AS sigla 
             FROM TBL_REGION 
             WHERE REGIONID <> 0 
             ORDER BY REGIONID ASC`);

        const columnNames = result.metaData.map(meta => meta.name.toLowerCase());
        const mappedResult = result.rows.map(row => {
            let mappedRow = {};
            row.forEach((value, index) => {
                mappedRow[columnNames[index]] = value;
            });
            return mappedRow;
        });

        res.json(mappedResult);
    } catch (err) {
        console.error('Error al obtener las regiones:', err);
        res.status(500).json({ error: 'Error al obtener las regiones' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error al cerrar la conexión:', err);
            }
        }
    }
});

app.get('/data/defensorias-region/:regionid', async (req, res) => {
    const regionid = req.params.regionid;
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT DE.defensoriaid AS defensoriaid,
                DE.REGIONID AS regionid,
                DE.NOMDEFENSORIA AS nomdefensoria,
                DE.ESTADO AS estado,
                DE.ZONAID AS zonaid
            FROM SGDP_USER.TBL_DEFENSORIA DE
            JOIN TBL_CONTRATO_NEW TCN on DE.DEFENSORIAID = TCN.DEFENSORIAID
            WHERE DE.estado ='V'
            AND TCN.FECHAHASTAVIGENCIA > SYSDATE 
            AND DE.regionid = :id`, [regionid]);

        const columnNames = result.metaData.map(meta => meta.name.toLowerCase());
        const mappedResult = result.rows.map(row => {
            let mappedRow = {};
            row.forEach((value, index) => {
                mappedRow[columnNames[index]] = value;
            });
            return mappedRow;
        });

        res.json(mappedResult);
    } catch (err) {
        console.error('Error al obtener datos de la región:', err);
        res.status(500).json({ error: 'Error al obtener datos de la región' });
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Conexión cerrada');
            } catch (err) {
                console.error('Error al cerrar la conexión:', err);
            }
        }
    }
});

app.get('/penitenciario/:peticionid', async (req, res) => {
    const peticionid = req.params.peticionid;
    //console.log('Received peticionid:', peticionid);
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT PR.PETICIONID AS peticionid,
                PR.PETICIONREQUERIMIENTOID AS peticionrequerimientoid,
                PR.TERMINOREQUERIMIENTOID AS terminorequerimientoid,
                EP.ESTADOPETICION AS estadopeticion,
                EP.ESTADOPETICIONID AS estadopeticionid
            FROM PENITENCIARIO.TBL_PETICIONREQUERIMIENTO PR
            JOIN PENITENCIARIO.TBL_PETICION PE ON PR.PETICIONID = PE.PETICIONID
            JOIN PENITENCIARIO.TBL_ESTADOPETICION EP ON PE.PET_ESTADOID = EP.ESTADOPETICIONID
            WHERE EP.ESTADOPETICIONID = 2 AND PR.TERMINOREQUERIMIENTOID IS NOT NULL AND PR.PETICIONID =  :id`, [peticionid]);

        const columnNames = result.metaData.map(meta => meta.name);
        const mappedResult = result.rows.map(row => {
            let mappedRow = {};
            row.forEach((value, index) => {
                mappedRow[columnNames[index].toLowerCase()] = value;
            });
            return mappedRow;
        });

        res.json(mappedResult);
    } catch (err) {
        console.error('Error al obtener datos:', err);
        res.status(500).json({ error: 'Error al obtener datos' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error al cerrar la conexión:', err);
            }
        }
    }
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
