class ChatServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.MESSAGES_FILE = path.join(__dirname, 'messages.json');
        this.RETENTION_DAYS = 7;
        this.messages = this.loadMessages();
        this.setupCleanup();
        this.setupWebSocket();
    }

    loadMessages() {
        try {
            if (!fs.existsSync(this.MESSAGES_FILE)) {
                fs.writeFileSync(this.MESSAGES_FILE, '[]');
                return [];
            }
            const messages = JSON.parse(fs.readFileSync(this.MESSAGES_FILE, 'utf8'));
            // Filter messages within retention period
            const currentTime = Date.now();
            const retentionTime = this.RETENTION_DAYS * 24 * 60 * 60 * 1000;
            return messages.filter(msg => (currentTime - msg.timestamp) < retentionTime);
        } catch (error) {
            console.error('Error loading messages:', error);
            return [];
        }
    }

    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            console.log('New chat client connected');

            // Send existing message history immediately
            if (this.messages.length > 0) {
                const historyMessage = {
                    type: 'history',
                    messages: this.messages.sort((a, b) => a.timestamp - b.timestamp)
                };
                ws.send(JSON.stringify(historyMessage));
            }

            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    
                    if (!message.username || !message.content) {
                        console.error('Invalid message format');
                        return;
                    }

                    const fullMessage = {
                        ...message,
                        timestamp: Date.now(),
                        id: Date.now() + Math.random().toString(36).substr(2, 9)
                    };

                    this.messages.push(fullMessage);
                    this.saveMessages();
                    this.broadcast(fullMessage);

                } catch (error) {
                    console.error('Error processing message:', error);
                }
            });
        });
    }

    broadcast(message) {
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(JSON.stringify(message));
                } catch (error) {
                    console.error('Error broadcasting message:', error);
                }
            }
        });
    }
}

module.exports = ChatServer;