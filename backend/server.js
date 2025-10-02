const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// CRÍTICO: Azure usa process.env.PORT
const PORT = process.env.PORT || 8080;

// Variables de entorno
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const DB_CONNECTION = process.env.DATABASE_URL || 'local-db';

// Middleware
app.use(express.json());

// Servir frontend estático (build de React)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Cargar "base de datos" desde archivo si existe, con fallback en memoria
const dbFilePath = path.join(__dirname, 'database', 'db.json');
let dbData;
try {
    if (fs.existsSync(dbFilePath)) {
        const raw = fs.readFileSync(dbFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        dbData = {
            users: Array.isArray(parsed.users) && parsed.users.length > 0
                ? parsed.users
                : [
                    { id: 1, name: 'Admin', role: 'admin' },
                    { id: 2, name: 'User', role: 'user' }
                ]
        };
    } else {
        dbData = {
            users: [
                { id: 1, name: 'Admin', role: 'admin' },
                { id: 2, name: 'User', role: 'user' }
            ]
        };
    }
} catch (error) {
    console.error('Error cargando db.json, usando datos por defecto:', error);
    dbData = {
        users: [
            { id: 1, name: 'Admin', role: 'admin' },
            { id: 2, name: 'User', role: 'user' }
        ]
    };
}

// Health Check Endpoint (CRÍTICO)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        environment: ENVIRONMENT,
        timestamp: new Date().toISOString(),
        database: DB_CONNECTION ? 'Connected' : 'Disconnected',
        uptime: process.uptime()
    });
});

// Info Endpoint
app.get('/api/info', (req, res) => {
    res.json({
        app: 'TP05 CI/CD Pipeline',
        version: '1.0.0',
        environment: ENVIRONMENT,
        author: 'Ignacio Julian'
    });
});

// Usuarios (en memoria)
app.get('/api/users', (req, res) => {
    res.json(dbData.users);
});

app.post('/api/users', (req, res) => {
    const newUser = {
        id: dbData.users.length + 1,
        name: req.body.name || "User",
        role: req.body.role || "user"
    };
    dbData.users.push(newUser);
    res.status(201).json(newUser);
});

// Ruta principal (frontend)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Catch-all para SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${ENVIRONMENT}`);
    console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});