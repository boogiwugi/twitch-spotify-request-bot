module.exports = {
  spec: ['test/**/*.ts'],
  require: [
    'ts-node/register/transpile-only',
    'tsconfig-paths/register',
    'source-map-support/register',
  ],
  recursive: true,
  ui: 'tdd',
  'watch-files': ['src/**/*.ts', 'test/**/*.ts'],
};
