const express = require('express')
const {createItem } = require ('../controllers/users.js')
const { validatorCreateItem } = require ("../validators/users.js")
//const customHeader = require("../midldleware/customHeaders.js")


const userRouter = express.Router();

//userRouter.post("/", validatorCreateItem, customHeader, createItem);
userRouter.post('/register', validatorCreateItem, createItem);


module.exports = userRouter;