import mongoose from "mongoose";
import { Password } from "../services/password";

// an interface describe the properties that are reqired to create a new user
interface UserAttrs{
    email:string;
    password: string;
}

// An inteface that describes the properties that a user model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

// an interface that describes the properties that a user document has
interface UserDoc extends mongoose.Document{
    email:string;
    password:string;
}


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
},{
    toJSON:{
        transform(doc,ret: any){
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

userSchema.pre('save',async function(done){
    if(this.isModified('password')){
        const hashed = await Password.toHash(this.get('password'));
        this.set('password',hashed);
    }
    done();
});

userSchema.statics.build = (attrs: UserAttrs)=>{
    return new User(attrs);
}
const User = mongoose.model<UserDoc,UserModel>('user',userSchema);

export { User };