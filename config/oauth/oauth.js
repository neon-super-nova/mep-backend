import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { userStore } from "../../store/users/userStore.js";
import { ObjectId } from "mongodb";

export function configureGooglePassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          let user = await userStore.findGoogleUser(email);

          if (!user) {
            user = await userStore.registerGoogleUser({
              email,
              name: profile.displayName,
              googleToken: accessToken,
              googleRefreshToken: refreshToken,
              pictureUrl:
                profile.photos && profile.photos.length > 0
                  ? profile.photos[0].value
                  : "",
            });
          } else {
            if (user.googleToken !== accessToken) {
              await userStore.patchUser(user._id.toString(), {
                googleToken: accessToken,
                googleRefreshToken: refreshToken,
              });
            }
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userStore.collection.findOne({
        _id: new ObjectId(id),
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}
