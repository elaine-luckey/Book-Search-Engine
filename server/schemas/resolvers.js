//import user model, signToken and AuthenticationError
const { User } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    //resolver for the users query
    users: async () => {
      return await User.find().select("-__v -password").populate("savedBooks");
    },
    //resolver for the user query (individual user)
    user: async (parent, { username }) => {
      return await User.findOne({ username })
        .select("-__v -password")
        .populate("savedBooks");
    },
    //resolver for the password for the users
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id })
          .select("-__v -password")
          .populate("savedBooks");
      }
      //if not authenticated, throw an error
      throw new AuthenticationError("Please login, you must be logged in!");
    },
  },

  Mutation: {
    //resolver for the 'addUser' mutation
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    //resolver for the 'login' mutation
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      //if the user does not exist, throw the authentication error
      if (!user) {
        throw AuthenticationError;
      }

      //check if the correct password is given
      const correctPassword = await user.isCorrectPassword(password);

      //if the password is incorrect, throw the authentication error
      if (!correctPassword) {
        throw AuthenticationError;
      }

      //if the user is authenticated, sign a token and return it along with the user
      const token = signToken(user);

      return { token, user };
    },
    //resolver for the saveBook mutation
    saveBook: async (parent, { bookSaved }, context) => {
      //check if the user is authenticated
      if (context.user) {
        //update the user's savedBooks
        const updateUserBooks = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookSaved } },
          { new: true, runValidators: true }
        ).populate('savedBooks');

        return updateUserBooks;
      }
      //if the user is not authenticated, throw the authentication error
      throw AuthenticationError;
    },
    //resolver for the removeBook mutation
    removeBook: async (parent, { bookId }, context) => {
      //check if the user is authenticated
        if (context.user) {
          //remove the book with the provided bookId
            const removeSB = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            ).populate('savedBooks');

            return removeSB;
        }
        //if not authenticated, throw the authentication error
        throw AuthenticationError;
    },
  },
};

module.exports = resolvers;