const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

const resolvers = {

  Query: {
    dbStatus: () => "Database connected successfully",

    login: async (_, { usernameOrEmail, password }) => {
      try {
        const user = await User.findOne({
          $or: [
            { username: usernameOrEmail },
            { email: usernameOrEmail }
          ]
        });

        if (!user) {
          throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          throw new Error("Invalid credentials");
        }

        const token = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET || "defaultsecret",
          { expiresIn: "1h" }
        );

        return {
          message: "Login successful",
          token,
          user
        };

      } catch (error) {
        throw new Error(error.message);
      }
    },

    getAllEmployees: async () => {
      return await Employee.find();
    },

    getEmployeeById: async (_, { id }) => {
      const employee = await Employee.findById(id);
      if (!employee) throw new Error("Employee not found");
      return employee;
    },

    searchEmployees: async (_, { designation, department }) => {
      const filter = {};
      if (designation) filter.designation = designation;
      if (department) filter.department = department;

      return await Employee.find(filter);
    }
  },

  Mutation: {
    signup: async (_, { username, email, password }) => {
      try {
        const existingUser = await User.findOne({
          $or: [{ email }, { username }]
        });

        if (existingUser) {
          throw new Error("Username or email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
          username,
          email,
          password: hashedPassword
        });

        const token = jwt.sign(
          { id: newUser._id },
          process.env.JWT_SECRET || "defaultsecret",
          { expiresIn: "1h" }
        );

        return {
          message: "Signup successful",
          token,
          user: newUser
        };

      } catch (error) {
        throw new Error(error.message);
      }
    },

    addEmployee: async (_, { input }) => {
      try {
        const newEmployee = await Employee.create(input);
        return newEmployee;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    updateEmployee: async (_, { id, input }) => {
      const updated = await Employee.findByIdAndUpdate(
        id,
        input,
        { new: true }
      );

      if (!updated) throw new Error("Employee not found");
      return updated;
    },

    deleteEmployee: async (_, { id }) => {
      const deleted = await Employee.findByIdAndDelete(id);
      if (!deleted) throw new Error("Employee not found");
      return "Employee deleted successfully";
    }
  }
};

module.exports = resolvers;
