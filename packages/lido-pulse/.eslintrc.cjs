module.exports = {
  extends: ['../../.eslintrc.base.json'],
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.build.json'],
    tsconfigRootDir: __dirname,
  },
  rules: {
    'no-console': 'off',
    'import/no-unresolved': 'off',
    'no-floating-promises': 'off',
  },
};
