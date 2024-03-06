var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var axios = require('axios');

require('dotenv').config();
require('./config/database');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var activitiesRouter = require('./routes/activities');
var authRouter = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/activities', activitiesRouter);
app.use('/auth', authRouter);

// --> Strava OAuth 2.0 <-- //
app.get('/strava-auth', (req, res) => {
  const clientId = '122558';
  const redirectUri = 'localhost:3000/activities';

  // Redirect users to Strava authorization URL
  res.redirect(`https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=read_all,activity:read_all`);
});

// Handle the callback from Strava
app.get('/exchange-token', async (req, res) => {
  try {
    const { code } = req.query;

    // Replace these with your actual Strava app credentials
    const clientId = '122558';
    const clientSecret = '4c74496ebcdbc71208a986f2116f9c851331e503';

    const requestUrl = new URL("https://www.strava.com/oauth/token")
    const searchParams = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
    })

    // Exchange the code for an access token
    const { data: tokenResponse } = await axios.post(requestUrl.toString() + "?" + searchParams.toString());
    // Store the accessToken securely for future use

    // Redirect the user or perform further actions
    res.cookie("accessToken", tokenResponse.access_token);
    res.cookie("accountId", tokenResponse.athlete.id);
    res.cookie("refreshToken", tokenResponse.refresh_token);
    res.status(200).send();
  } catch (error) {
    console.error('Error handling Strava callback:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch activities from Strava
app.get('/api/stats', async (req, res) => {
  try {
    const accountId = req.cookies.accountId;
    const accessToken = req.cookies.accessToken;

    const statsResponse = await axios.get(`https://www.strava.com/api/v3//athletes/${accountId}/stats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const stats = statsResponse.data;
    res.json(stats);
  } catch (error) {
    console.error('Error fetching Strava activities:', error);
    res.status(500).send('Internal Server Error');
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
