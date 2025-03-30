const UserModel = require("../models/users.js");
const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError.js");
const { encryptPassword, isPasswordCorrect } = require("../utils/handlePassword.js");
const { tokenSign } = require("../utils/handleJWT.js");


const createItem = async (req, res) => {
    try {
        const body = matchedData(req); //El dato filtrado por el modelo (probar con body=req)

        //Verificar email registrado
        const existingUser = await UserModel.findOne({ email: body.email });
        if (existingUser) {
            return res.status(409).json({ message: "El email ya está en uso" });
        }

        //Cifrar la contraseña
        const hashedPassword = await encryptPassword(body.password);

        //Generar código de verificación de 6 dígitos
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        //Crear usuario
        const newUser = await UserModel.create({
            email: body.email,
            password: hashedPassword,
            //role: "user",
            //attemps: 3,
            code: verificationCode,
            //verificated: false
        });

        //const newUser = await UserModel.create(body);

        //Generar token JWT
        const token = tokenSign(newUser);

        console.log(verificationCode);
        return res.status(200).json({
            email: newUser.email,
            verificated: newUser.verificated,
            role: newUser.role,
            token,
        });
    } catch (err) {
        //console.error(err);
        handleHttpError(res, "ERROR_CREATE_ITEMS", 500);
    }
};

const validateUser = async (req, res) => {
    try {
        const body = matchedData(req);
        const user = req.user;

        if (!user) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }

        if (user.code !== parseInt(body.code, 10)) {
            user.attemps -= 1;

            if (user.attemps <= 0) {
                await UserModel.deleteOne({ _id: user._id });
                return handleHttpError(res, "USER_DELETED_TOO_MANY_ATTEMPTS", 403);
            }

            await user.save(); 
            return handleHttpError(res, `INVALID_CODE_ATTEMPTS_LEFT_${user.attemps}`, 400);
        }

        user.verificated = true;
        await user.save();

        res.status(200).json({ message: "Email verficado" });
    } catch (err) {
        //console.error(err);
        handleHttpError(res, "ERROR_VALIDACION", 500);
    }
};


const checkLogUser = async (req, res) => {
    try {
        const body = matchedData(req);

        //ENCONTRAR USUARIO
        const user = await UserModel.findOne({ email: body.email });

        //SI NO EXISTE O NO VERIFICADO
        if (!user || !user.verificated) {
            return res.status(404).json({ message: "Usuario no encontrado o no verificado" });
        }

        //COMPROBAR CONTRASEÑAS ENCRIPTADAS
        const validPassword = await isPasswordCorrect(body.password, user.password);
        if (validPassword) {
            //CREAR TOKEN JWT
            const token = tokenSign(user);

            return res.status(200).json({ message: "Login exitoso", token });
        }

        //CONTRASEÑA INCORRECTA
        return res.status(401).json({ message: "Contraseña incorrecta" });

    } catch (err) {
        //console.error(err);
        handleHttpError(res, "ERROR_LOGIN", 500);
    }
};


const addDataUser = async (req, res) => {
    try {
        const body = matchedData(req);
        const user = req.user;

        if (!user) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }
        //¿Se debe poder cambiar el correo?¿O para qué se pide en la llamada?
        user.email = body.email;


        user.name = body.name;
        user.surnames = body.surnames;
        user.nif = body.nif;

        await user.save();

        res.status(200).json({ 
            message: "Datos actualizados correctamente",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                surnames: user.surnames,
                nif: user.nif,
                role: user.role
            }
        });
        
        
    } catch (err) {
        //console.error(err); 
        handleHttpError(res, "ERROR_ADDING_DATA", 500);
    }


}

const addCompanyData = async (req, res) => {
    try {
        const body = matchedData(req);
        const user = req.user;

        if (!user) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }

        // Verificar si el CIF ya existe en otro usuario
        const existingCompany = await UserModel.findOne({
            "company.cif": body.company.cif,
            _id: { $ne: user._id } // Excluir el usuario actual
        });

        if (existingCompany) {
            return handleHttpError(res, "Company CIF already exists", 409);
        }


        user.company = {
            name: body.company.name,
            cif: body.company.cif,
            street: body.company.street,
            number: body.company.number,
            postal: body.company.postal,
            city: body.company.city,
            province: body.company.province
        };

        await user.save();

        res.status(200).json({ 
            message: "Datos de la empresa actualizados correctamente",
            user: {
                company: user.company
            }
        });

    } catch (err) {
        //console.error(err); 
        handleHttpError(res, "ERROR_ADDING_COMPANY_DATA", 500);
    }
};

const getUser = async (req, res) => {
    try {
        const body = matchedData(req);
        const user = req.user;
        if (!user) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }

        const { password, ...userData } = user.toObject();

        res.status(200).json({
            message: "Usuario encontrado",
            user: userData
        });
        
    } catch (err) {
        handleHttpError(res, "ERROR_GETTING_USER", 500);
    }

}

const deleteUser = async (req, res) => {
    try {
        const user = req.user;
        const softDelete = req.query.soft !== "false";

        if (!user) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }

        if (softDelete) {
            // Soft delete con mongoose-delete
            await UserModel.delete({ _id: user._id });
            return res.status(200).json({ message: "Usuario desactivado correctamente" });
        } else {
            //Hard delete
            await UserModel.deleteOne({ _id: user._id });
            return res.status(200).json({ message: "Usuario eliminado permanentemente" });
        }

    } catch (err) {
        console.error(err);
        handleHttpError(res, "ERROR_DELETING_USER", 500);
    }
}

module.exports = { createItem, validateUser, checkLogUser, addDataUser, addCompanyData, getUser, deleteUser};
