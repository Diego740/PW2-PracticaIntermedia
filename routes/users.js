const express = require("express");
const {
    createItem,
    validateUser,
    checkLogUser,
    addDataUser,
    addCompanyData,
    getUser,
    deleteUser
} = require("../controllers/users.js");

const {
    updateLogo,
    updateImage
} = require("../controllers/storage.js");

const {
    validatorCreateItem,
    validatorVerifyUser,
    validatorDataUser,
    validatorCompany

} = require("../validators/users.js");
const { authMiddleware } = require("../middleware/authMiddleware.js");
const { uploadMiddlewareMemory } = require("../middleware/uploadMiddleware.js");
//const customHeader = require("../midldleware/customHeaders.js")

const userRouter = express.Router();

//userRouter.post("/", validatorCreateItem, customHeader, createItem);
userRouter.post("/register", validatorCreateItem, createItem);
userRouter.put("/validate", validatorVerifyUser, authMiddleware, validateUser);
userRouter.post("/login", validatorCreateItem, checkLogUser);


userRouter.put("/register", validatorDataUser, authMiddleware, addDataUser);
userRouter.put("/company", validatorCompany, authMiddleware, addCompanyData);

userRouter.get("/", authMiddleware, getUser);

userRouter.delete("/", authMiddleware, deleteUser);
userRouter.patch("/logo",authMiddleware, uploadMiddlewareMemory.single("image"), updateImage);

module.exports = userRouter;
