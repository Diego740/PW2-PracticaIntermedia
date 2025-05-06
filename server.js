const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routers = require('./routes');
const dbConnect = require('./config/mongo.js');
const { setupSwagger } = require('./swagger.js');

const morganBody = require('morgan-body');
const loggerStream = require('./utils/handleLogger');

const app = express();
app.use(cors());
app.use(express.json());

morganBody(app, {
  noColors: true,
  skip: function (req, res) {
    return res.statusCode < 400;
  },
  stream: loggerStream,
});

setupSwagger(app);
app.use('/', routers);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Escuchando en el puerto ${port}`);
});

dbConnect();

module.exports = { app, server }; // Exportamos tanto app como server para usarlos en los tests
