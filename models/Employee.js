const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    last_name: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative']
    },
    date_of_joining: {
      type: Date,
      required: [true, 'Date of joining is required']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee must belong to a user']
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('Employee', EmployeeSchema);