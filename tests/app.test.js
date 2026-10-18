const request = require('supertest');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const users = new Map();
let nextUserId = 1;

class UserModel {
  constructor(data) {
    Object.assign(this, data);
    this._id = `user-${nextUserId++}`;
    this.created_at = new Date();
  }

  async save() {
    users.set(this._id, this);
    return this;
  }

  static async findOne(query) {
    if (query.$or) {
      return [...users.values()].find((user) =>
        query.$or.some((condition) =>
          Object.entries(condition).every(([field, value]) => user[field] === value)
        )
      ) || null;
    }

    return [...users.values()].find((user) =>
      Object.entries(query).every(([field, value]) => user[field] === value)
    ) || null;
  }

  static reset() {
    users.clear();
    nextUserId = 1;
  }
}

const employees = new Map();
let nextEmployeeId = 1;

class EmployeeModel {
  constructor(data) {
    Object.assign(this, data);
    this._id = `employee-${nextEmployeeId++}`;
    this.created_at = new Date();
    this.updated_at = this.created_at;
  }

  async save() {
    employees.set(this._id, this);
    return this;
  }

  static async find(query) {
    return [...employees.values()].filter((employee) =>
      Object.entries(query).every(([field, value]) => employee[field] === value)
    );
  }

  static async findOne(query) {
    return [...employees.values()].find((employee) =>
      Object.entries(query).every(([field, value]) => employee[field] === value)
    ) || null;
  }

  static async findByIdAndUpdate(id, data) {
    const employee = employees.get(id);
    if (!employee) return null;

    Object.assign(employee, data);
    return employee;
  }

  static async findByIdAndDelete(id) {
    const employee = employees.get(id) || null;
    employees.delete(id);
    return employee;
  }

  static reset() {
    employees.clear();
    nextEmployeeId = 1;
  }
}

process.env.JWT_SECRET = 'test-only-secret';

jest.doMock('../models/User.js', () => UserModel);
jest.doMock('../models/Employee', () => EmployeeModel);

const authRoutes = require('../routes/auth.routes');
const employeeRoutes = require('../routes/employee.routes');
const requestLogger = require('../middleware/logger.middleware');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({ status: true, message: 'Server is up' });
});

app.use('/api/v1/user', authRoutes);
app.use('/api/v1/emp', employeeRoutes);

const userA = {
  username: 'usera',
  email: 'usera@test.com',
  password: 'password123'
};

const employeeData = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@test.com',
  position: 'Software Engineer',
  salary: 75000,
  date_of_joining: '2026-01-15',
  department: 'Engineering'
};

async function signupAndLogin(user = userA) {
  await request(app).post('/api/v1/user/signup').send(user);
  const response = await request(app)
    .post('/api/v1/user/login')
    .send({ email: user.email, password: user.password });

  return response.body.token;
}

beforeEach(() => {
  UserModel.reset();
  EmployeeModel.reset();
});

describe('COMP 3123 Assignment 1 API Tests', () => {
  test('GET /health should return 200 OK', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
  });

  test('POST /api/v1/user/signup should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/user/signup')
      .send(userA);

    expect(response.statusCode).toBe(201);
    expect(response.body.status).toBe(true);
    expect(response.body.user.username).toBe(userA.username);
  });

  test('POST /api/v1/user/login should authenticate and return a JWT', async () => {
    await request(app).post('/api/v1/user/signup').send(userA);

    const response = await request(app)
      .post('/api/v1/user/login')
      .send({ email: userA.email, password: userA.password });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.token).toBeDefined();
  });

  test('POST /api/v1/emp/employees should create an employee for the authenticated user', async () => {
    const token = await signupAndLogin();

    const response = await request(app)
      .post('/api/v1/emp/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(employeeData);

    expect(response.statusCode).toBe(201);
    expect(response.body.status).toBe(true);
    expect(response.body.data._id).toBeDefined();
  });

  test('GET /api/v1/emp/employees should return employees owned by the user', async () => {
    const token = await signupAndLogin();
    await request(app)
      .post('/api/v1/emp/employees')
      .set('Authorization', `Bearer ${token}`)
      .send(employeeData);

    const response = await request(app)
      .get('/api/v1/emp/employees')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.count).toBe(1);
  });

  test('another user should not be able to access an employee they do not own', async () => {
    const tokenA = await signupAndLogin(userA);
    const employeeResponse = await request(app)
      .post('/api/v1/emp/employees')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(employeeData);

    const tokenB = await signupAndLogin({
      username: 'userb',
      email: 'userb@test.com',
      password: 'password123'
    });
    const response = await request(app)
      .get(`/api/v1/emp/employees/${employeeResponse.body.data._id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(response.statusCode).toBe(404);
  });
});
