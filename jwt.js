require('dotenv').config();
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_db_user',
  host: 'your_db_host',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 5432,
});

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET,
};

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    pool.query('SELECT * FROM users WHERE id = $1', [jwt_payload.id], (err, result) => {
      if (err) {
        return done(err, false);
      }
      if (result.rows.length > 0) {
        return done(null, result.rows[0]);
      } else {
        return done(null, false);
      }
    });
  })
);

module.exports = passport;