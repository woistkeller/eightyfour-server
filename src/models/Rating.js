const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  rating: {
    type: Number,
  },
  ratedUser: {
    type: mongoose.Schema.Types.ObjectId,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
  },
});

RatingSchema.statics.getAverage = async function (user) {
  const rate = await this.model("Rating")
    .find({ ratedUser: user })
    .then(async (ratings) => {
      let rate = 0;

      //adding all rating from requested user
      await ratings.map((rating) => {
        rate += rating.rating;
      });
      return rate / ratings.length;
    });
  return rate;
};

RatingSchema.statics.getAlreadyRated = async function (user, ratedUser) {
  //returning if the user is already rated, and how much was the rating
  return await this.model("Rating")
    .find({ user: user, ratedUser: ratedUser })
    .then((re) => {
      if (re.length > 0) {
        return { alreadyRated: true, rating: re[0].rating };
      } else {
        return { alreadyRated: false };
      }
    });
};

module.exports = mongoose.model("Rating", RatingSchema);
