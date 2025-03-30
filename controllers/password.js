const UserModel = require("../models/users.js");
const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError.js");
const { encryptPassword } = require("../utils/handlePassword.js");
const { generateResetToken, verifyResetToken } = require("../utils/handleJWT.js");


const getResetToken = async (req, res) => {
    try {
        const body = matchedData(req);
        const user = await UserModel.findOne({ email: body.email });

        if (!user) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }


        const resetToken = generateResetToken(user);
        user.resetToken = resetToken;
        await user.save();

        res.status(200).json({ message: "Token de recuperación generado", resetToken });
    } catch (err) {
        handleHttpError(res, "ERROR_GENERATING_RESET_TOKEN", 500);
    }
};


const changePassword = async (req, res) => {
    try {
        const body = matchedData(req);
        const user = req.user;
        
        if (!user) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }

        user.password = await encryptPassword(body.password);

        await user.save();

        res.status(200).json({ message: "Contraseña actualizada correctamente" });
    } catch (err) {
        //console.error(err);
        handleHttpError(res, "ERROR_UPDATING_PASSWORD", 500);
    }
};


module.exports = { getResetToken, changePassword };
