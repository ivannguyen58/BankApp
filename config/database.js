const config = {
    development: {
        type: 'memory', // In-memory for demo
        logging: true
    },
    production: {
        type: 'mongodb', // Example: MongoDB
        url: process.env.DATABASE_URL || 'mongodb://localhost:27017/vietbank',
        logging: false
    },
    test: {
        type: 'memory',
        logging: false
    }
};

const environment = process.env.NODE_ENV || 'development';

module.exports = config[environment];
