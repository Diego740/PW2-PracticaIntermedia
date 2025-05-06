const supertest = require('supertest');
const { app, server } = require('../server');
const UserModel = require('../models/users');
const mongoose = require('mongoose');
const { encryptPassword } = require("../utils/handlePassword"); 
const { tokenSign } = require("../utils/handleJWT"); 

let token = '';
let userId = '';
let testUser = null;

beforeAll(async () => {
  // Esperar a que la conexión a la base de datos esté lista
  await mongoose.connection.once('connected', () => {});

  // Limpiar la base de datos antes de las pruebas
  await UserModel.deleteMany({});

  const encryptedPassword = await encryptPassword('password123');

  // Crear usuario para las pruebas
  const newUser = await UserModel.create({
    email: 'testuser@example.com',
    password: encryptedPassword,
    code: 123456,
    role: 'user',
    verificated: true,
  });

  userId = newUser._id;

  
  token = tokenSign(newUser);
});

afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});

describe('User API', () => {

  it('should register a new user', async () => {
    const response = await supertest(app)
      .post('/users/register')
      .send({
        email: 'newuser@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('email', 'newuser@example.com');
    expect(response.body).toHaveProperty('token');
  });

  it('should login a user', async () => {
    const response = await supertest(app)
      .post('/users/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      })
      .expect(200);

    expect(response.body).toHaveProperty('token');
  });

  it('should validate the user with correct code', async () => {
    const response = await supertest(app)
      .put('/users/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '123456' })
      .expect(200);

    expect(response.body.message).toBe('Email verficado');
  });

  it('should get user data', async () => {
    const response = await supertest(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.user).toHaveProperty('email', 'testuser@example.com');
  });

  it('should update the user data', async () => {
    const response = await supertest(app)
      .put('/users/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Diego',
        surnames: 'Aranda',
        nif: '18456604R',
      })
      .expect(200);

    expect(response.body.message).toBe('Datos actualizados correctamente');
  });

  it('should update the user company data', async () => {
    const response = await supertest(app)
      .put('/users/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company: {
          name: 'Servitop, SL.',
          cif: 'B12345678',
          street: 'Carlos V',
          number: 22,
          postal: 28936,
          city: 'Móstoles',
          province: 'Madrid',
        },
      })
      .expect(200);

    expect(response.body.message).toBe('Datos de la empresa actualizados correctamente');
  });

  it('should invite a new user', async () => {
    const response = await supertest(app)
      .post('/users/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'inviteuser@example.com' })
      .expect(200);

    expect(response.body.message).toBe('Invitación enviada correctamente');
  });

  it('should delete the user', async () => {
    const response = await supertest(app)
      .delete('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toBe('Usuario desactivado correctamente');
  });

  
});
