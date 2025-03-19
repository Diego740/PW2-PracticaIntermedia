const { validatorMail } = require("../validators/mail")
const { send } = require("../controllers/mail")
const express = require('express')

const router = express.Router();


router.post("/mail", authMiddleware, validatorMail, send);
