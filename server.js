require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const cors = require("cors");
const connectDB = require("./config/db");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

connectDB();

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true
  });
  await server.start();
  server.applyMiddleware({ app, cors: false });

  const httpServer = app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}${server.graphqlPath}`);
  });

  httpServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${process.env.PORT} is already in use. Free it with: netstat -ano | findstr :${process.env.PORT} then taskkill /PID <pid> /F`);
    }
    throw err;
  });
}

startServer().catch((err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});