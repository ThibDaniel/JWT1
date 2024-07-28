const express = require('express');
const bodyParser = require('body-parser');
const passport = require('./passportConfig');
const authRoutes = require('./auth');

const app = express();

app.use(bodyParser.json());
app.use(passport.initialize());

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});