const express = require('express');
const path = require('path');
const unoRouter = require('./uno/uno.router');

const app = express();

app.use(express.json());
app.use('/uno/', unoRouter);

// this is temporary
app.get('/', (req, res) => {
  const demoFilePath = path.resolve(__dirname, '../', 'public/demo.html');
  res.sendFile(demoFilePath);
});

module.exports = app;