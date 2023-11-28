import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import express from 'express'
import formidable from 'express-formidable'
import formidable1 from 'formidable'
import userModel from '../models/user.model'
import { LogIn, SignUp } from '../controllers/auth.controller'
import prodService from '../services/product.services'
import { CreateProduct } from '../controllers/product.controller'
import { verifyToken } from '../middlewares/verifyToken'
import cloudinary from "cloudinary";
import { before, mock } from 'node:test'
import productsModel from '../models/products.model'
import * as cloudinaryU from '../utils/cloudinary'
import { response } from 'pactum'


let mongoServer: MongoMemoryServer
let app: express.Application
let accessToken: any
let ProductService: prodService

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()

    await mongoose.connect(mongoUri).then(() => {
        console.log("Test Db connected successfully!"),
            { useNewUrlParser: true, useUnifiedTopology: true }
    })
    app = express()
    app.use(express.json())
    app.post('/api/v1/auth/sign-up', SignUp);
    app.post('/api/v1/auth/sign-in', LogIn);
    app.post('/api/v1/product/create', formidable(), CreateProduct)
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
})


describe('Auth Controller', () => {
    it('should sign up a new user', async () => {
        const newUser = {
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            password: 'password123',
        };

        const response = await request(app)
            .post('/api/v1/auth/sign-up')
            .send(newUser)
            .expect(201);

        expect(response.body.data.fullName).toBe(newUser.fullName);
        expect(response.body.data.email).toBe(newUser.email);
    });

    it('should handle existing user during sign-up', async () => {
        const existingUser = {
            fullName: 'Existing User',
            email: 'existing.user@example.com',
            password: 'password123',
        };

        // Add an existing user to the database
        await userModel.create(existingUser);

        const response = await request(app)
            .post('/api/v1/auth/sign-up')
            .send(existingUser)
            .expect(400);

        expect(response.body.message).toBe(
            'You cannot use this email to register again'
        );
    });

    // Log in tests
    it('should log in an existing user with correct credentials', async () => {
        const existingUser = {
            fullName: 'Existing User',
            email: 'existing.user1@example.com',
            password: 'password123',
        };
        await request(app).post('/api/v1/auth/sign-up').send(existingUser).expect(201);


        const loginCredentials = {
            email: existingUser.email,
            password: existingUser.password,
        };

        const response = await request(app)
            .post('/api/v1/auth/sign-in')
            .send(loginCredentials)
            .expect(200);

        accessToken = response.body.data.token
        expect(response.body.data.user.fullName).toBe(existingUser.fullName);
        expect(response.body.data.user.email).toBe(existingUser.email);
        expect(response.body.data.token).toBeDefined();
    });

    it('should handle non-existing user during login', async () => {
        before(async () => {
            await userModel.deleteMany({})
        })
        const nonExistingUser = {
            email: 'non.existing@example.com',
            password: 'password123',
        };

        const response = await request(app)
            .post('/api/v1/auth/sign-in')
            .send(nonExistingUser)
            .expect(404);

        expect(response.body.message).toBe('Email does not exist');
    });

    it('should handle incorrect password during login', async () => {
        const existingUser = {
            fullName: 'Existing User',
            email: 'existing.user@example.com',
            password: 'password123',
        };

        const incorrectPasswordUser = {
            email: existingUser.email,
            password: 'incorrectpassword',
        };

        const response = await request(app)
            .post('/api/v1/auth/sign-in')
            .send(incorrectPasswordUser)
            .expect(401);

        expect(response.body.message).toBe('Password is incorrect');
    });
});


describe('Product Controller', () => {
    it('should create a new product', async () => {
        const mockRequest = {
            fields: {
                data: JSON.stringify({
                    name: 'Test Product',
                    price: 10,
                    description: 'Product description',
                    category: 'Electronics',
                }),
            },
            files: {
                file: { path: '/path/to/mock/image.jpg' },
            }
        }
        const cloudinarySpy = jest.spyOn(cloudinary.v2.uploader, 'upload') as any
        const cloud = cloudinarySpy.mockResolvedValue({ secure_url: 'https://test-image-url.com' })

        const response = await request(app)
            .post('/api/v1/product/create')
            .send(mockRequest)
            .expect(201)
    })
})