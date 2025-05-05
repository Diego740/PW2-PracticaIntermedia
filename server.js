const express = require('express')
const cors = require('cors')
require ('dotenv').config()

const routers = require('./routes')

const dbConnect = require('./config/mongo.js')
const { setupSwagger } = require('./swagger.js')


const morganBody = require("morgan-body");
const loggerStream = require("./utils/handleLogger");


const app=express()
app.use(cors())
app.use(express.json())
setupSwagger(app)
app.use("/", routers)

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`)
})

dbConnect()


morganBody(app, {
    noColors: true,
    skip: function (req, res) {
      return res.statusCode < 400;
    },
    stream: loggerStream,
  });