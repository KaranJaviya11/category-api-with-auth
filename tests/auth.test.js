const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

let mongoServer, app, User;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    process.env.TEST_DB_URI = uri;
    process.env.PORT = 0;


    app = require('../index');

    User = require('../models/userModel');

    await mongoose.connect(uri,  {
        waitQueueTimeoutMS: 30000, // WAIT_QUEUE_TIMEOUT
        maxPoolSize: 3, // MAX_POOL_SIZE
        connectTimeoutMS: 60000, // CONNECT_TIMEOUT
        serverSelectionTimeoutMS: 60000 // SERVER_SELECTION_TIMEOUT
    });
});

afterEach(async () => {
    await User.deleteMany();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Auth API', () => {
    it('should register a new user', async () => {
        const res = await request(app).post('/api/auth/register').send({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('User registered successfully');

        const user = await User.findOne({ email: 'test@example.com' });
        expect(user).toBeTruthy();
    });

    it('should not register user with missing fields', async () => {
        const res = await request(app).post('/api/auth/register').send({
            email: 'test@example.com'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Username, email, and password are required');
    });

    it('should not register duplicate email', async () => {
        await User.create({ username: 'tester', email: 'duplicate@example.com', password: 'hashed' });

        const res = await request(app).post('/api/auth/register').send({
            username: 'tester2',
            email: 'duplicate@example.com',
            password: 'password123'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('User already exists');
    });

    it('should login successfully and return token', async () => {
        await request(app).post('/api/auth/register').send({
            username: 'tester',
            email: 'login@example.com',
            password: 'password123'
        });

        const res = await request(app).post('/api/auth/login').send({
            email: 'login@example.com',
            password: 'password123'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('should fail login with invalid email', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'notfound@example.com',
            password: 'password123'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid email');
    });

    it('should fail login with invalid password', async () => {
        await request(app).post('/api/auth/register').send({
            username: 'tester',
            email: 'passwrong@example.com',
            password: 'password123'
        });

        const res = await request(app).post('/api/auth/login').send({
            email: 'passwrong@example.com',
            password: 'wrongpass'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid password');
    });
});