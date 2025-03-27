const bcrypt = require("bcrypt");


const encryptPassword = async (password) => {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;

}


const isPasswordCorrect = async (password1, password2) => {
    return await bcrypt.compare(password1, password2);
}
module.exports = { encryptPassword, isPasswordCorrect};