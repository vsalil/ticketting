import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
//import {app} from '../app';
//import request from 'supertest';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
    }
  }
}
jest.mock('../nats-wrapper.ts');
let mongo: any;

beforeAll(async () => {
    jest.clearAllMocks();
    process.env.JWT_KEY = 'asdf'
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = () => {
const id = new mongoose.Types.ObjectId().toHexString();
const payload = {
     email:'test@test.com', 
     id: id
    };
 // create a JWT Token
    const jtoken = jwt.sign(payload,process.env.JWT_KEY!);
    const session = {jwt: jtoken};
    const jtokenString = JSON.stringify(session);
    const buff = new Buffer(jtokenString);
    const base64jwt = buff.toString('base64');
 // encode jwt token base 64 format  
   // const session = [`express:sess=${base64jwt}`];
    return [`express:sess=${base64jwt}`];
  }; 