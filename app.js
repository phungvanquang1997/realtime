var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const port = process.env.PORT || 3001

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

var server = require("http").createServer(app);
var io = require("socket.io")(server);

server.listen(port, () => {
  console.log(`server port: ${port}`);
})

io.on('connection', function (socket) {
  console.log('connected');

  socket.on('join_room', (room) => {
    socket.join(room)
  });

  socket.on('say',function(data){
    io.to(data.room).emit('message',data.message);
  })

  socket.on('error', function (err) {
    console.log(err);
  });
});

console.log(io.sockets.rooms);

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
