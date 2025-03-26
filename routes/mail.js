const { validatorMail } = require("../validators/mail.js")
const { send } = require("../controllers/mail.js")
const express = require('express')

const router = express.Router();


router.post("/mail", validatorMail, send);
