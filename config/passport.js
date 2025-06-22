const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const userModel = require("../models/user-model");

module.exports = function (passport) {
  // Serialize user to store user ID in session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user by ID from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Define Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email" }, // login using email
      async (email, password, done) => {
        try {
          const user = await userModel.findOne({ email });

          if (!user) {
            return done(null, false, { message: "No user found with this email." });
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            return done(null, false, { message: "Incorrect password." });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
