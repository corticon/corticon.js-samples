//  backend-service.js (Node.js)
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
app.use(cors());
const port = process.env.PORT || 3000; //  Use environment variable for port

//  Database configuration - REMOVE HARDCODED CREDENTIALS
const dbConfig = {
    user: process.env.DB_USER || 'your_db_user', //  Use environment variables
    host: process.env.DB_HOST || 'your_db_host',
    database: process.env.DB_NAME || 'your_db_name',
    password: process.env.DB_PASSWORD || 'your_db_password',
    port: process.env.DB_PORT || 5432
};

async function getDriverDutyStatus(licenseNo) {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        const result = await client.query(
            'SELECT "dutyStatus" FROM "Driver" WHERE "licenseNo" = $1',
            [licenseNo]
        );
        console.log('Database result:', result.rows);
        return result.rows.length > 0 ? result.rows[0].dutyStatus : null;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    } finally {
        await client.end();
    }
}

app.get('/driverDutyStatus/:licenseNo', async (req, res) => {
    const licenseNo = req.params.licenseNo;
    try {
        const dutyStatus = await getDriverDutyStatus(licenseNo);
        res.json({ licenseNo, dutyStatus });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve duty status' });
    }
});

app.listen(port, () => {
    console.log(`Backend service listening on port ${port}`);
});