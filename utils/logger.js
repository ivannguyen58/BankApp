const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    log(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta
        };

        const logString = JSON.stringify(logEntry) + '\n';
        const filename = `${new Date().toISOString().split('T')[0]}.log`;
        const filepath = path.join(this.logDir, filename);

        fs.appendFileSync(filepath, logString);
        
        // Also log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta);
        }
    }

    info(message, meta) {
        this.log('info', message, meta);
    }

    error(message, meta) {
        this.log('error', message, meta);
    }

    warn(message, meta) {
        this.log('warn', message, meta);
    }

    debug(message, meta) {
        this.log('debug', message, meta);
    }
}

module.exports = new Logger();
