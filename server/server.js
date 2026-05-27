var path = require('path'),
    express = require('express'),
    http = require('http'),
    socketIo = require('socket.io'),
    GameCollection = require('./games.js').GameCollection,
    app = express(),
    server = http.createServer(app),
    io = new socketIo.Server(server),
    games = new GameCollection(),
    host = process.env.HOST || '0.0.0.0',
    port = process.env.PORT || 55555;

app.use(express.static(path.join(__dirname, '..', 'game')));

var Responses = {
    SUCCESS: 0,
    GAME_EXISTS: 1,
    GAME_NOT_EXISTS: 2,
    GAME_FULL: 3
  },
  Requests = {
    CREATE_GAME: 'create-game',
    JOIN_GAME: 'join-game'
  };

io.on('connection', function (socket) {
  socket.on(Requests.CREATE_GAME, function (gameName) {
    if (games.createGame(gameName)) {
      games.getGame(gameName).addPlayer(socket);
      socket.emit('response', Responses.SUCCESS);
    } else {
      socket.emit('response', Responses.GAME_EXISTS);
    }
  });
  socket.on(Requests.JOIN_GAME, function (gameName) {
    var game = games.getGame(gameName);
    if (!game) {
      socket.emit('response', Responses.GAME_NOT_EXISTS);
    } else {
      if (game.addPlayer(socket)) {
        socket.emit('response', Responses.SUCCESS);
      } else {
        socket.emit('response', Responses.GAME_FULL);
      }
    }
  });
});

if (require.main === module) {
  server.listen(port, host, function () {
    console.log('Servidor mk.js rodando em http://' + host + ':' + port);
  });
}

module.exports = {
  app: app,
  server: server,
  io: io,
  Responses: Responses,
  Requests: Requests
};
