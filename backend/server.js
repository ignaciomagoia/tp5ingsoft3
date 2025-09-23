const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Variables de entorno
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const DB_CONNECTION = process.env.DATABASE_URL || 'local-db';

// Middleware para parsear JSON
app.use(express.json());

// Servir el frontend (HTML estático en frontend/public)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Cargar datos del "db.json"
const dbFile = path.join(__dirname, './database/db.json');
let dbData = { users: [] };

function loadDatabase() {
    try {
        const raw = fs.readFileSync(dbFile, 'utf8');
        dbData = JSON.parse(raw);
    } catch (err) {
        console.error("❌ Error cargando db.json:", err);
        dbData = { users: [] };
    }
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        environment: ENVIRONMENT,
        timestamp: new Date().toISOString(),
        database: DB_CONNECTION ? 'Connected (mock)' : 'Disconnected'
    });
});

// Info Endpoint
app.get('/api/info', (req, res) => {
    res.json({
        app: 'TP05 CI/CD Pipeline',
        version: '1.0.0',
        environment: ENVIRONMENT
    });
});

// Endpoint de usuarios (mock DB)
app.get('/api/users', (req, res) => {
    loadDatabase();
    res.json(dbData.users);
});

// Endpoint para agregar usuarios (escribe en db.json)
app.post('/api/users', (req, res) => {
    loadDatabase();
    const newUser = {
        id: dbData.users.length + 1,
        name: req.body.name || "User",
        role: req.body.role || "user"
    };
    dbData.users.push(newUser);
    fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2));
    res.status(201).json(newUser);
});

// Catch-all (para frontend SPA o rutas no definidas)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} - Environment: ${ENVIRONMENT}`);
});