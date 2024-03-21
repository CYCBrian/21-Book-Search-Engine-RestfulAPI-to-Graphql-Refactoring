const { User } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    // Resolver to get a single user by ID or username
    // getSingleUser: async (_, { id, username }, context) => {
    //   const foundUser = await User.findOne({
    //     $or: [{ _id: id }, { username: username }].populate('books'),
    //   });
    //   if (!foundUser) {
    //     throw new Error("Cannot find a user with this id!");
    //   }
    //   return foundUser;
    // },
    me:async(_, args, context)=>{
        if(context.user){
            return await User.findOne({
                $or:[{_id: id}, {username: username}].populate('books')
            })
        }
        throw new AuthenticationError("You need to be logged in!")
    }
  },
  Mutation: {
    // Resolver to create a new user
    // either define userInput or straight use the variables 
addUser: async (_, { username, email, password }, context) => {
  const user = await User.create({ username, email, password });
  if (!user) {
    throw new Error("Something went wrong!");
  }
  const token = signToken(user);
  return { token, user };
},
    // Resolver for user login
    login: async (_, { username, email, password }, context) => {
      const user = await User.findOne({ $or: [{ username }, { email }] });
      if (!user) {
        throw new Error("Can't find this user");
      }
      const correctPW = await user.isCorrectPassword(password);
      if (!correctPW) {
        throw new Error("Wrong password!");
      }
      const token = signToken(user);
      return { token, user };
    },
    // Resolver to save a book to the user's savedBooks array
    saveBook: async (_, { bookInput }, context) => {
      const { user } = context;
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: bookInput } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        throw new Error(err);
      }
    },
    // Resolver to delete a book from the user's savedBooks array
    removeBook: async (_, { bookId }, context) => {
      const { user } = context;
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        throw new Error("Couldn't find user with this id!");
      }
      return updatedUser;
    },
  },
};

module.exports = resolvers;
