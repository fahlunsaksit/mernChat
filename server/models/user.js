const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRound = 10
const jwt = require('jsonwebtoken')
const moment = require('moment')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password:{
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function ( next ) {
    var user = this // this = userSchema

    if(user.isModified('password')){
        bcrypt.genSalt(saltRound, function (err, salt) {
            if(err) return next(err);
    
            bcrypt.hash(user.password, salt, function (err, hash) {
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    }else{
        next()
    }
})

userSchema.methods.comparePassword = function (plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if(err) { console.log('----- err ------', err); cb(err) } 
        console.log('isMatch: ',isMatch);
        cb(null, isMatch)     
    })
}

userSchema.methods.generateToken = function (cb) {
    var user = this // this = userSchema
    // console.log('user', user);
    // console.log('userSchema', userSchema);
    var token = jwt.sign({user_id: user._id.toHexString()}, 'secretKey')
    var oneHour = moment().add(1, 'minutes').valueOf();

    user.tokenExp = oneHour
    user.token = token
    user.save(function (err, user) {
        if(err) return cb(err)
        cb(null, user);
    })
}

userSchema.statics.findByToken = function (token, cb) {
    var user = this;

    jwt.verify(token,'secretKey',function(err, decode){
        console.log('decode: ', decode);
        user.findOne({"_id": decode.user_id, "token":token}, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        })
    })
}

const User = mongoose.model('User', userSchema)
module.exports = { User }