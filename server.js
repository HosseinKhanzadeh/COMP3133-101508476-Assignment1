require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const connectDB = require("./config/db");
const typeDefs = require("./graphql/typeDefs");

const app = express();
app.use(cors());

connectDB();

console.log("MONGODB_URI:", process.env.MONGODB_URI);

const resolvers = {
  Query: {
    dbStatus: () => "Database connected successfully",
  },
  Mutation: {
    placeholder: () => "",
  },
};

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true
  });
  await server.start();
  server.applyMiddleware({ app, cors: false });

  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}${server.graphqlPath}`);
  });
}

startServer();