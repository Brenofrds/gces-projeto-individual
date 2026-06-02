'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fc = require('fast-check');
const { GameCollection } = require('./games.js');

function mockSocket() {
  return {
    emit() {},
    on() {},
    disconnect() {}
  };
}

describe('GameCollection - fuzzing', () => {
  it('createGame nao crasha com qualquer string como id', () => {
    fc.assert(fc.property(fc.string(), (id) => {
      const gc = new GameCollection();
      const result = gc.createGame(id);
      assert.ok(result === true || result === false);
    }));
  });

  it('createGame retorna false na segunda chamada com mesmo id', () => {
    fc.assert(fc.property(fc.string(), (id) => {
      const gc = new GameCollection();
      gc.createGame(id);
      const second = gc.createGame(id);
      assert.equal(second, false);
    }));
  });

  it('removeGame nao crasha com id inexistente', () => {
    fc.assert(fc.property(fc.string(), (id) => {
      const gc = new GameCollection();
      const result = gc.removeGame(id);
      assert.equal(result, false);
    }));
  });

  it('addPlayer rejeita terceiro jogador sem lancar excecao', () => {
    fc.assert(fc.property(fc.string(), (id) => {
      const gc = new GameCollection();
      gc.createGame(id);
      const game = gc.getGame(id);
      game.addPlayer(mockSocket());
      game.addPlayer(mockSocket());
      const result = game.addPlayer(mockSocket());
      assert.equal(result, false);
    }));
  });
});
