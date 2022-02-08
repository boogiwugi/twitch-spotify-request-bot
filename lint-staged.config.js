module.exports = {
  '*.{js,ts}': ['eslint --fix', 'prettier -c --write'],
  '*.{yml,yaml,md,json}': ['prettier -c --write'],
};
