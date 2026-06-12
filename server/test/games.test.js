'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { GameCollection } = require('../games.js');

function mockSocket() {
  const handlers = {};
  return {
    received: [],
    disconnected: false,
    emit(event, data) { this.received.push({ event, data }); },
    on(event, cb) { handlers[event] = cb; },
    trigger(event, data) { if (handlers[event]) handlers[event](data); },
    disconnect() { this.disconnected = true; }
  };
}

describe('GameCollection', () => {
  it('cria jogo com id unico', () => {
    const gc = new GameCollection();
    assert.equal(gc.createGame('sala1'), true);
  });

  it('rejeita id duplicado', () => {
    const gc = new GameCollection();
    gc.createGame('sala1');
    assert.equal(gc.createGame('sala1'), false);
  });

  it('retorna jogo criado com getGame', () => {
    const gc = new GameCollection();
    gc.createGame('sala1');
    assert.ok(gc.getGame('sala1') !== undefined);
  });

  it('remove jogo existente', () => {
    const gc = new GameCollection();
    gc.createGame('sala1');
    assert.equal(gc.removeGame('sala1'), true);
    assert.equal(gc.getGame('sala1'), undefined);
  });

  it('retorna false ao remover jogo inexistente', () => {
    const gc = new GameCollection();
    assert.equal(gc.removeGame('nao-existe'), false);
  });
});

describe('Game.addPlayer', () => {
  it('aceita primeiro jogador', () => {
    const gc = new GameCollection();
    gc.createGame('sala1');
    const game = gc.getGame('sala1');
    assert.equal(game.addPlayer(mockSocket()), true);
  });

  it('aceita segundo jogador', () => {
    const gc = new GameCollection();
    gc.createGame('sala1');
    const game = gc.getGame('sala1');
    game.addPlayer(mockSocket());
    assert.equal(game.addPlayer(mockSocket()), true);
  });

  it('rejeita terceiro jogador', () => {
    const gc = new GameCollection();
    gc.createGame('sala1');
    const game = gc.getGame('sala1');
    game.addPlayer(mockSocket());
    game.addPlayer(mockSocket());
    assert.equal(game.addPlayer(mockSocket()), false);
  });

  it('notifica AMBOS os jogadores com player-connected ao conectar', () => {
    const gc = new GameCollection();
    gc.createGame('sala1');
    const game = gc.getGame('sala1');

    const player0 = mockSocket();
    const player1 = mockSocket();

    game.addPlayer(player0);
    game.addPlayer(player1);

    const p0Notified = player0.received.some(e => e.event === 'player-connected');
    const p1Notified = player1.received.some(e => e.event === 'player-connected');

    assert.ok(p0Notified, 'player 0 deveria receber player-connected');
    assert.ok(p1Notified, 'player 1 deveria receber player-connected'); // BUG: nao recebe
  });
});

describe('Game.getId', () => {
  it('retorna o id da partida', () => {
    const gc = new GameCollection();
    gc.createGame('sala-id');
    const game = gc.getGame('sala-id');
    assert.equal(game.getId(), 'sala-id');
  });
});

describe('Game - encaminhamento de eventos', () => {
  it('encaminha evento do jogador 0 para o jogador 1', () => {
    const gc = new GameCollection();
    gc.createGame('sala-ev');
    const game = gc.getGame('sala-ev');
    const p0 = mockSocket();
    const p1 = mockSocket();
    game.addPlayer(p0);
    game.addPlayer(p1);

    p0.trigger('event', 'high-kick');

    assert.ok(
      p1.received.some(e => e.event === 'event' && e.data === 'high-kick'),
      'jogador 1 deveria receber o evento do jogador 0'
    );
  });
});

describe('Game.endGame', () => {
  it('desconecta o oponente e remove a partida quando um jogador sai', () => {
    const gc = new GameCollection();
    gc.createGame('sala-end');
    const game = gc.getGame('sala-end');
    const p0 = mockSocket();
    const p1 = mockSocket();
    game.addPlayer(p0);
    game.addPlayer(p1);

    p0.trigger('disconnect');

    assert.equal(p1.disconnected, true, 'oponente deveria ser desconectado');
    assert.equal(gc.getGame('sala-end'), undefined, 'partida deveria ser removida');
  });
});
