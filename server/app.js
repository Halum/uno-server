const config = require('./config/config.js');
const express = require('express');
const http = require('http')
const unoRouter = require('./uno')

const app = express();

app.use('/uno/', unoRouter);

module.exports = app;