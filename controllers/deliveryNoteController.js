const DeliveryNote = require("../models/deliveryNote");
const Project = require("../models/projects");
const Client = require("../models/clients");
const User = require("../models/users")
const { handleHttpError } = require("../utils/handleError");
const { uploadToPinata } = require("../utils/handleUploadIPFS");
const pdfKit = require("pdfkit");
const { matchedData } = require("express-validator");

const createDeliveryNote = async (req, res) => {
    try {
        const body = matchedData(req);
        const { projectId, clientId, format, material, hours, description } =
            body;
        const userId = req.user.id;

        if (!["hours", "materials"].includes(format)) {
            return res
                .status(400)
                .json({ message: 'El formato debe ser "hours" o "materials"' });
        }

        const project = await Project.findById(projectId);
        const client = await Client.findById(clientId);

        if (!project || !client) {
            return res
                .status(404)
                .json({ message: "Proyecto o cliente no encontrados" });
        }

        const newDeliveryNote = new DeliveryNote({
            userId,
            projectId,
            clientId,
            format,
            material,
            hours,
            description,
        });

        await newDeliveryNote.save();
        res.status(201).json({ data: newDeliveryNote });
    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_CREATING_DELIVERY_NOTE", 500);
    }
};

const getAllDeliveryNotes = async (req, res) => {
    try {
        const deliveryNotes = await DeliveryNote.find({ userId: req.user.id })
            .populate("projectId")
            .populate("clientId")
            .populate("userId");

        res.status(200).json({ data: deliveryNotes });
    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_GETTING_DELIVERY_NOTES", 500);
    }
};

const getDeliveryNoteById = async (req, res) => {
    try {
        const deliveryNote = await DeliveryNote.findById(req.params.id)
            .populate("projectId")
            .populate("clientId")
            .populate("userId");

        if (!deliveryNote) {
            return res.status(404).json({ message: "Albarán no encontrado" });
        }

        res.status(200).json({ data: deliveryNote });
    } catch (error) {
        console.error(error);
        handleHttpError(res, "ERROR_GETTING_DELIVERY_NOTE", 500);
    }
};

const generatePDFBuffer = (deliveryNote) => {
    return new Promise((resolve, reject) => {
      const doc = new pdfKit();
      const buffers = [];
  
      doc.on("data", (chunk) => {
        buffers.push(chunk);
      });
  
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
  
      doc.fontSize(12).text(`Albarán para el Proyecto: ${deliveryNote.projectId.name}`, { align: "center" });
      doc.text(`Cliente: ${deliveryNote.clientId.name}`, { align: "center" });
      doc.text(`Fecha: ${deliveryNote.createdAt.toISOString().substring(0, 10)}`);
      doc.text(`Descripción: ${deliveryNote.description}`);
  
      if (deliveryNote.format === "hours") {
        doc.text(`Horas trabajadas: ${deliveryNote.hours}`);
      } else {
        doc.text(`Material usado: ${deliveryNote.material}`);
      }
  
      if (deliveryNote.sign) {
        doc.text(`Firma: ${deliveryNote.sign}`);
      }
  
      doc.end();
    });
  };
  

  const generatePDF = async (req, res) => {
    try {
      const deliveryNote = await DeliveryNote.findById(req.params.id)
        .populate('projectId')
        .populate('clientId')
        .populate('userId');
  
      if (!deliveryNote) {
        return res.status(404).json({ message: 'Albarán no encontrado' });
      }
  
      const pdfBuffer = await generatePDFBuffer(deliveryNote);
  
      const fileName = `albaran_${req.params.id}.pdf`;
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', 'application/pdf');
  
      res.end(pdfBuffer);
  
    } catch (error) {
      console.error(error);
      handleHttpError(res, "ERROR_GENERATING_PDF", 500);
    }
  };
  
  

  const signDeliveryNote = async (req, res) => {
    try {
      const { deliveryNoteId, signatureImageBuffer, signatureImageName } = req.body;
  
      const deliveryNote = await DeliveryNote.findById(deliveryNoteId)
        .populate('projectId')
        .populate('clientId')
        .populate('userId');;
      if (!deliveryNote) {
        return res.status(404).json({ message: "Albarán no encontrado" });
      }
  
      //Subir la firma a Pinata
      const signaturePinataResponse = await uploadToPinata(signatureImageBuffer, signatureImageName);
      const signatureUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${signaturePinataResponse.IpfsHash}`;
  
      //Subir el PDF a Pinata
      const pdfBuffer = await generatePDFBuffer(deliveryNote); 
      const pdfPinataResponse = await uploadToPinata(pdfBuffer, `albaran_${deliveryNoteId}.pdf`);
      const pdfUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${pdfPinataResponse.IpfsHash}`;
  
      //Actualizar
      deliveryNote.signed = true;
      deliveryNote.sign = signatureUrl;
      deliveryNote.pdfUrl = pdfUrl;
      await deliveryNote.save();
  
  
      res.status(200).json({
        message: "Albarán firmado correctamente",
        data: { signatureUrl, pdfUrl },
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al firmar el albarán" });
    }
  };
  

const deleteDeliveryNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { soft } = req.query;
    

    const deliveryNote = await DeliveryNote.findById(id);
    if (!deliveryNote) {
      return res.status(404).json({ message: 'Albarán no encontrado' });
    }

    if (soft === "false") {
      await deliveryNote.deleteOne();
      return res.status(200).json({ message: 'Albarán eliminado permanentemente (hard delete)' });
    }

    await deliveryNote.delete();
    return res.status(200).json({ message: 'Albarán archivado correctamente (soft delete)' });

  } catch (error) {
    console.error(error);
    handleHttpError(res, "ERROR_DELETING_DELIVERY_NOTE", 500);
  }
};

module.exports = {
    createDeliveryNote,
    getAllDeliveryNotes,
    getDeliveryNoteById,
    generatePDF,
    signDeliveryNote,
    deleteDeliveryNote,
};
