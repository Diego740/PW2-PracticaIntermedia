const supertest = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const Client = require('../models/clients');
const UserModel = require('../models/users');
const { encryptPassword } = require("../utils/handlePassword");
const { tokenSign } = require("../utils/handleJWT");

let token = '';
let clientId = '';
const invalidClientId = '607f1f77bcf86cd799439011';

beforeAll(async () => {
  // Esperar a que la conexión a la base de datos esté lista
  await mongoose.connection.once('connected', () => {});

  // Limpiar la base de datos antes de las pruebas
  await Client.deleteMany({});
  await UserModel.deleteMany({});

  // Crear un usuario para las pruebas
  const encryptedPassword = await encryptPassword('password123');
  const newUser = await UserModel.create({
    email: 'testuser@example.com',
    password: encryptedPassword,
    code: 123456,
    role: 'user',
    verificated: true,
  });

  token = tokenSign(newUser);
});

afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});

describe('Client API', () => {

  it('should create a new client', async () => {
    const response = await supertest(app)
      .post('/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente A',
        address: 'Calle Ficticia 123',
        email: 'cliente@empresa.com'
      })
      .expect(201);

    expect(response.body.data).toHaveProperty('name', 'Cliente A');
    expect(response.body.data).toHaveProperty('email', 'cliente@empresa.com');
    clientId = response.body.data._id;
  });

  it('should get all clients', async () => {
    const response = await supertest(app)
      .get('/client')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toHaveLength(1); // Ya tenemos un cliente creado en el test anterior
    expect(response.body.data[0]).toHaveProperty('name', 'Cliente A');
  });

  it('should get client by ID', async () => {
    const response = await supertest(app)
      .get(`/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toHaveProperty('name', 'Cliente A');
    expect(response.body.data).toHaveProperty('email', 'cliente@empresa.com');
  });

  it('should return 400 if the client with the same email already exists', async () => {
    const response = await supertest(app)
      .post('/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente A',
        address: 'Calle Ficticia 123',
        email: 'cliente@empresa.com'
      })
      .expect(400);
  
    expect(response.body.message).toBe('El cliente ya existe.');
  });

  it('should update the client data', async () => {
    const response = await supertest(app)
      .put(`/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente A Actualizado',
        address: 'Calle Actualizada',
        email: 'cliente_actualizado@empresa.com'
      })
      .expect(200);

    expect(response.body.data).toHaveProperty('name', 'Cliente A Actualizado');
    expect(response.body.data).toHaveProperty('email', 'cliente_actualizado@empresa.com');
  });

  it('should return 201 if the client with the same email no longer have the same email', async () => {
    const response = await supertest(app)
      .post('/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente A',
        address: 'Calle Ficticia 123',
        email: 'cliente@empresa.com'
      })
      .expect(201);
  
    
  });


  it('should delete the client (soft delete)', async () => {
    const response = await supertest(app)
      .delete(`/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .query({ soft: 'true' }) 
      .expect(200);

    expect(response.body.message).toBe('Cliente archivado correctamente');
  });

  it('should restore a deleted client', async () => {
    const response = await supertest(app)
      .patch(`/client/restore/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toBe('Cliente restaurado correctamente');
  });

  it('should delete the client (hard delete)', async () => {
    const response = await supertest(app)
      .delete(`/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .query({ soft: 'false' }) 
      .expect(200);

    expect(response.body.message).toBe('Cliente eliminado permanentemente');
  });

  it('should return 401 if no token is provided when creating a client', async () => {
    const response = await supertest(app)
      .post('/client')
      .send({
        name: 'Cliente A',
        address: 'Calle Ficticia 123',
        email: 'cliente@empresa.com'
      })
      .expect(401);
  
    expect(response.text).toBe('NOT_TOKEN');
  });
  

  it('should return 404 if the client does not exist for restoration', async () => {
    const response = await supertest(app)
      .patch(`/client/restore/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(response.body.message).toBe('Cliente no encontrado o no eliminado');
  });

  it('should return 404 if the client ID does not exist', async () => {
    const response = await supertest(app)
      .get(`/client/${invalidClientId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  
    expect(response.body.message).toBe('Cliente no encontrado');
  });

  it('should return 403 if the updated client data is invalid', async () => {
    const response = await supertest(app)
      .put(`/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '',
        address: 'Calle Actualizada',
        email: 'cliente_actualizado@empresa.com'
      })
      .expect(403);
  
    expect(response.text).toBe("{\"errors\":[{\"type\":\"field\",\"value\":\"\",\"msg\":\"El nombre no puede estar vacío\",\"path\":\"name\",\"location\":\"body\"}]}");
  });

  it('should return 404 if the client does not exist for deletion (soft delete)', async () => {
    const response = await supertest(app)
      .delete(`/client/${invalidClientId}`)
      .set('Authorization', `Bearer ${token}`)
      .query({ soft: 'true' })
      .expect(404);
  
    expect(response.body.message).toBe('Cliente no encontrado');
  });

  it('should return 404 if the client does not exist for hard delete', async () => {
    
    const response = await supertest(app)
      .delete(`/client/${invalidClientId}`)
      .set('Authorization', `Bearer ${token}`)
      .query({ soft: 'false' }) 
      .expect(404);
  
    expect(response.body.message).toBe('Cliente no encontrado');
  });
  
  
  it('should return 403 if the email is invalid when creating a client', async () => {
    const response = await supertest(app)
      .post('/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente C',
        address: 'Calle Ficticia 123',
        email: 'clienteempresa.com'
      })
      .expect(403);
  
    expect(response.text).toBe("{\"errors\":[{\"type\":\"field\",\"value\":\"clienteempresa.com\",\"msg\":\"Debe ser un email válido\",\"path\":\"email\",\"location\":\"body\"}]}");
  });
  
  it('should return 404 if the client ID is not valid for update', async () => {
    const response = await supertest(app)
      .put(`/client/${invalidClientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente A Actualizado',
        address: 'Calle Actualizada',
        email: 'cliente_actualizado@empresa.com'
      })
      .expect(404);
  
    expect(response.body.message).toBe('Cliente no encontrado');
  });
  
  it('should return 401 if no valid token is provided', async () => {
    const response = await supertest(app)
      .get('/client')
      .expect(401);
  
    expect(response.text).toBe('NOT_TOKEN');
  });
  
  
  
});
