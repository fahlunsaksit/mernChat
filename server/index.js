const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const config = require('./config/key');

const mongoose = require('mongoose')
const connect = mongoose.connect(config.mogoURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err))

app.use(cors())

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Server Running at ${port}`)
})

