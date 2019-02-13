const express = require('express');
const unoRouter = require('./uno/uno.router');

const app = express();

app.use(express.json());
app.use('/uno/', unoRouter);

module.exports = app;