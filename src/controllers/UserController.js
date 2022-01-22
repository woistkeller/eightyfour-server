const Rating = require("../models/Rating.js");
const User = require("../models/User");
const bcrypt = require("bcrypt");
require("dotenv").config();

module.exports = {
  async store(req, res) {
    const { username, password, bio, song } = req.body;
    //lower case every username
    const user = username.toLowerCase();

    const userExists = await User.findOne({ username: user });

    if (!username)
      return res
        .status(401)
        .send({ message: "The username field is empty", ok: false });
    if (userExists)
      return res
        .status(409)
        .send({ message: "The username already exists", ok: false });
    if (!password)
      return res
        .status(401)
        .send({ message: "The password field is empty", ok: false });
    if (password.length < 8)
      return res
        .status(406)
        .send({ message: "The password is too short", ok: false });
    if (password.length > 32)
      return res
        .status(406)
        .send({ message: "The password is too long", ok: false });

    bcrypt.hash(password, 10, async (er, hash) => {
      //return 401 if bcrypt failed encrypting password
      if (er)
        return res.status(401).send({ message: "An error occurs", ok: false });

      await User.create({
        user,
        password: hash,
        bio,
        song,
      }).then(() => {
        return res.status(200).send({ ok: true });
      });
    });
  },
  async index(req, res) {
    const { username } = req.params;
    const ratingUser = req.user;

    await User.findOne({
      username: username,
    })
      .select(["-password"])
      .then(async (user) => {
        if (user.length === 0)
          return res.status(404).send({
            message: "There is no user with that username",
            ok: false,
          });

        //copy user object to user
        user = { ...user._doc };

        //getting average rating from user, see rating model for futher information
        user["rating"] = await Rating.getAverage(user._id);
        //verify if rating user already rated user
        user["userRating"] = await Rating.getAlreadyRated(ratingUser, user._id);

        //response this all
        return res.status(200).json({ data: user, ok: true });
      });
  },
};
