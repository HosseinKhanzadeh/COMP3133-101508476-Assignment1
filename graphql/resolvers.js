const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    }
  }
};

module.exports = resolvers;
