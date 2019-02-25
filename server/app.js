const express = require('express');
const path = require('path');
const unoRouter = require('./uno/uno.router');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'POST, PUT,OPTIONS, DELETE, GET')
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, access-control-allow-origin')
  res.header('Access-Control-Allow-Credentials', true)
  next()
})

app.use(express.json());
app.use('/uno/', unoRouter);

// this is temporary
app.get('/', (req, res) => {
  const demoFilePath = path.resolve(__dirname, '../', 'public/demo.html');
  res.sendFile(demoFilePath);
});

module.exports = app;