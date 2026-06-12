'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { GameCollection } = require('../games.js');

function mockSocket() {
  return {
    received: [],
    emit(event, data) { this.received.push({ event, data }); },
    on() {},
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
