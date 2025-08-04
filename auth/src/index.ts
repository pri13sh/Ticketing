import mongoose from "mongoose";
import {app} from './app';

const start = async () =>{
    if(!process.env.JWT_KEY){
        throw new Error('JWT_key must be defined');
    }

    try{
        await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
        console.log('connected to mongodb');
    }catch(err){
        console.log(err)
    }

    app.listen(3000, ()=>{
        console.log('Listening on port 30010')
    })
};
start();
