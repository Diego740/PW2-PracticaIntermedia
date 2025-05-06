const supertest = require("supertest");
const { app, server } = require("../server");
const mongoose = require("mongoose");
const DeliveryNote = require("../models/deliveryNote");
const UserModel = require("../models/users");
const Project = require("../models/projects");
const Client = require("../models/clients");
const { encryptPassword } = require("../utils/handlePassword");
const { tokenSign } = require("../utils/handleJWT");

let token = "";
let deliveryNoteId = "";
let projectId = "";
let clientId = "";

beforeAll(async () => {
    await mongoose.connection.once("connected", () => {});
    await DeliveryNote.deleteMany({});
    await UserModel.deleteMany({});
    await Project.deleteMany({});
    await Client.deleteMany({});

    const encryptedPassword = await encryptPassword("password123");
    const newUser = await UserModel.create({
        email: "testuser@example.com",
        password: encryptedPassword,
        code: 123456,
        role: "user",
        verificated: true,
    });

    token = tokenSign(newUser);

    const newClient = await Client.create({
        name: "Cliente 1",
        address: "Calle Ficticia 123",
        email: "cliente1@empresa.com",
        user: newUser._id,
    });
    clientId = newClient._id;

    const newProject = await Project.create({
        name: "Obra A",
        projectCode: "ID-Proyecto-1",
        code: "0001",
        address: {
            street: "Carlos II",
            number: 22,
            postal: 28936,
            city: "Móstoles",
            province: "Madrid",
        },
        begin: "07-01-2024",
        end: "07-01-2025",
        notes: "Proyecto en fase de planificación",
        clientId: clientId,
        userId: newUser._id,
    });
    projectId = newProject._id;
});

afterAll(async () => {
    server.close();
    await mongoose.connection.close();
});

describe("DeliveryNote API", () => {
    it("should create a new delivery note", async () => {
        const response = await supertest(app)
            .post("/deliverynotes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                projectId: projectId,
                clientId: clientId,
                format: "hours",
                hours: 10,
                description: "Trabajo realizado en el proyecto X",
            })
            .expect(201);

        expect(response.body.data).toHaveProperty(
            "description",
            "Trabajo realizado en el proyecto X"
        );
        deliveryNoteId = response.body.data._id;
    });

    it("should get all delivery notes", async () => {
        const response = await supertest(app)
            .get("/deliverynotes")
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]).toHaveProperty(
            "description",
            "Trabajo realizado en el proyecto X"
        );
    });

    it("should get delivery note by ID", async () => {
        const response = await supertest(app)
            .get(`/deliverynotes/${deliveryNoteId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.body.data).toHaveProperty(
            "description",
            "Trabajo realizado en el proyecto X"
        );
        expect(response.body.data.projectId).toHaveProperty(
            "_id",
            projectId.toString()
        );
    });

    it("should generate a PDF of the delivery note", async () => {
        const response = await supertest(app)
            .get(`/deliverynotes/pdf/${deliveryNoteId}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200);

        expect(response.headers["content-type"]).toBe("application/pdf");
        expect(response.headers["content-disposition"]).toContain("attachment");
    });

    it("should sign the delivery note", async () => {
        const signatureImageBuffer = "signatureImageBufferExample";
        const signatureImageName = "firma.png";

        const response = await supertest(app)
            .post("/deliverynotes/sign")
            .set("Authorization", `Bearer ${token}`)
            .send({
                deliveryNoteId: deliveryNoteId,
                signatureImageBuffer: signatureImageBuffer,
                signatureImageName: signatureImageName,
            })
            .expect(200);

        expect(response.body.message).toBe("Albarán firmado correctamente");
        expect(response.body.data).toHaveProperty("signatureUrl");
        expect(response.body.data).toHaveProperty("pdfUrl");
    });

    it("should delete the delivery note (soft delete)", async () => {
        const response = await supertest(app)
            .delete(`/deliverynotes/${deliveryNoteId}`)
            .set("Authorization", `Bearer ${token}`)
            .query({ soft: "true" })
            .expect(200);

        expect(response.body.message).toBe(
            "Albarán archivado correctamente (soft delete)"
        );
    });

    it("should return 401 if no token is provided when creating a delivery note", async () => {
        let response = await supertest(app)
            .post("/deliverynotes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                projectId: projectId,
                clientId: clientId,
                format: "hours",
                hours: 10,
                description: "Trabajo realizado en el proyecto X",
            })
            .expect(201);

        expect(response.body.data).toHaveProperty(
            "description",
            "Trabajo realizado en el proyecto X"
        );
        deliveryNoteId = response.body.data._id;

        response = await supertest(app)
            .post("/deliverynotes")
            .send({
                projectId: projectId,
                clientId: clientId,
                format: "hours",
                hours: 10,
                description: "Trabajo realizado en el proyecto X",
            })
            .expect(401);

        expect(response.text).toBe("NOT_TOKEN");
    });

    it("should return 403 if the client does not exist when creating a delivery note", async () => {
        const response = await supertest(app)
            .post("/deliverynotes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                projectId: projectId,
                clientId: "nonexistentClientId",
                format: "hours",
                hours: 10,
                description: "Trabajo realizado en el proyecto X",
            })
            .expect(403);

        expect(response.text).toContain("El ID del cliente debe ser");
    });

    it("should return 404 if the delivery note does not exist when retrieving by ID", async () => {
        const response = await supertest(app)
            .get(`/deliverynotes/607f1f77bcf86cd799439011`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);

        expect(response.body.message).toBe("Albarán no encontrado");
    });

    it("should return 403 if the format is invalid when creating a delivery note", async () => {
        const response = await supertest(app)
            .post("/deliverynotes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                projectId: projectId,
                clientId: clientId,
                format: "invalidFormat",
                hours: 10,
                description: "Trabajo realizado en el proyecto X",
            })
            .expect(403);

        expect(response.text).toContain(
            'El formato debe ser \\\"hours\\\" o \\\"materials'
        );
    });

    it("should return 403 if the project does not belong to the specified client", async () => {
        const anotherClient = await Client.create({
            name: "Cliente 2",
            address: "Calle Ficticia 456",
            email: "cliente2@empresa.com",
            user: clientId,
        });

        const response = await supertest(app)
            .post("/deliverynotes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                projectId: projectId,
                clientId: anotherClient._id,
                format: "hours",
                hours: 10,
                description: "Trabajo realizado en el proyecto X",
            })
            .expect(403);

        expect(response.text).toContain(
            "El proyecto no pertenece al cliente proporcionado"
        );
    });

    it("should return 404 if the delivery note does not exist when signing it", async () => {
        const response = await supertest(app)
            .post("/deliverynotes/sign")
            .set("Authorization", `Bearer ${token}`)
            .send({
                deliveryNoteId: "607f1f77bcf86cd799439011",
                signatureImageBuffer: "signatureImageBufferExample",
                signatureImageName: "firma.png",
            })
            .expect(404);

        expect(response.body.message).toBe("Albarán no encontrado");
    });

    it("should delete the delivery note (hard delete)", async () => {
        const response = await supertest(app)
            .delete(`/deliverynotes/${deliveryNoteId}`)
            .set("Authorization", `Bearer ${token}`)
            .query({ soft: "false" })
            .expect(200);

        expect(response.body.message).toBe(
            "Albarán eliminado permanentemente (hard delete)"
        );
    });

    
});
