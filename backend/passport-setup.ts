import passport from "passport";
import { Strategy as GithubStrategy } from 'passport-github2';import User from './models/User';
import { Profile } from 'passport-github2';
import { VerifyCallback } from 'passport-oauth2';

passport.use(new GithubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID as string,
  clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  callbackURL: "/api/auth/github/redirect"
},
(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
  User.findOne({ githubId: profile.id }).then((currentUser) => {
    if(currentUser){
      // user already exists
      done(null, currentUser);
    } else {
      // create a new user
      new User({
        username: profile.username,
        githubId: profile.id,
        email: profile.emails ? profile.emails[0].value : ''
      }).save().then((newUser) => {
        done(null, newUser);
      });
    }
  });
}));