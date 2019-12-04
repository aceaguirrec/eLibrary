//Set up dependencies
const JwtStrategy = require('passport-jwt').Strategy;  
const ExtractJwt = require('passport-jwt').ExtractJwt;  
const User = require('../models/user.js');
const config = require('../config/config.js');

// Set up JWT passport
module.exports = (passport) => {  
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById({id: jwt_payload.id}, (err, user) => {
        if (err) return done(err, false);
        if (user) {
          done(null, user);
        } 
        else {
          done(null, false);
        }
      });
    }));
  };