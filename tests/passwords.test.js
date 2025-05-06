const supertest = require('supertest');
const { app, server } = require('../server');
const UserModel = require('../models/users');
const mongoose = require('mongoose');
const { encryptPassword } = require("../utils/handlePassword");
const { tokenSign } = require("../utils/handleJWT");
const { reseller } = require('googleapis/build/src/apis/reseller');

let token = '';
let resetToken = '';
let userId = '';

beforeAll(async () => {
  // Esperar a que la conexión a la base de datos esté lista
  await mongoose.connection.once('connected', () => {});

  // Limpiar la base de datos antes de las pruebas
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

  userId = newUser._id;
  token = tokenSign(newUser); 
});

afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});

describe('Password API', () => {

  it('should generate a reset token for the user', async () => {
    const response = await supertest(app)
      .post('/password/getToken')
      .send({
        email: 'testuser@example.com'
      })
      .expect(200);

    expect(response.body.message).toBe('Token de recuperación generado');
    expect(response.body.resetToken).toBeDefined();
    resetToken = response.body.resetToken; 
  });

  it('should return 404 if user is not found for reset token', async () => {
    const response = await supertest(app)
      .post('/password/getToken')
      .send({
        email: 'nonexistentuser@example.com'
      })
      .expect(404);

    expect(response.text).toBe('USER_NOT_FOUND');
  });

  it('should change the password successfully with a valid token', async () => {
    const response = await supertest(app)
      .put('/password/changePassword')
      .set('Authorization', `Bearer ${resetToken}`)
      .send({
        password: 'newpassword123'
      })
      .expect(200);

    expect(response.body.message).toBe('Contraseña actualizada correctamente');
  });

  it('should return 401 if user is not authenticated for password change', async () => {
    const response = await supertest(app)
      .put('/password/changePassword')
      .send({
        password: 'newpassword123'
      })
      .expect(401);

    expect(response.text).toBe('NOT_TOKEN');
  });

  it('should return 400 if reset token is invalid or expired', async () => {
    const response = await supertest(app)
      .put('/password/changePassword')
      .set('Authorization', `Bearer invalid_token`)
      .send({
        password: 'newpassword123'
      })
      .expect(401);

    expect(response.text).toBe('NOT_SESSION');
  });

  it('should return 400 if the password does not meet security requirements', async () => {
    const response = await supertest(app)
      .put('/password/changePassword')
      .set('Authorization', `Bearer ${resetToken}`)
      .send({
        password: 'short'
      })
      .expect(403);
  
    expect(response.text).toBe("{\"errors\":[{\"type\":\"field\",\"value\":\"short\",\"msg\":\"La contraseña debe tener al menos 8 caracteres\",\"path\":\"password\",\"location\":\"body\"}]}");
  });
  

});
