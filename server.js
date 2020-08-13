const express = require('express');
const path = require('path');
const socket = require('socket.io');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const messages = [];
let users = [];

app.use(express.static(path.join(__dirname, '/client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client//index.html'));
});

app.use((req, res) => {
  res.status(404).send('404 not found...');
})

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running on port: 8000');
}); 

const io = socket(server);

io.on('connection', socket => {
  console.log('New client. Its id – ' + socket.id);

  socket.on('join', user => {
    console.log("I've got a new user logged in - " + user);

    const newUser = { name: user, id: socket.id };
    users.push(newUser);

    socket.broadcast.emit('join', newUser.name);
  });

  socket.on('message', message => {
    console.log("Oh, I've got something from " + socket.id);

    messages.push(message);

    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('Socket ' + socket.id + ' has left');

    const leavingUser = users.find(user => user.id === socket.id);

    users = users.filter(user => user.id !== socket.id);

    socket.broadcast.emit('leave', leavingUser.name);
  });
});
