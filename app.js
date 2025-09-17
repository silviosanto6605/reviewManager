require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const { initAll } = require('./config/initDb');
initAll();

var indexRouter = require('./routes/index');
var edit = require('./routes/edit');
var view = require('./routes/view');
var del = require('./routes/delete');
var loginRouter = require('./routes/login'); // <-- aggiunto

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configurazione delle sessioni
app.use(session({
  secret: 'review_manager_dev_secret',
  resave: false,
  saveUninitialized: false
}));

// Rendi disponibile l'utente loggato nelle view
app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  next();
});

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/view', view);

// Middleware per proteggere le operazioni di modifica/eliminazione
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect('/login');
}

app.use('/delete', isAuthenticated, del);
app.use('/edit', isAuthenticated, edit);

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
