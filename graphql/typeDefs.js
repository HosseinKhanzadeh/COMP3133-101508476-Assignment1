const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    created_at: String
    updated_at: String
  }

  type AuthPayload {
    message: String
    token: String
    user: User
  }

  type Employee {
    _id: ID
    first_name: String
    last_name: String
    email: String
    gender: String
    designation: String
    salary: Float
    date_of_joining: String
    department: String
    employee_photo: String
    created_at: String
    updated_at: String
  }

  type Query {
    dbStatus: String
    login(usernameOrEmail: String!, password: String!): AuthPayload
  }

  type Mutation {
    signup(username: String!, email: String!, password: String!): AuthPayload
  }
`;

module.exports = typeDefs;
