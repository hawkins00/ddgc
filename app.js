const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
//var logger = require('morgan');

const indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

const app = express();

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
//app.use('/users', usersRouter);

module.exports = app;
