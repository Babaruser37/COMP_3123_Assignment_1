


# Setup Instructions

Clone the repository and install dependencies:
npm install

Configure environment variables in a .env file:
```
PORT=3000
MONGODB_URI=//<your_mongodb_uri_here>/comp3123_assignment1
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```


Start your local MongoDB server

## Run the application

Development mode: `npm run dev`

Production mode: `npm start`

Run unit/integration tests: `npm run tests`
# Project Structure
```txt
comp_3123_assignment_1/
├── config/         # Database and Winston logger configuration
├── controllers/    # Request logic for users and employees
├── middleware/     # Authentication and request logging
├── models/         # User and Employee Mongoose schemas
├── routes/         # Express route handlers
├── tests/          # Jest integration test suite
├── validators/     # Express-validator input rules
└── server.js       # Main application entry point
```
# API Endpoints

## Health Check

GET /health : Verify API server status

## User Routes (/api/v1/user)

POST /signup : Register a new user account

POST /login : Authenticate user and receive JWT token

## Employee Routes (/api/v1/emp)

Header required for all employee routes: Authorization: Bearer <JWT_TOKEN>

GET /employees : Fetch all employees owned by authenticated user

POST /employees : Create a new employee entry

GET /employees/:eid : Fetch specific employee by ID (ownership enforced)

PUT /employees/:eid : Update existing employee by ID (ownership enforced)

DELETE /employees : Delete employee using query parameter ?eid=ID