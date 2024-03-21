// Import necessary modules
const { GraphQLError  } = require("graphql");
const jwt = require("jsonwebtoken");

// Set token secret and expiration date
const secret = "mysecretsshhhhh";
const expiration = "2h";

module.exports = {
  //Handle Authentication Error
  AuthenticationError: new GraphQLError ("Could not authenticate user.", {
    extensions: {
      code: "UNAUTHENTICATED",
    },
  }),

  // Middleware function for authentication
  authMiddleware: function ({ req}) {
    // Allow token to be sent via req.query or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // Extract token value if sent in headers
    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }

    // Check if token exists
    if (!token) {
      // return res.status(400).json({ message: "You have no token!" });
      return req;
    }

    // Verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      console.log("Invalid token");
      
    }

    // Proceed to next endpoint
 
    return req
  },

  // Function to sign a JWT token
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    // Generate and return a signed token
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
