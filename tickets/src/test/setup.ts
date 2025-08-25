import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import {app} from '../app';
import jwt from 'jsonwebtoken';

declare global{
    var signin: () => string[];
}
let mongo:any;
beforeAll(async ()=>{
    process.env.JWT_KEY = 'asdfasdf';
    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri);
})

beforeEach(async ()=>{
    const collections = await mongoose.connection.db?.collections() || [];

    for(let collection of collections){
        await collection.deleteMany({});
    }
})

afterAll(async ()=>{
    await mongo.stop();
    await mongoose.connection.close();
})

global.signin =  ()=>{
    // Build a jwt paload. {id , email}
    const paload ={
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }

    //create  the jwt
    const token = jwt.sign(paload,process.env.JWT_KEY!)

    //build session object {jwt: M_JWT}
    const session = { jwt: token };

    // turn that session into json
    const sessionJSON = JSON.stringify(session);

    // take json and create it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    //return a string thats the cookie with the emcoded data
    return [`session=${base64}`];
}