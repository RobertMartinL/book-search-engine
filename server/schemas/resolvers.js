const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");
const resolvers = {
  Query: {
    me: async (_, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
        // .populate('thoughts')
        // .populate('friends');

        return userData;
      }

      throw new AuthenticationError("Not logged in");
    },
    // users: async () => {
    //   console.log("===========");
    //   const userData = await User.find().select("-__v -password");
    //   //   .populate('thoughts')
    //   //   .populate('friends');
    //   console.log(userData);
    //   return userData;
    // },
    // user: async (_, { username }) => {
    //   return User.findOne({ username }).select("-__v -password");
    //   //   .populate('friends')
    //   //   .populate('thoughts');
    // },
  },
  Mutation: {
    addUser: async (parent, args) => {
      console.log("==========");
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const token = signToken(user);
        return { token, user };
      },
    saveBook: async (parent, {bookData}, context) => {
        if (context.user) {
            const updatedUser = await User.findByIdAndUpdate(
                {_id: context.user._id},
                {$push: { savedBooks: bookData } },
                { new: true }
            );
            return updatedUser;
        }
        throw new AuthenticationError('You need to be logged in!')
    },
    removeBook: async (parent, {bookId}, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
                {_id: context.user._id},
                {$pull: { savedBooks: { bookId } } },
                { new: true }
            );
            return updatedUser;
        }
        throw new AuthenticationError('You need to be logged in!')
    }
  },

};

module.exports = resolvers;
