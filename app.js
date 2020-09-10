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
const users = [];

deleteUserOnline = (userId) => {
   users.forEach(function (user, key) {
      if (user.user_id == userId) {
        users.splice(key, 1)
      }
   })
}

server.listen(port, () => {
  console.log(`server port: ${port}`);
})

io.on('connection', function (socket) {
  console.log('connected');
  io.emit('totalOnline', Object.keys(io.sockets.sockets).length);

  socket.on('join_room', (room) => {
    socket.join(room)
  });

  socket.on('error', function (err) {
    console.log(err);
  });

  socket.on('login', (data) => {
    socket.user_id = data.user_id
    socket.user_name = data.user_name
    users.push({'user_id': data.user_id, 'user_name': data.user_name})
    io.emit('userOnline', users)
  });

  socket.on('disconnect', () => {
    console.log(socket.user_id + ' is disconnected')
    socket.broadcast.emit('userOffline', {user_id: socket.user_id, user_name: socket.user_name})
  })

  socket.on('typing', (data) => {
    socket.to(data.room).emit('display', data)
  });

  socket.on('createChatRoom', (data) => {
    if (data.room && data.to_user) {
      socket.join(data.room)
      //emit event cho user còn lại để tham gia room
      socket.broadcast.emit('joinToChat', data)
    }
  })

  socket.on('sendMessage', (data) => {
    if (data) {
      socket.to(data.room).emit('receiveMessage', data)
    }
  })

  socket.on('chatWithSomeone', (data) => {
    if (data.sender) {
      socket.join(data.sender)
      socket.broadcast.emit('chat-with-someone', data)
    }
  })

  socket.on('disconnect', () => {
    deleteUserOnline(socket.user_id)
  })

  // sending to the client
  socket.emit('hello', 'can you hear me?', 1, 2, 'abc');

  // sending to all clients except sender
  socket.broadcast.emit('broadcast', 'hello friends!');

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
