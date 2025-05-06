const supertest = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');
const Project = require('../models/projects');
const UserModel = require('../models/users');
const Client = require('../models/clients');
const { encryptPassword } = require("../utils/handlePassword");
const { tokenSign } = require("../utils/handleJWT");

let token = '';
let projectId = '';
let clientId = ''; 
const invalidProjectId = '607f1f77bcf86cd799439011';

beforeAll(async () => {
  // Esperar a que la conexión a la base de datos esté lista
  await mongoose.connection.once('connected', () => {});

  // Limpiar la base de datos antes de las pruebas
  await Project.deleteMany({});
  await UserModel.deleteMany({});
  await Client.deleteMany({});

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

  const newClient = await Client.create({
    name: 'Cliente 1',
    address: 'Calle Ficticia 123',
    email: 'cliente1@empresa.com',
    user: newUser._id
  });
  clientId = newClient._id;
});

afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});

describe('Project API', () => {

  it('should create a new project', async () => {
    const response = await supertest(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Obra A',
        projectCode: 'ID-Proyecto-1',
        code: '0001',
        address: {
          street: 'Carlos II',
          number: 22,
          postal: 28936,
          city: 'Móstoles',
          province: 'Madrid'
        },
        begin: '07-01-2024',
        end: '07-01-2025',
        notes: 'Proyecto en fase de planificación',
        clientId: clientId
      })
      .expect(201);

    expect(response.body.data).toHaveProperty('name', 'Obra A');
    expect(response.body.data).toHaveProperty('projectCode', 'ID-Proyecto-1');
    projectId = response.body.data._id; 
  });

  it('should get all projects', async () => {
    const response = await supertest(app)
      .get('/projects')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toHaveLength(1); 
    expect(response.body.data[0]).toHaveProperty('name', 'Obra A');
  });

  it('should get project by ID', async () => {
    const response = await supertest(app)
      .get(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toHaveProperty('name', 'Obra A');
    expect(response.body.data).toHaveProperty('projectCode', 'ID-Proyecto-1');
  });

  it('should update the project data', async () => {
    const response = await supertest(app)
      .put(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Obra B',
        projectCode: 'ID-Proyecto-2',
        code: '0002',
        address: {
          street: 'Calle Ficticia',
          number: 45,
          postal: 28930,
          city: 'Alcalá de Henares',
          province: 'Madrid'
        },
        begin: '08-01-2024',
        end: '08-01-2025',
        notes: 'Proyecto en ejecución',
        clientId: clientId
      })
      .expect(200);

    expect(response.body.data).toHaveProperty('name', 'Obra B');
    expect(response.body.data).toHaveProperty('projectCode', 'ID-Proyecto-2');
  });

  it('should delete the project (soft delete)', async () => {
    const response = await supertest(app)
      .delete(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .query({ soft: 'true' }) 
      .expect(200);

    expect(response.body.message).toBe('Proyecto archivado correctamente');
  });

  it('should restore a deleted project', async () => {
    const response = await supertest(app)
      .patch(`/projects/restore/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toBe('Proyecto restaurado correctamente');
  });

  it('should delete the project (hard delete)', async () => {
    const response = await supertest(app)
      .delete(`/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .query({ soft: 'false' }) 
      .expect(200);

    expect(response.body.message).toBe('Proyecto eliminado permanentemente');
  });

  it('should return 401 if no token is provided when creating a project', async () => {
    const response = await supertest(app)
      .post('/projects')
      .send({
        name: 'Proyecto sin token',
        projectCode: 'PROJ99999',
        code: '9999',
        address: {
          street: 'Calle Ficticia',
          number: 123,
          postal: 28001,
          city: 'Madrid',
          province: 'Madrid'
        },
        begin: '2024-01-01',
        end: '2024-12-31',
        notes: 'Notas del proyecto',
        clientId: clientId
      })
      .expect(401);

    expect(response.text).toBe('NOT_TOKEN');
  });

  it('should return 403 if the client ID does not exist when creating a project', async () => {
    const response = await supertest(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Inexistente',
        projectCode: 'PROJ12345',
        code: '1234',
        address: {
          street: 'Calle Falsa',
          number: 123,
          postal: 28001,
          city: 'Madrid',
          province: 'Madrid'
        },
        begin: '01-01-2024',
        end: '01-01-2025',
        notes: 'Proyecto de construcción',
        clientId: 'nonexistentClientId'
      })
      .expect(403);

  });

  it('should return 400 if required fields are missing when creating a project', async () => {
    const response = await supertest(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '',
        projectCode: 'PROJ99999',
        code: '9999',
        address: {
          street: 'Calle Ficticia',
          number: 123,
          postal: 28001,
          city: 'Madrid',
          province: 'Madrid'
        },
        begin: '2024-01-01',
        end: '2024-12-31',
        notes: 'Notas del proyecto',
        clientId: clientId
      })
      .expect(403);

  });

  it('should return 403 if the end date is earlier than the start date when creating a project', async () => {
    const response = await supertest(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto con fechas inválidas',
        projectCode: 'PROJ98765',
        code: '9876',
        address: {
          street: 'Calle Inexistente',
          number: 100,
          postal: 28001,
          city: 'Madrid',
          province: 'Madrid'
        },
        begin: '10-12-2024',
        end: '09-12-2024',
        notes: 'Proyecto con fechas incorrectas',
        clientId: clientId
      })
      .expect(403);
  
    expect(response.text).toContain('La fecha de inicio debe ser anterior a la de finalización');
  });

  it('should return 403 if the address is incomplete when creating a project', async () => {
    const response = await supertest(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto con dirección incompleta',
        projectCode: 'PROJ555',
        code: '5555',
        address: {
          street: '',
          number: 0,
          postal: 0,
          city: 'Madrid',
          province: 'Madrid'
        },
        begin: '01-01-2025',
        end: '12-12-2025',
        notes: 'Proyecto con dirección incompleta',
        clientId: clientId
      })
      .expect(403);
  
    expect(response.text).toContain('La dirección debe contener todos los campos necesarios');

  });

  it('should return 400 if the clientId is invalid when creating a project', async () => {
    const response = await supertest(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto con cliente inválido',
        projectCode: 'PROJ123',
        code: '1234',
        address: {
          street: 'Calle Ficticia',
          number: 123,
          postal: 28001,
          city: 'Madrid',
          province: 'Madrid'
        },
        begin: '2024-01-01',
        end: '2024-12-31',
        notes: 'Notas del proyecto',
        clientId: 'invalidClientId'
      })
      .expect(403);
  
    expect(response.text).toContain('El ID del cliente debe ser un ObjectId válido');
  });
  
  it('should return 403 if the address is incomplete when creating a project', async () => {
    const response = await supertest(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto con dirección incompleta',
        projectCode: 'PROJ555',
        code: '5555',
        address: "Direccion",
        begin: '01-01-2025',
        end: '12-12-2025',
        notes: 'Proyecto con dirección incompleta',
        clientId: clientId
      })
      .expect(403);
  
    expect(response.text).toContain('La dirección debe contener todos los campos necesarios');

  });

  it('should return 400 if the projectCode already exists when creating a project', async () => {
    // Crear el primer proyecto con un código específico
    await supertest(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Obra A',
        projectCode: 'PROJ12345',  // Código único
        code: '0001',
        address: {
          street: 'Carlos II',
          number: 22,
          postal: 28936,
          city: 'Móstoles',
          province: 'Madrid'
        },
        begin: '07-01-2024',
        end: '07-01-2025',
        notes: 'Proyecto en fase de planificación',
        clientId: clientId
      })
      .expect(201);
  
    // Intentar crear otro proyecto con el mismo projectCode
    const response = await supertest(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Obra B',
        projectCode: 'PROJ12345',  // El mismo código de proyecto
        code: '0002',
        address: {
          street: 'Calle Ficticia',
          number: 45,
          postal: 28930,
          city: 'Alcalá de Henares',
          province: 'Madrid'
        },
        begin: '08-01-2024',
        end: '08-01-2025',
        notes: 'Proyecto en ejecución',
        clientId: clientId
      })
      .expect(400);
  
    expect(response.body.message).toBe('El proyecto ya existe.');
  });
  
  
  it('should return 404 if the project does not exist when attempting to hard delete', async () => {
    const response = await supertest(app)
      .delete(`/projects/${invalidProjectId}`)
      .set('Authorization', `Bearer ${token}`)
      .query({ soft: 'false' }) 
      .expect(404);
  
    expect(response.body.message).toBe('Proyecto no encontrado');
  });
  
  
});
