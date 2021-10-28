const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const config = require('./config/key');

const { User } = require('./models/user')

const mongoose = require('mongoose');
const { auth } = require('./middleware/auth');
const connect = mongoose.connect(config.mogoURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err))

app.use(cors())

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())

app.get('/api/users/auth', auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
    });
})

app.post('/api/users/register', (req, res) => {
    const user = new User(req.body)

    user.save((err, userData) => {
        if(err){
            console.log('have err');
            return res.json({ success: false, err: err})
        }else{
            console.log('No have err');
            return res.status(200).json({ success: true, userdata: userData})
        }
    })

})

app.post('/api/users/login', (req,res) => {
    User.findOne({email: req.body.email}, (err, user)=>{
        if(!user)
        return res.json({
            loginsuccess: false,
            message: "Auth failed, email not found"
        })

        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) return res.json({
                loginsuccess: false, message: "Worng password"
            })
            
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err)
                res.cookie("w_authExp", user.tokenExp)
                res.cookie("w_auth", user.token)
                    .status(200)
                    .json({
                        loginSuccess: true, userId: user._id
                    })
            })

        })
    })
})

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Server Running at ${port}`)
})

