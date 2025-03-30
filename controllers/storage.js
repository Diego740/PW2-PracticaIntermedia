const storageModel = require("../models/storage.js");
const {uploadToPinata} = require("../utils/handleUploadIPFS.js");

const updateImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se ha subido ninguna imagen" });
        }

        const user = req.user;
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        

        const pinataResponse = await uploadToPinata(fileBuffer, fileName);
        const ipfsFile = pinataResponse.IpfsHash;
        const ipfsUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`;

        //Guardar en coleccion storage
        const data = await storageModel.create({ url: ipfsUrl });

        //Guardar url user
        user.logo = ipfsUrl;
        await user.save();

        res.status(200).json({ message: "Logo actualizado correctamente", url: ipfsUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "ERROR_UPLOAD_COMPANY_IMAGE" });
    }
};

module.exports = { updateImage };