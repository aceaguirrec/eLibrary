//Set up dependencies
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//Define user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['User', 'Admin'],
        default: 'User'
    }
});

//Saves hashed user password
userSchema.pre('save', (next) =>{
    const user = this;
    if (this.isModified('password') || this.isNew){
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, (err, hash) =>{
                if (err) return next(err);
                user.password = hash;
                next();
            });
        });
    }
    else return next();
});

//Compare password input to database
userSchema.methods.validatePassword = (pw, cb) => {
    bcrypt.compare(pw, this.password, (err, isMatch) => {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', userSchema);