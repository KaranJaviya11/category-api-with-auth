const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

let mongoServer, app, User, Category, token;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    process.env.TEST_DB_URI = uri;
    process.env.PORT = 0;

    app = require('../index');
    User = require('../models/userModel');
    Category = require('../models/categoryModel');

    await mongoose.connect(uri,   {
        waitQueueTimeoutMS: 30000, // WAIT_QUEUE_TIMEOUT
        maxPoolSize: 3, // MAX_POOL_SIZE
        connectTimeoutMS: 60000, // CONNECT_TIMEOUT
        serverSelectionTimeoutMS: 60000 // SERVER_SELECTION_TIMEOUT
    });

    await request(app).post('/api/auth/register').send({
        username: 'tester',
        email: 'tester@example.com',
        password: 'password123'
    });

    const res = await request(app).post('/api/auth/login').send({
        email: 'tester@example.com',
        password: 'password123'
    });

    token = res.body.token;
});

afterEach(async () => {
    await Category.deleteMany();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Category API', () => {
    it('should create a new category', async () => {
        const res = await request(app)
            .post('/api/category')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Electronics' });

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe('Electronics');
    });

    it('should fetch categories in tree format', async () => {
        const parent = await request(app)
            .post('/api/category')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Books' });

        await request(app)
            .post('/api/category')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Novels', parent: parent.body._id });

        const res = await request(app)
            .get('/api/category')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body[0].name).toBe('Books');
        expect(res.body[0].children[0].name).toBe('Novels');
    });

    it('should update category status and subcategories', async () => {
        const parent = await request(app)
            .post('/api/category')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Fashion' });

        const child = await request(app)
            .post('/api/category')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Shoes', parent: parent.body._id });

        await request(app)
            .put(`/api/category/${parent.body._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'inactive' });

        const updatedChild = await Category.findById(child.body._id);
        expect(updatedChild.status).toBe('inactive');
    });

    it('should delete category and reassign subcategories', async () => {
        const parent = await request(app)
            .post('/api/category')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Home' });

        const child = await request(app)
            .post('/api/category')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Kitchen', parent: parent.body._id });

        await request(app)
            .delete(`/api/category/${parent.body._id}`)
            .set('Authorization', `Bearer ${token}`);

        const updatedChild = await Category.findById(child.body._id);
        expect(updatedChild.parent).toBeNull();
    });
});
