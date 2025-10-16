require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

const trips = require('./routes/trips');
const bookings = require('./routes/bookings');
const weather = require('./routes/weather');
const users = require('./auth_user/users');

app.use(express.json());

app.use('/trips', trips);
app.use('/bookings', bookings);
app.use('/api', weather);
app.use('/users', users);

app.listen(port, (err) => {
    if (err) console.log(err);
    console.log('Listening on port', port);
})