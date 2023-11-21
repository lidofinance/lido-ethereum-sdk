module.exports = {
  extends: ['../../.eslintrc.base.json'],
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.build.json'],
    tsconfigRootDir: __dirname,
  },
};
