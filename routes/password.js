const express = require("express");
const {validatorGetToken, validatorPassword} = require ("../validators/password.js")
const { authMiddlewareReset } = require("../middleware/authMiddleware.js");
const { getResetToken, changePassword } = require("../controllers/password.js");

const userRouter = express.Router();

userRouter.post("/getToken", validatorGetToken, getResetToken);
userRouter.put("/changePassword", authMiddlewareReset, validatorPassword, changePassword);

module.exports = userRouter;
