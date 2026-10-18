const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/Employee.controller');
const verifyToken = require('../middleware/auth.middleware');
const { validateEmployee } = require('../validators/validator');

router.use(verifyToken);

router.get('/employees', employeeController.getEmployees);
router.post('/employees', validateEmployee, employeeController.createEmployee);
router.get('/employees/:eid', employeeController.getEmployeeById);
router.put('/employees/:eid', validateEmployee, employeeController.updateEmployee);
router.delete('/employees', employeeController.deleteEmployee);
router.delete('/employees/:eid', employeeController.deleteEmployee);

module.exports = router;