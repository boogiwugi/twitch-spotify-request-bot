module.exports = {
  spec: ['test/**/*.spec.ts'],
  require: [
    'ts-node/register/transpile-only',
    'tsconfig-paths/register',
    'source-map-support/register',
  ],
  recursive: true,
  'watch-files': ['src/**/*.ts', 'test/**/*.ts'],
};
