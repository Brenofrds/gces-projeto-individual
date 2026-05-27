var Pool = require('pg').Pool,
    pool = null;

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  return pool;
}

function initialize() {
  var activePool = getPool();

  if (!activePool) {
    return Promise.resolve();
  }

  return activePool.query([
    'CREATE TABLE IF NOT EXISTS game_history (',
    'id SERIAL PRIMARY KEY,',
    'game_name VARCHAR(120) NOT NULL,',
    'created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()',
    ')'
  ].join(' '));
}

function validateGameName(gameName) {
  if (typeof gameName !== 'string' || !gameName.trim()) {
    var error = new Error('gameName deve ser uma string nao vazia');
    error.statusCode = 400;
    throw error;
  }

  return gameName.trim().slice(0, 120);
}

function saveGameHistory(gameName) {
  var activePool = getPool(),
      normalizedGameName = validateGameName(gameName);

  if (!activePool) {
    return Promise.resolve({
      game_name: normalizedGameName,
      persisted: false
    });
  }

  return activePool.query(
    'INSERT INTO game_history (game_name) VALUES ($1) RETURNING id, game_name, created_at',
    [normalizedGameName]
  ).then(function (result) {
    return result.rows[0];
  });
}

function listGameHistory() {
  var activePool = getPool();

  if (!activePool) {
    return Promise.resolve([]);
  }

  return activePool.query(
    'SELECT id, game_name, created_at FROM game_history ORDER BY created_at DESC LIMIT 20'
  ).then(function (result) {
    return result.rows;
  });
}

module.exports = {
  initialize: initialize,
  saveGameHistory: saveGameHistory,
  listGameHistory: listGameHistory
};
