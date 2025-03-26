const { validatorMail } = require("../validators/mail.js")
const { send } = require("../controllers/mail.js")
const express = require('express')

const mailRouter = express.Router();


mailRouter.post("/mail", validatorMail, send);

module.exports = mailRouter;