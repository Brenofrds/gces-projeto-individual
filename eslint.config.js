var { createRequire } = require('node:module');

var requireFromServer = createRequire(
  require.resolve('./server/package.json')
);
var js = requireFromServer('@eslint/js');
var pluginSecurity = requireFromServer('eslint-plugin-security');

module.exports = [
  js.configs.recommended,

  {
    files: ['server/*.js'],
    plugins: pluginSecurity.configs.recommended.plugins,
    rules: pluginSecurity.configs.recommended.rules,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        exports: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
        __dirname: 'readonly'
      }
    }
  },

  {
    files: ['game/src/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        name: 'readonly',
        alert: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Movement: 'readonly',
        io: 'readonly'
      }
    }
  }
];
