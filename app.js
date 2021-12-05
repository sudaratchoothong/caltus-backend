var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
// var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apisRouter = require('./routes/api');

var app = express();

// cookieSession
var cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

const corsConfig = {
  credentials: true,
  origin: true,
};

// view engine setup
app.set('trust proxy', 1)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsConfig))
// app.use(session({
//   secret: 'keyboard cat',
//   cookie: {maxAge: 1000*60*60*24},
//   resave: false,
//   saveUninitialized: true,
// }))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apisRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.setHeader('set-cookie', [
    'cookie1=value1; SameSite=Lax',
    'cookie2=value2; SameSite=None; Secure',
  ]);
  next();
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 5500);
  res.render('error');
});

module.exports = app;
