import mongoose from 'mongoose';
import { Password } from '../services/password';
// Interface describes what it creates a user
interface UserAttrs {
    email: string;
    password: string;
    
}

// An interface that describes properties
// that a User model has

interface UserModel extends mongoose.Model<UserDoc> {

    build(attrs: UserAttrs): UserDoc;
}

// An interface that describes properties
// that a User Document has

interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
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
    toJSON: {
        transform(doc,ret){
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
}
);

userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

userSchema.statics.build = (attrs: UserAttrs) => {

    return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('user', userSchema);

const buildUser = (attrs: UserAttrs) => {

    return new User(attrs);
};

export { User };
//new User ({ emaiil: 'vsalil@gmail.com', password: '1234'});
/*
User.build({
    email: 'vsalil',
    password: 'pwd'
})*/ 

