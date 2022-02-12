module.exports = {
  spec: ['src/**/*/*.spec.ts'],
  require: [
    'ts-node/register/transpile-only',
    'tsconfig-paths/register',
    'source-map-support/register',
  ],
  recursive: true,
  'watch-files': ['src/**/*.ts', 'src/**/*.ts'],
};
