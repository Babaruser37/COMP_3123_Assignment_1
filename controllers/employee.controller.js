const Employee = require('../models/Employee');
const logger = require('../config/logger');

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ user: req.user.userId });
    return res.status(200).json({
      status: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    logger.error(`Error fetching employees: ${error.message}`);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, position, salary, date_of_joining, department } = req.body;

    const newEmployee = new Employee({
      first_name,
      last_name,
      email,
      position,
      salary,
      date_of_joining,
      department, 
      user: req.user.userId 
    });

    await newEmployee.save();
    logger.info(`Employee created successfully by user ${req.user.userId}`, { employeeId: newEmployee._id });

    return res.status(201).json({
      status: true,
      message: 'Employee created successfully',
      data: newEmployee
    });
  } catch (error) {
    logger.error(`Error creating employee: ${error.message}`);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employeeId = req.params.eid;
    const employee = await Employee.findOne({ _id: employeeId, user: req.user.userId });

    if (!employee) {
      logger.warn(`Unauthorized or missing employee access attempt`, { employeeId, userId: req.user.userId });
      return res.status(404).json({ status: false, message: 'Employee not found or unauthorized access.' });
    }

    return res.status(200).json({ status: true, data: employee });
  } catch (error) {
    logger.error(`Error fetching employee by ID: ${error.message}`);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.eid;
    
    const employee = await Employee.findOne({ _id: employeeId, user: req.user.userId });
    if (!employee) {
      logger.warn(`Unauthorized or missing employee update attempt`, { employeeId, userId: req.user.userId });
      return res.status(404).json({ status: false, message: 'Employee not found or unauthorized access.' });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      { ...req.body, updated_at: Date.now() },
      { new: true, runValidators: true }
    );

    logger.info(`Employee updated successfully`, { employeeId });
    return res.status(200).json({
      status: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    logger.error(`Error updating employee: ${error.message}`);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.query.eid || req.params.eid;

    if (!employeeId) {
      return res.status(400).json({ status: false, message: 'Employee ID (eid) is required.' });
    }

    const employee = await Employee.findOne({ _id: employeeId, user: req.user.userId });
    if (!employee) {
      logger.warn(`Unauthorized or missing employee deletion attempt`, { employeeId, userId: req.user.userId });
      return res.status(404).json({ status: false, message: 'Employee not found or unauthorized access.' });
    }

    await Employee.findByIdAndDelete(employeeId);
    logger.info(`Employee deleted successfully`, { employeeId });

    return res.status(204).send(); 
  } catch (error) {
    logger.error(`Error deleting employee: ${error.message}`);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
};