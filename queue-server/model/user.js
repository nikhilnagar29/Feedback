const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    content: {
        type: String,
        required: true 
    }, 
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const UserSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [20, 'Username must be at most 20 characters long'],
        trim: true,
        lowercase: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Do not return password by default
    },
    verifyCode: {
        type: String,
        required: [true, 'Verification code is required'],
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, 'Verification code expiration date is required'],
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAcceptingMessages: {
        type: Boolean,
        default: true
    },
    messages: [MessageSchema],
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }]
});

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = { UserModel, MessageSchema };