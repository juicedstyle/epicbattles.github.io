const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Load data
let users = [];
let guilds = [];

function loadData() {
    try {
        users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        guilds = JSON.parse(fs.readFileSync('guilds.json', 'utf8'));
    } catch (error) {
        console.error('Error loading data:', error);
        users = [];
        guilds = [];
    }
}

function saveUsersToFile() {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

function saveGuildsToFile() {
    fs.writeFileSync('guilds.json', JSON.stringify(guilds, null, 2));
}

// Load initial data
loadData();

// WebSocket handling
wss.on('connection', (ws) => {
    console.log('Chat client connected');

    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });
});

// Routes
app.post('/api/register', (req, res) => {
    const { username, password, race } = req.body;
    
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = {
        username,
        password,
        race,
        health: race === 'Human' ? 100 : race === 'Elf' ? 120 : 80,
        damage: 10,
        score: 0
    };

    users.push(newUser);
    saveUsersToFile();
    res.json({ message: 'Registration successful', user: newUser });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user });
});

app.get('/api/statistics', (req, res) => {
    const stats = {
        totalUsers: users.length,
        raceDistribution: {
            Human: users.filter(u => u.race === 'Human').length,
            Elf: users.filter(u => u.race === 'Elf').length,
            Orc: users.filter(u => u.race === 'Orc').length
        },
        topPlayers: users
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 10)
            .map(user => ({
                username: user.username,
                race: user.race,
                score: user.score || 0
            })),
        guilds: guilds
            .sort((a, b) => {
                const scoreA = a.members.reduce((sum, member) => sum + (member.score || 0), 0);
                const scoreB = b.members.reduce((sum, member) => sum + (member.score || 0), 0);
                return scoreB - scoreA;
            })
            .slice(0, 10)
            .map(guild => ({
                name: guild.name,
                memberCount: guild.members.length,
                score: guild.members.reduce((sum, member) => sum + (member.score || 0), 0)
            }))
    };
    res.json(stats);
});

app.post('/api/attack', (req, res) => {
    const { attackerId, targetId } = req.body;
    
    const attacker = users.find(u => u.username === attackerId);
    const target = users.find(u => u.username === targetId);
    
    if (!attacker || !target) {
        return res.status(404).json({ message: 'Player not found' });
    }
    
    const damage = Math.floor(attacker.damage * (Math.random() * 0.4 + 0.8));
    target.health -= damage;
    
    if (target.health <= 0) {
        attacker.score = (attacker.score || 0) + 10;
    }
    
    saveUsersToFile();
    
    res.json({
        message: 'Attack successful',
        damage,
        targetHealth: target.health,
        attackerScore: attacker.score
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});