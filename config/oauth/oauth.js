import passport from "passport";
import { OAuth2Strategy as GoogleStrategy } from "passport";

export function configureGooglePassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        const user = {
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          image: profile.photos?.[0]?.value,
          accessToken,
        };
        return done(null, user);
      }
    )
  );
}
