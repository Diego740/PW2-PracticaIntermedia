const express = require('express')
const {createItem, validateUser } = require ('../controllers/users.js')
const { validatorCreateItem, validatorVerifyUser} = require ("../validators/users.js")
const { authMiddleware } = require('../middleware/authMiddleware.js')
//const customHeader = require("../midldleware/customHeaders.js")


const userRouter = express.Router();

//userRouter.post("/", validatorCreateItem, customHeader, createItem);
userRouter.post('/register', validatorCreateItem, createItem);
userRouter.post('/validate',validatorVerifyUser, authMiddleware, validateUser);


module.exports = userRouter;