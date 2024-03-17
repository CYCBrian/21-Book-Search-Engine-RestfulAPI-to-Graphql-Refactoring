// Import necessary modules and dependencies
const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleWare } = require("@apollo/server/express4");
const path = require("path");
const { authMiddleWare } = require("./utils/auth");
const db = require("./config/connection");
const { typeDefs, resolvers } = require("./schemas");

// Create an Express app and set the port
const app = express();
const PORT = process.env.PORT || 3001;

// Create a new Apollo Server instance with defined type definitions and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Function to start the Apollo Server
const startApolloServer = async () => {
  // Start the Apollo Server
  await server.start();

  // Set up middleware for parsing URL-encoded and JSON data
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Set up the GraphQL endpoint with authentication middleware
  app.use(
    "/graphql",
    expressMiddleWare(server, {
      context: authMiddleWare,
    })
  );

  // Serve static assets in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(_dirname, "../client.dist.index.html"));
    });
  }

  // Start the database connection and listen on the specified port
  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

// Call the function to start the Apollo Server
startApolloServer();
