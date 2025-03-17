const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
});

const startServer = async () => {
    const uri = process.env.TEST_DB_URI || (await MongoMemoryServer.create()).getUri();
    await mongoose.connect(uri,   {
        waitQueueTimeoutMS: 30000, // WAIT_QUEUE_TIMEOUT
        maxPoolSize: 3, // MAX_POOL_SIZE
        connectTimeoutMS: 60000, // CONNECT_TIMEOUT
        serverSelectionTimeoutMS: 60000 // SERVER_SELECTION_TIMEOUT
    });

    if (!process.env.TEST_DB_URI) {
        app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));
    }
};

startServer();

module.exports = app;